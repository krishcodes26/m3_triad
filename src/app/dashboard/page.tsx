'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import AppShell from '@/components/layouts/AppShell';
import styles from './page.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) router.push('/auth/login');
  }, [session, loading, router]);

  if (loading) return null;
  if (!session) return null;

  const name =
    session.user.user_metadata?.full_name ||
    session.user.email?.split('@')[0] ||
    'Traveler';

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>Dashboard</span>
            <h1 className={styles.greeting}>Good day, {name}.</h1>
            <p className={styles.dateLine}>
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
        </header>
        <div className={styles.placeholder}>
          <p>Dashboard is being built. Navigate to <a href="/quests">Quests →</a></p>
        </div>
      </div>
    </AppShell>
  );
}
