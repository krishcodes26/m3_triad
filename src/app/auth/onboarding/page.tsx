'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import {
  createUserProfile,
  createCharacterProgress,
  initializeVectorProgress,
  createMission,
} from '@/lib/supabase';
import styles from './page.module.css';

type Step = 'profile' | 'goals' | 'success';

interface ProfileData {
  displayName: string;
  timezone: string;
}

interface GoalData {
  mind: string;
  money: string;
  muscle: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { session, loading: authLoading, user } = useAuth();
  const [step, setStep] = useState<Step>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Profile Step
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: user?.user_metadata?.full_name || '',
    timezone: 'UTC',
  });

  // Goals Step
  const [goalData, setGoalData] = useState<GoalData>({
    mind: '',
    money: '',
    muscle: '',
  });

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/auth/login');
    }
  }, [session, authLoading, router]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGoalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('User not found');
      setLoading(false);
      return;
    }

    try {
      // Create user profile
      const { error: profileError } = await createUserProfile(user.id, {
        display_name: profileData.displayName,
        timezone: profileData.timezone,
      });

      if (profileError) {
        setError('Failed to create profile: ' + profileError.message);
        setLoading(false);
        return;
      }

      // Create character progress
      const { error: charError } = await createCharacterProgress(user.id);

      if (charError) {
        setError('Failed to initialize character: ' + charError.message);
        setLoading(false);
        return;
      }

      // Initialize vector progress for all three vectors
      const { error: vecError } = await initializeVectorProgress(user.id);

      if (vecError) {
        setError('Failed to initialize vectors: ' + vecError.message);
        setLoading(false);
        return;
      }

      setStep('goals');
      setLoading(false);
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleGoalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('User not found');
      setLoading(false);
      return;
    }

    try {
      // Create initial missions for each vector
      const vectors: Array<{ key: keyof GoalData; vector: 'mind' | 'money' | 'muscle' }> = [
        { key: 'mind', vector: 'mind' },
        { key: 'money', vector: 'money' },
        { key: 'muscle', vector: 'muscle' },
      ];

      let hasError = false;

      for (const { key, vector } of vectors) {
        if (goalData[key].trim()) {
          const { error: missError } = await createMission(user.id, {
            title: goalData[key],
            vector,
            status: 'active',
            description: `Initial ${vector} goal from onboarding`,
          });

          if (missError) {
            setError(`Failed to create ${vector} goal: ${missError.message}`);
            hasError = true;
            break;
          }
        }
      }

      if (hasError) {
        setLoading(false);
        return;
      }

      setStep('success');
      setLoading(false);

      // Redirect to dashboard after showing success
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {step === 'profile' && (
          <div className={styles.stepContainer}>
            <div className={styles.header}>
              <h1 className={styles.title}>Let's Get Started</h1>
              <p className={styles.subtitle}>Tell us a bit about yourself</p>
              <div className={styles.progress}>
                <span className={styles.progressStep}>Step 1 of 2</span>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="displayName" className={styles.label}>
                  Display Name <span className={styles.required}>*</span>
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="How should we call you?"
                  value={profileData.displayName}
                  onChange={handleProfileChange}
                  disabled={loading}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="timezone" className={styles.label}>
                  Timezone <span className={styles.required}>*</span>
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  value={profileData.timezone}
                  onChange={handleProfileChange}
                  disabled={loading}
                  className={styles.select}
                  required
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Central European Time</option>
                  <option value="Asia/Tokyo">Japan Standard Time</option>
                  <option value="Asia/Hong_Kong">Hong Kong Time</option>
                  <option value="Asia/Singapore">Singapore Time</option>
                  <option value="Australia/Sydney">Australian Eastern Time</option>
                </select>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button
                type="submit"
                className={styles.button}
                disabled={loading}
              >
                {loading ? 'Setting Up...' : 'Continue'}
              </button>
            </form>
          </div>
        )}

        {step === 'goals' && (
          <div className={styles.stepContainer}>
            <div className={styles.header}>
              <h1 className={styles.title}>Define Your Triads</h1>
              <p className={styles.subtitle}>
                What do you want to achieve? Set a goal for each area of your life.
              </p>
              <div className={styles.progress}>
                <span className={styles.progressStep}>Step 2 of 2</span>
              </div>
            </div>

            <form onSubmit={handleGoalsSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="mind" className={styles.label}>
                  🧠 Mind <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  id="mind"
                  name="mind"
                  placeholder="e.g., Learn machine learning and build an AI project"
                  value={goalData.mind}
                  onChange={handleGoalChange}
                  disabled={loading}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="money" className={styles.label}>
                  💰 Money <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  id="money"
                  name="money"
                  placeholder="e.g., Launch a side project and earn $1000"
                  value={goalData.money}
                  onChange={handleGoalChange}
                  disabled={loading}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="muscle" className={styles.label}>
                  💪 Muscle <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  id="muscle"
                  name="muscle"
                  placeholder="e.g., Build strength and achieve a 100kg deadlift"
                  value={goalData.muscle}
                  onChange={handleGoalChange}
                  disabled={loading}
                  className={styles.textarea}
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button
                type="submit"
                className={styles.button}
                disabled={loading || !goalData.mind && !goalData.money && !goalData.muscle}
              >
                {loading ? 'Finalizing...' : 'Create Character'}
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>✨</div>
            <h1 className={styles.successTitle}>Character Created!</h1>
            <p className={styles.successMessage}>
              Welcome to M3 Triad, {profileData.displayName}!
            </p>
            <p className={styles.successSubtitle}>
              Redirecting to your dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
