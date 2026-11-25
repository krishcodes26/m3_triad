'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, verifyOtp, sendOtp } from '@/lib/supabase';
import { enableDemoMode, disableDemoMode } from '@/lib/demo';
import styles from './page.module.css';

// ── Demo credentials (design inspection only) ──────────────────────────────
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL || 'demo@m3triad.dev';
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'Demo@12345!';

type Step = 'login' | 'otp';

interface FormErrors {
  email?: string;
  password?: string;
  otp?: string;
  submit?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Step 1: Password login ──────────────────────────────────────────────────

  function validateLogin(): boolean {
    const e: FormErrors = {};
    if (!email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Enter a valid email address';
    }
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoading(true);
    setErrors({});

    const { data, error } = await signIn(email, password);

    if (error) {
      setErrors({ submit: 'Invalid email or password.' });
      setLoading(false);
      return;
    }

    // Password verified — now send OTP for second factor
    // We use signInWithOtp which sends a magic-link/OTP to the email
    const { error: otpError } = await sendOtp(email);
    if (otpError) {
      // Some Supabase configs auto-verify on signInWithPassword; go straight to dashboard
      router.push('/dashboard');
      return;
    }

    setLoading(false);
    setStep('otp');
    setResendCooldown(60);
  }

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setErrors((prev) => ({ ...prev, otp: undefined }));
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { if (i < 6) next[i] = ch; });
    setOtp(next);
    const focusAt = Math.min(pasted.length, 5);
    otpRefs.current[focusAt]?.focus();
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const token = otp.join('');
    if (token.length < 6) {
      setErrors({ otp: 'Enter all 6 digits' });
      return;
    }
    setLoading(true);
    setErrors({});

    const { error } = await verifyOtp(email, token, 'email');

    if (error) {
      setErrors({ otp: error.message.includes('expired') ? 'Code expired — request a new one' : 'Invalid code, please try again' });
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  async function handleDemoLogin() {
    setLoading(true);
    setErrors({});

    // 1. Prefer the real hosted demo account when one exists.
    let signedIn = false;
    try {
      const { error } = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
      signedIn = !error;
    } catch {
      signedIn = false;
    }

    if (signedIn) {
      disableDemoMode();
      router.push('/dashboard');
      return;
    }

    // 2. No reachable Supabase demo user (missing account, unconfirmed email
    //    or a rate-limited mailbox). Open the self-contained local demo so
    //    the button always works — data lives in the browser.
    console.warn('Supabase demo sign-in failed; opening the local demo instead.');
    enableDemoMode();
    // Full navigation so AuthProvider picks the demo session up on mount.
    window.location.assign('/dashboard');
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setLoading(true);
    await sendOtp(email);
    setOtp(['', '', '', '', '', '']);
    setErrors({});
    setLoading(false);
    setResendCooldown(60);
    otpRefs.current[0]?.focus();
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (step === 'otp') {
    const filled = otp.filter(Boolean).length;

    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>Check Your Email</h1>
            <p className={styles.subtitle}>
              We sent a 6-digit code to<br />
              <strong>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className={styles.form}>
            <div className={styles.otpRow} onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={loading}
                  className={`${styles.otpBox} ${errors.otp ? styles.otpBoxError : ''} ${digit ? styles.otpBoxFilled : ''}`}
                  aria-label={`Digit ${i + 1}`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {errors.otp && <p className={styles.fieldError}>{errors.otp}</p>}

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={loading || filled < 6}
            >
              {loading ? 'Verifying…' : 'Verify & Sign In'}
            </button>

            <div className={styles.resendRow}>
              <span className={styles.resendText}>Didn't receive it?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className={styles.resendBtn}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setStep('login'); setOtp(['', '', '', '', '', '']); setErrors({}); }}
              className={styles.backBtn}
            >
              ← Back to sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              disabled={loading}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            />
            {errors.email && <p className={styles.fieldError}>{errors.email}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              disabled={loading}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            />
            {errors.password && <p className={styles.fieldError}>{errors.password}</p>}
          </div>

          {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Signing In…' : 'Sign In'}
          </button>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className={styles.demoBtn}
          >
            🔍 Quick Access (Demo Account)
          </button>

          <p className={styles.switchLink}>
            Don't have an account?{' '}
            <Link href="/auth/register" className={styles.link}>Create One</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
