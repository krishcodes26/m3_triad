# M3 Triad — URLs & Access Guide

## 🚀 Application is Live at: http://localhost:3000

---

## PUBLIC PAGES (No authentication required)

### 1. Home / Landing Page
**URL:** `http://localhost:3000`  
**Purpose:** Redirect hub  
**Behavior:**
- If not logged in → redirects to `/auth/login`
- If logged in → redirects to `/dashboard`

---

### 2. Login Page
**URL:** `http://localhost:3000/auth/login`  
**Purpose:** Sign in with existing account  

**Form Fields:**
- Email Address (required)
- Password (required)

**Buttons:**
- Sign In (primary)
- Forgot password? (link)
- Create One (link to registration)

**What happens after login:**
- Session created
- Automatic redirect to `/dashboard`
- Data persists across sessions

---

### 3. Registration Page
**URL:** `http://localhost:3000/auth/register`  
**Purpose:** Create new account  

**Form Fields:**
- Full Name (required)
- Email Address (required, must be unique)
- Password (required, 6+ characters)
- Confirm Password (required, must match)

**Buttons:**
- Create Account (primary)
- Sign In (link to login)

**What happens after registration:**
- Auth user created in Supabase
- Automatic redirect to `/auth/onboarding`
- Onboarding wizard starts

---

## AUTHENTICATED PAGES (Requires login)

### 4. Onboarding Page
**URL:** `http://localhost:3000/auth/onboarding`  
**Purpose:** Complete user setup  
**Access:** Only after successful registration  

**Step 1: Profile Setup**
- Display Name (pre-filled from registration)
- Timezone (selector with 11 options)
- Button: Continue

**Data Created:**
- user_profiles entry
- character_progress entry (Level 1, Novice)
- 3x vector_progress entries (Mind, Money, Muscle - Level 1 each)

**Step 2: Goal Definition**
- Mind Goal (optional, textarea)
- Money Goal (optional, textarea)
- Muscle Goal (optional, textarea)
- Button: Create Character

**Data Created:**
- 1-3 missions (depending on goals provided)

**What happens after onboarding:**
- Success message
- 2-second delay
- Automatic redirect to `/dashboard`

---

### 5. Dashboard Page
**URL:** `http://localhost:3000/dashboard`  
**Purpose:** Main application interface  
**Access:** Only authenticated users  

**What you see:**
- Welcome message with user name
- Character Overview:
  - Level (starting at 1)
  - Rank (starting at Novice)
  - Total XP (starting at 0)
- Tri-Vector Progress:
  - Mind (Level 1, 0 XP)
  - Money (Level 1, 0 XP)
  - Muscle (Level 1, 0 XP)
- Sign Out button (top right)
- Next steps guidance

**If not authenticated:**
- Page shows "Loading dashboard..."
- Automatic redirect to `/auth/login`

---

## SPECIAL BEHAVIORS

### Route Protection
```
Unauthenticated user tries to access:
  /auth/onboarding → Redirects to /auth/login
  /dashboard → Redirects to /auth/login
```

### Session Persistence
```
After successful login:
  - Session token stored
  - Persists across page reloads
  - Persists across browser restart (if cookies enabled)
  - Sign out clears session
```

### Form Validation
```
Real-time validation on:
  - Email format
  - Password length (6+ characters)
  - Password confirmation match
  - Full name required
```

---

## TEST SCENARIOS

### Quick 5-Minute Test

**1. Register (1 min)**
- Go to: `http://localhost:3000/auth/register`
- Enter:
  - Full Name: "Test User"
  - Email: "test@example.com"
  - Password: "password123"
  - Confirm: "password123"
- Click: Create Account
- Expect: Redirect to onboarding

**2. Onboarding (2 min)**
- Already on: `http://localhost:3000/auth/onboarding`
- Enter:
  - Display Name: "Test User"
  - Timezone: "UTC"
- Click: Continue
- Enter:
  - Mind: "Learn React"
  - Money: "Build startup"
  - Muscle: "Get fit"
- Click: Create Character
- Expect: Redirect to dashboard

**3. Dashboard (1 min)**
- Now on: `http://localhost:3000/dashboard`
- See: Welcome message, character level 1, vectors at level 1
- Click: Sign Out
- Expect: Redirect to login

**4. Login (1 min)**
- Now on: `http://localhost:3000/auth/login`
- Enter:
  - Email: "test@example.com"
  - Password: "password123"
- Click: Sign In
- Expect: Redirect to dashboard (same data as before)

---

## VALIDATION EXAMPLES

### Registration Validation
```
❌ Empty Full Name → "Full name is required"
❌ Invalid Email → "Please enter a valid email address"
❌ Email already in use → "Email already in use" (Supabase error)
❌ Password < 6 chars → "Password must be at least 6 characters"
❌ Password mismatch → "Passwords do not match"
✅ All valid → Creates account, redirects to onboarding
```

### Login Validation
```
❌ Empty Email → "Email is required"
❌ Empty Password → "Password is required"
❌ Invalid Email format → "Please enter a valid email address"
❌ Wrong password → "Failed to sign in. Please check your credentials."
❌ Non-existent email → "Failed to sign in. Please check your credentials."
✅ Correct credentials → Logs in, redirects to dashboard
```

---

## ERROR HANDLING

### Form Errors
- Display inline on each field
- Real-time validation feedback
- Generic error messages (security)

### Network Errors
- Shows error message
- Allows retry
- No data loss

### Authentication Errors
- Generic "Failed to sign in" message
- No indication if email exists (security)
- Retry option available

### Database Errors
- Shows "Failed to create profile" etc.
- Allows retry
- Proper error recovery

---

## LOADING STATES

### Registration Form
- Text changes to "Creating Account..."
- Inputs disabled
- Button disabled
- Cannot double-submit

### Login Form
- Text changes to "Signing In..."
- Inputs disabled
- Button disabled

### Onboarding
- Text changes to "Setting Up..." or "Finalizing..."
- Inputs disabled
- Cannot double-submit

### Dashboard
- Shows "Loading dashboard..."
- Waits for data to load
- Then displays full page

---

## DATABASE DATA CREATED

### After Registration
```
auth.users table:
  - user_id (UUID)
  - email
  - password_hash (encrypted)
  - created_at
  - updated_at
```

### After Onboarding Step 1
```
user_profiles table:
  - user_id
  - display_name
  - timezone
  - locale (default: en-US)
  - privacy_mode (default: true)

character_progress table:
  - user_id
  - level = 1
  - rank = "Novice"
  - total_xp = 0

vector_progress table (3 rows):
  - user_id
  - vector = "mind" / "money" / "muscle"
  - level = 1
  - xp = 0
```

### After Onboarding Step 2
```
missions table (1-3 rows, one per goal):
  - user_id
  - title (from goal text)
  - vector (mind/money/muscle)
  - status = "active"
  - description (auto-generated)
```

---

## KEYBOARD SHORTCUTS

### Form Navigation
- `Tab` → Next field
- `Shift+Tab` → Previous field
- `Enter` → Submit form (when last field focused)

### Pages
- No special shortcuts (standard web behavior)

---

## BROWSER SUPPORT

✅ Chrome/Chromium  
✅ Firefox  
✅ Safari  
✅ Edge  
✅ Mobile browsers  

**Responsive Sizes:**
- Desktop: 1440px+ (full layout)
- Tablet: 900-1199px (adjusted)
- Mobile: 640-899px (optimized)
- Micro: <640px (mobile only)

---

## ENVIRONMENT & CONFIG

### Application
- **Framework:** Next.js 14
- **Port:** 3000
- **Dev Server:** http://localhost:3000
- **Build:** `npm run build`
- **Start:** `npm start`

### Database
- **Provider:** Supabase (PostgreSQL)
- **URL:** Set in .env.local
- **API Key:** Set in .env.local
- **RLS:** Enabled on all tables
- **Auth:** Supabase Auth

### Configuration Files
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript
- `next.config.js` - Next.js
- `.env.local` - Environment variables
- `.eslintrc.json` - Linting

---

## TESTING RESOURCES

**For comprehensive testing:** See `TESTING_CHECKLIST.md`

**For quick testing:** See `QUICK_START.md`

**For detailed setup:** See `IMPLEMENTATION_GUIDE.md`

---

## COMMON ISSUES & SOLUTIONS

### "Cannot reach localhost:3000"
- Ensure dev server is running: `npm run dev`
- Check port 3000 is not in use
- Try refreshing page
- Check firewall settings

### "Missing Supabase keys"
- Verify `.env.local` has correct keys
- Restart dev server after updating env
- Check keys are not expired

### "Email already in use"
- Use a different test email
- Or delete the previous user from Supabase dashboard

### "Onboarding page blank"
- Must be authenticated first
- Try accessing after login/registration
- Check browser console for errors

### "Dashboard shows error"
- Ensure user_profiles entry was created
- Check RLS policies are enabled
- Verify Supabase connection

### "Can't submit form"
- Ensure all required fields are filled
- Check form validation errors
- Try refreshing page
- Check browser console

---

## PERFORMANCE TIPS

- Initial page load: ~2 seconds (acceptable)
- Form submission: ~1-2 seconds (Supabase latency)
- Navigation: ~500ms per page
- Use Chrome DevTools for profiling
- Check Network tab for request details

---

## SECURITY NOTES

✅ Passwords never logged  
✅ Session tokens secure  
✅ User data isolated  
✅ RLS policies enforced  
✅ Error messages generic  
✅ No user enumeration  

---

## QUICK REFERENCE

| Page | URL | Access | Purpose |
|------|-----|--------|---------|
| Home | `/` | Public | Redirect hub |
| Login | `/auth/login` | Public | Sign in |
| Register | `/auth/register` | Public | Create account |
| Onboarding | `/auth/onboarding` | Auth only | Setup profile |
| Dashboard | `/dashboard` | Auth only | Main app |

---

**🎉 M3 Triad is live at: http://localhost:3000**

**Next: Run the TESTING_CHECKLIST.md for comprehensive validation!**
