'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { disableDemoMode } from '@/lib/demo';
import styles from './AppShell.module.css';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { href: '/quests',    label: 'Quests',     icon: QuestsIcon },
  { href: '/missions', label: 'Missions', icon: MissionsIcon },
  { href: '/habits', label: 'Habits', icon: HabitsIcon },
  { href: '/workout', label: 'Workout', icon: WorkoutIcon },
  { href: '/nutrition', label: 'Nutrition', icon: NutritionIcon },
  { href: '/analytics', label: 'Analytics', icon: AnalyticsIcon },
  { href: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { href: '/notifications', label: 'Notifications', icon: NotificationsIcon },
  { href: '/profile', label: 'Profile', icon: ProfileIcon },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDemo } = useAuth();

  function exitDemo() {
    disableDemoMode();
    router.replace('/auth/login');
  }

  return (
    <div className={styles.shell}>
      <nav className={styles.sidebar} aria-label="Main navigation">
        {/* Wordmark */}
        <div className={styles.brand}>
          <span className={styles.wordmark}>M3 TRIAD</span>
          <span className={styles.levelBadge}>LV 24</span>
        </div>

        {/* Nav links */}
        <ul className={styles.navList} role="list">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className={styles.navIcon} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* XP / level panel */}
        <div className={styles.xpPanel}>
          <div className={styles.xpHeader}>
            <span className={styles.xpLabel}>XP PROGRESS</span>
            <span className={styles.xpValue}>3,420 / 4,096</span>
          </div>
          <div className={styles.xpTrack} role="progressbar" aria-valuenow={83} aria-valuemin={0} aria-valuemax={100} aria-label="Level 24 XP progress, 83%">
            <div className={styles.xpFill} style={{ width: '83%' }} />
          </div>
        </div>

        {/* Sync state */}
        <div className={styles.syncRow}>
          <span className={styles.syncDot} aria-hidden="true" />
          <span className={styles.syncText}>{isDemo ? 'Demo · local data' : 'Live · synced'}</span>
          {isDemo && (
            <button type="button" onClick={exitDemo} className={styles.demoExitBtn}>
              Exit demo
            </button>
          )}
        </div>
      </nav>

      <main className={styles.main} id="main-content">
        {children}
      </main>
    </div>
  );
}

/* ── Inline SVG icons ─────────────────────────────────────────────────────── */

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function QuestsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 1.75l2 4.5h4.5l-3.5 2.75 1.25 4.5L9 11l-4.25 2.5 1.25-4.5L2.5 6.25H7L9 1.75z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function MissionsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="9" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
    </svg>
  );
}

function HabitsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M5 9l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="1.75" y="1.75" width="14.5" height="14.5" rx="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function WorkoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 9h2M14 9h2M4 9h10M4 6.5V11.5M14 6.5V11.5M1 7.5V10.5M17 7.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function NutritionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M6 2v5.5a3 3 0 006 0V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 7.5V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 2c0 3-1.5 4-1.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 14l4-4 3 3 4-5 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="1.75" y="1.75" width="14.5" height="14.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1.75" y="3.75" width="14.5" height="12.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1.75 7.75h14.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 1.75V5.25M12 1.75V5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function NotificationsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2a5.5 5.5 0 015.5 5.5c0 2.5.75 3.5 1.5 4.5H2c.75-1 1.5-2 1.5-4.5A5.5 5.5 0 019 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7.25 15a1.75 1.75 0 003.5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="6" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 16c0-3.038 2.91-5.5 6.5-5.5s6.5 2.462 6.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
