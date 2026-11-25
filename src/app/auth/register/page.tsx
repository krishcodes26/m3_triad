'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp, verifyOtp } from '@/lib/supabase';
import styles from './page.module.css';

type Step = 'register' | 'otp';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
  submit?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // 6 individual OTP digit inputs
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Step 1: Register ────────────────────────────────────────────────────────

  function validateRegister(): boolean {
    const e: FormErrors = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Enter a valid email address';
    }
    if (!password) {
      e.password = 'Password is required';
    } else if (password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) {
      e.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!validateRegister()) return;
    setLoading(true);
    setErrors({});

    const { data, error } = await signUp(email, password, fullName);

    if (error) {
      setErrors({ submit: error.message });
      setLoading(false);
      return;
    }

    // Supabase sends OTP/confirmation email automatically on signUp
    setLoading(false);
    setStep('otp');
    setResendCooldown(60);
  }

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────

  function handleOtpChange(index: number, value: string) {
    // Only accept a single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setErrors((prev) => ({ ...prev, otp: undefined }));

    // Auto-advance to next box
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
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
    // Focus the box after the last pasted digit
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

    const { data, error } = await verifyOtp(email, token, 'signup');

    if (error) {
      setErrors({ otp: error.message.includes('expired') ? 'Code expired — request a new one' : 'Invalid code, please try again' });
      setLoading(false);
      return;
    }

    // Verified — go to dashboard
    router.push('/dashboard');
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setLoading(true);
    // Re-call signUp; Supabase resends the confirmation OTP
    await signUp(email, password, fullName);
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
              {loading ? 'Verifying…' : 'Verify & Continue'}
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
              onClick={() => { setStep('register'); setOtp(['', '', '', '', '', '']); setErrors({}); }}
              className={styles.backBtn}
            >
              ← Change email
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
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Start your Mind · Money · Muscle journey</p>
        </div>

        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="fullName" className={styles.label}>Full Name</label>
            <input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: undefined })); }}
              disabled={loading}
              className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
            />
            {errors.fullName && <p className={styles.fieldError}>{errors.fullName}</p>}
          </div>

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
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              disabled={loading}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            />
            {errors.password && <p className={styles.fieldError}>{errors.password}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
              disabled={loading}
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
            />
            {errors.confirmPassword && <p className={styles.fieldError}>{errors.confirmPassword}</p>}
          </div>

          {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>

          <p className={styles.switchLink}>
            Already have an account?{' '}
            <Link href="/auth/login" className={styles.link}>Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
