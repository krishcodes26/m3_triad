'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './providers';

export default function HomePage() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace(session ? '/dashboard' : '/auth/login');
    }
  }, [session, loading, router]);

  return null;
}
