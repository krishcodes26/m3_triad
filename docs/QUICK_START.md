# M3 Triad — Quick Start Guide

> Get up and running in 5 minutes

## 1. Install Dependencies
```bash
npm install
```

## 2. Run Dev Server
```bash
npm run dev
```

Application will be available at `http://localhost:3000`

## 3. Test the Full Flow (5 Minutes)

### Step A: Register (1 min)
1. Go to `http://localhost:3000/auth/register`
2. Enter:
   - Full Name: "Test User"
   - Email: "test@example.com" (use unique email each time)
   - Password: "password123"
   - Confirm: "password123"
3. Click "Create Account"
4. Auto-redirects to onboarding

### Step B: Onboarding (2 min)
1. Fill Profile:
   - Display Name: "Test User"
   - Timezone: "UTC"
2. Click "Continue"
3. Fill Goals (optional but recommended):
   - Mind: "Learn React"
   - Money: "Build a startup"
   - Muscle: "Get fit"
4. Click "Create Character"
5. Auto-redirects to dashboard

### Step C: Dashboard (1 min)
1. See welcome message with your name
2. See character level, rank, XP
3. See tri-vector progress
4. Click "Sign Out"

### Step D: Login (1 min)
1. At login page, enter email and password from registration
2. Click "Sign In"
3. See same dashboard data
4. ✅ Success! All flows working.

## Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Check for TypeScript errors
npx tsc --noEmit

# Run linter
npm run lint
```

## Routes

| Path | Purpose |
|------|---------|
| `/` | Home (auto-redirects) |
| `/auth/register` | Register |
| `/auth/login` | Login |
| `/auth/onboarding` | Onboarding (after register) |
| `/dashboard` | Main app (protected) |

## Useful Files

**Setup Instructions:** See `IMPLEMENTATION_GUIDE.md`

**Detailed Tests:** See `TESTING_CHECKLIST.md` for 100+ test scenarios

**High-Level Overview:** See `BUILD_SUMMARY.md`

**Design Standards:** See `DESIGN_SYSTEM.md`

**Database Schema:** See `DATA_MODEL.md`

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-public-key
```

These are already set in the project.

## Troubleshooting

**Missing Supabase keys?**
→ Check `.env.local` file and restart server

**"Email already in use"?**
→ Use a different test email or delete user from Supabase dashboard

**Styling looks wrong?**
→ Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

**Can't login?**
→ Make sure you completed registration first (creates auth user)

**Dashboard shows error?**
→ Check browser console (F12) for specific error message

## What's Implemented

✅ Registration form with validation  
✅ Onboarding wizard (profile + goals)  
✅ Login form with error handling  
✅ Protected dashboard  
✅ User profile storage  
✅ Character/vector initialization  
✅ Mission creation from goals  
✅ Full design system  
✅ Responsive design  
✅ Real database integration  

## What's Next

The dashboard is a placeholder. Next phases:

1. **Missions page** — Create and manage goals/tasks
2. **Habits page** — Track daily habits with streaks
3. **Workouts page** — Log exercises and track PRs
4. **Nutrition page** — Log meals and macros
5. **Calendar page** — View activities by date
6. **Analytics page** — Charts and progress tracking
7. **Profile page** — Customize character, view XP ledger
8. **Notifications** — Real-time alerts and updates

## Key Features

**Security:**
- Supabase Auth handles passwords
- Row Level Security on all tables
- Session tokens in HTTP-only cookies

**Design:**
- Follows M3 Triad design system
- Responsive (mobile, tablet, desktop)
- Accessible (WCAG 2.2 AA)

**Data:**
- Real Supabase integration
- PostgreSQL database
- Automatic RLS enforcement

## Need Help?

1. Check `IMPLEMENTATION_GUIDE.md` for detailed setup
2. Run test scenarios from `TESTING_CHECKLIST.md`
3. Review `BUILD_SUMMARY.md` for overview
4. See `DESIGN_SYSTEM.md` for visual guidelines
5. Check browser console (F12) for errors

## Quick Browser Console Commands

```javascript
// Check current user
const { data } = await supabase.auth.getSession();
console.log(data.session?.user?.email);

// Sign out
await supabase.auth.signOut();

// Get current user ID
const { data: { user } } = await supabase.auth.getUser();
console.log(user?.id);
```

## Notes

- Each test should use a **unique email** (e.g., test+1@example.com, test+2@example.com)
- All data is stored in real Supabase database (not mock)
- Sessions persist across page reloads
- Forms have full validation
- Errors are descriptive and actionable

---

**Ready to start?** Run `npm run dev` and go to `http://localhost:3000` 🚀
