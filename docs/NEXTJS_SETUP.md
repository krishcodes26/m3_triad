# M3 Triad — Next.js Setup Guide

## Prerequisites

Ensure you have:
- Node.js 18+ installed
- Your `.env.local` file with Supabase credentials ✅
- Database fully set up ✅
- TypeScript types generated ✅

---

## Step 1: Initialize Next.js Project

```bash
# If you haven't already created a Next.js app
npm create next-app@latest m3-triad -- \
  --typescript \
  --tailwind \
  --eslint \
  --app

cd m3-triad
```

Or if you have an existing project, ensure your `package.json` has:

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/ssr": "^0.12.7",
    "@supabase/supabase-js": "^2.119.2"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0"
  }
}
```

Install dependencies:

```bash
npm install
```

---

## Step 2: Verify Supabase Connection

Create a quick test page to verify everything works:

**`src/app/test/page.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/supabase';

export default function TestPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    checkConnection();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Supabase Connection Test</h1>
      {user ? (
        <div className="mt-4">
          <p className="text-green-600">✅ Connected!</p>
          <pre className="bg-gray-100 p-4 mt-2 rounded">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      ) : (
        <p className="mt-4 text-gray-600">Not authenticated. Sign up or sign in to continue.</p>
      )}
    </div>
  );
}
```

Run:

```bash
npm run dev
```

Visit `http://localhost:3000/test` to verify the connection.

---

## Step 3: Set Up Authentication Layout

Create a provider component for Supabase auth:

**`src/app/providers.tsx`**

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**`src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './providers';

export const metadata: Metadata = {
  title: 'M3 Triad',
  description: 'Your personal operating system for Mind, Money, and Muscle',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## Step 4: Create Authentication Pages

**`src/app/auth/signup/page.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/supabase';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await signUp(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Redirect to onboarding or dashboard
      router.push('/onboarding');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">M3 Triad</h1>
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={loading}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/auth/signin" className="text-purple-600 hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
```

**`src/app/auth/signin/page.tsx`** (similar structure)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/supabase';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome Back</h1>
        
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={loading}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/auth/signup" className="text-purple-600 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
```

---

## Step 5: Create Dashboard Skeleton

**`src/app/dashboard/page.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { getCharacterProgress, getVectorProgress, getMissions } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [character, setCharacter] = useState<any>(null);
  const [vectors, setVectors] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/auth/signin');
      return;
    }

    async function loadData() {
      if (!session?.user.id) return;

      const [charRes, vecRes, missRes] = await Promise.all([
        getCharacterProgress(session.user.id),
        getVectorProgress(session.user.id),
        getMissions(session.user.id),
      ]);

      setCharacter(charRes.data);
      setVectors(vecRes.data);
      setMissions(missRes.data || []);
      setLoading(false);
    }

    loadData();
  }, [session, authLoading, router]);

  if (authLoading || loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">M3 Triad Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {character && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Character Progress</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Level</p>
                <p className="text-3xl font-bold">{character.level}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Rank</p>
                <p className="text-3xl font-bold">{character.rank}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total XP</p>
                <p className="text-3xl font-bold">{character.total_xp}</p>
              </div>
            </div>
          </div>
        )}

        {vectors && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Tri-Vector Progress</h2>
            <div className="grid grid-cols-3 gap-4">
              {vectors.map((v: any) => (
                <div key={v.vector} className="border rounded p-4">
                  <p className="font-semibold capitalize">{v.vector}</p>
                  <p className="text-gray-600">Level: {v.level}</p>
                  <p className="text-gray-600">XP: {v.xp}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Missions</h2>
          {missions.length > 0 ? (
            <ul className="space-y-2">
              {missions.slice(0, 5).map((m: any) => (
                <li key={m.id} className="border-l-4 border-purple-600 pl-4 py-2">
                  <p className="font-semibold">{m.title}</p>
                  <p className="text-sm text-gray-600">{m.status}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No missions yet. Create one to get started!</p>
          )}
        </div>
      </main>
    </div>
  );
}
```

---

## Step 6: Configure TypeScript Path Aliases

**`tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

## Step 7: Run Your App

```bash
npm run dev
```

Navigate to:
- `http://localhost:3000/auth/signup` - Create account
- `http://localhost:3000/auth/signin` - Login
- `http://localhost:3000/dashboard` - View dashboard (protected)

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with AuthProvider
│   ├── providers.tsx              # Auth context provider
│   ├── page.tsx                   # Home/landing page
│   ├── auth/
│   │   ├── signup/page.tsx        # Sign up form
│   │   └── signin/page.tsx        # Sign in form
│   ├── dashboard/page.tsx         # Main dashboard (protected)
│   ├── missions/page.tsx          # Missions page (TODO)
│   ├── habits/page.tsx            # Habits page (TODO)
│   ├── workouts/page.tsx          # Workouts page (TODO)
│   ├── nutrition/page.tsx         # Nutrition page (TODO)
│   ├── calendar/page.tsx          # Calendar page (TODO)
│   ├── analytics/page.tsx         # Analytics page (TODO)
│   ├── profile/page.tsx           # Profile page (TODO)
│   └── globals.css                # Tailwind styles
├── lib/
│   └── supabase.ts                # Supabase client & utils ✅
├── types/
│   └── database.ts                # TypeScript types ✅
└── components/
    ├── Navigation.tsx             # Sidebar navigation (TODO)
    ├── Header.tsx                 # Top header (TODO)
    └── ...                        # Other components
```

---

## Next Steps

1. ✅ Verify Supabase connection
2. ✅ Set up authentication
3. ✅ Build dashboard skeleton
4. Build main navigation/layout
5. Implement each feature page
6. Connect to design system (Tailwind/CSS modules)
7. Add real-time subscriptions
8. Deploy to Vercel

---

## Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Run linting
npm run lint

# Type check
npx tsc --noEmit
```

---

Good luck! 🚀
