# M3 Triad — Testing Checklist

## Quick Start

### 1. Install & Run
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### 2. Quick Test Flow (5 minutes)
- Navigate to `/auth/register`
- Enter: Name, unique email, password
- Complete onboarding with timezone and goals
- View dashboard
- Sign out
- Login with same credentials
- Verify dashboard shows same data

---

## Detailed Testing Scenarios

### A. Registration Page (`/auth/register`)

#### A1. Valid Registration
- [ ] Navigate to `http://localhost:3000/auth/register`
- [ ] Enter:
  - Full Name: "Alice Wonder"
  - Email: "alice+test1@example.com" (unique each test)
  - Password: "SecurePass123"
  - Confirm: "SecurePass123"
- [ ] Click "Create Account"
- [ ] ✅ Expected: Success message, redirect to onboarding

#### A2. Missing Fields
- [ ] Leave Full Name empty, try to submit
- [ ] ✅ Expected: "Full name is required" error
- [ ] Leave Email empty
- [ ] ✅ Expected: "Email is required" error
- [ ] Leave Password empty
- [ ] ✅ Expected: "Password is required" error

#### A3. Invalid Email
- [ ] Enter Email: "notanemail"
- [ ] ✅ Expected: "Please enter a valid email address" error
- [ ] Enter Email: "test@"
- [ ] ✅ Expected: Same error

#### A4. Password Too Short
- [ ] Enter Password: "12345"
- [ ] ✅ Expected: "Password must be at least 6 characters" error

#### A5. Password Mismatch
- [ ] Enter Password: "SecurePass123"
- [ ] Enter Confirm: "SecurePass124"
- [ ] ✅ Expected: "Passwords do not match" error

#### A6. Existing Email
- [ ] Register with new email, then try again
- [ ] Use same email in second registration
- [ ] ✅ Expected: Supabase error message about email already in use

#### A7. Loading State
- [ ] While form submitting, verify:
  - [ ] Submit button text changes to "Creating Account..."
  - [ ] All inputs are disabled
  - [ ] Buttons appear greyed out

---

### B. Onboarding Page (`/auth/onboarding`)

#### B1. Profile Step - Valid
- [ ] From successful registration, should auto-redirect here
- [ ] Verify Display Name is pre-filled with registration name
- [ ] Change Display Name to: "Alice W."
- [ ] Select Timezone: "America/New_York"
- [ ] Click "Continue"
- [ ] ✅ Expected: Profile step disappears, Goals step appears

#### B2. Profile Step - Validation
- [ ] Clear Display Name field
- [ ] Try to submit
- [ ] ✅ Expected: "Display Name is required" error (or similar)

#### B3. Goals Step - All Goals
- [ ] From profile continuation
- [ ] Enter Mind Goal: "Learn React in depth"
- [ ] Enter Money Goal: "Build and launch SaaS"
- [ ] Enter Muscle Goal: "Deadlift 150kg"
- [ ] Click "Create Character"
- [ ] ✅ Expected: Success animation, redirects to dashboard

#### B4. Goals Step - Some Goals
- [ ] Enter only Mind Goal: "Deep learning project"
- [ ] Leave Money and Muscle empty
- [ ] Click "Create Character"
- [ ] ✅ Expected: Success, only mind mission created

#### B5. Goals Step - No Goals
- [ ] Leave all goals empty
- [ ] "Create Character" button should be disabled
- [ ] ✅ Expected: Cannot submit without at least one goal

#### B6. Loading State
- [ ] While step loading/submitting:
  - [ ] Input fields disabled
  - [ ] Button text changes to "Setting Up..." or "Finalizing..."
  - [ ] No duplicate submissions possible

#### B7. Error Handling
- [ ] Intentionally trigger error (edit network to block request)
- [ ] ✅ Expected: Error message displays, can retry

---

### C. Dashboard Page (`/dashboard`)

#### C1. After Onboarding
- [ ] Should auto-redirect from onboarding success
- [ ] Verify page shows:
  - [ ] Welcome message with display name
  - [ ] "Character Overview" section with Level 1, Novice rank, 0 XP
  - [ ] "Tri-Vector Progress" showing:
    - [ ] Mind: Level 1, 0 XP
    - [ ] Money: Level 1, 0 XP
    - [ ] Muscle: Level 1, 0 XP

#### C2. Direct Navigation
- [ ] From dashboard, copy URL to new tab
- [ ] Navigate to `http://localhost:3000/dashboard`
- [ ] ✅ Expected: Same dashboard loads (session persists)

#### C3. Protected Route (No Session)
- [ ] Open private/incognito window
- [ ] Navigate to `http://localhost:3000/dashboard`
- [ ] ✅ Expected: Redirected to `/auth/login`

#### C4. Sign Out
- [ ] Click "Sign Out" button in header
- [ ] ✅ Expected: Redirected to login page, session cleared

#### C5. Data Persistence
- [ ] On dashboard, note the display name shown
- [ ] Sign out
- [ ] Log back in with same email/password
- [ ] ✅ Expected: Same name, same character level/rank displayed

---

### D. Login Page (`/auth/login`)

#### D1. Valid Login (Post-Registration)
- [ ] Navigate to `http://localhost:3000/auth/login`
- [ ] Enter Email: (from registration)
- [ ] Enter Password: (from registration)
- [ ] Click "Sign In"
- [ ] ✅ Expected: Redirects to `/dashboard` with user data

#### D2. Missing Email
- [ ] Leave Email empty
- [ ] Click "Sign In"
- [ ] ✅ Expected: "Email is required" error

#### D3. Missing Password
- [ ] Enter Email
- [ ] Leave Password empty
- [ ] Click "Sign In"
- [ ] ✅ Expected: "Password is required" error

#### D4. Invalid Email Format
- [ ] Enter Email: "notanemail"
- [ ] Enter Password: "anypassword"
- [ ] Click "Sign In"
- [ ] ✅ Expected: "Please enter a valid email address" error

#### D5. Wrong Password
- [ ] Enter correct Email
- [ ] Enter Password: "WrongPassword123"
- [ ] Click "Sign In"
- [ ] ✅ Expected: "Failed to sign in. Please check your credentials." error

#### D6. Non-Existent Email
- [ ] Enter Email: "doesntexist@example.com"
- [ ] Enter Password: "anypassword"
- [ ] Click "Sign In"
- [ ] ✅ Expected: "Failed to sign in..." error (generic, no user enumeration)

#### D7. Link to Register
- [ ] On login page, click "Create One" link
- [ ] ✅ Expected: Navigates to `/auth/register`

#### D8. Forgot Password Placeholder
- [ ] Click "Forgot password?" link
- [ ] ✅ Expected: Shows note about email configuration needed
- [ ] Click "Back to Sign In"
- [ ] ✅ Expected: Returns to login form

#### D9. Loading State
- [ ] While signing in:
  - [ ] Button text: "Signing In..."
  - [ ] Inputs disabled
  - [ ] Can't submit twice

---

### E. Home/Index Route (`/`)

#### E1. Logged Out → Redirects to Login
- [ ] Clear cookies/session
- [ ] Navigate to `http://localhost:3000`
- [ ] ✅ Expected: Redirects to `/auth/login`

#### E2. Logged In → Redirects to Dashboard
- [ ] After login, navigate to `http://localhost:3000`
- [ ] ✅ Expected: Redirects to `/dashboard`

---

### F. Form Validation & UX

#### F1. Real-time Error Clearing
- [ ] On any form, enter invalid value → see error
- [ ] Start typing correct value
- [ ] ✅ Expected: Error message disappears

#### F2. Touch Targets (Mobile)
- [ ] On mobile viewport (< 640px):
  - [ ] All buttons minimum 44px height
  - [ ] All inputs minimum 44px height
  - [ ] Touch targets easily tappable

#### F3. Keyboard Navigation
- [ ] On register form:
  - [ ] Tab through all fields
  - [ ] Shift+Tab goes backward
  - [ ] Enter on last field submits form
  - [ ] Focus ring visible on all fields

#### F4. Button States
- [ ] Default: Purple background, white text
- [ ] Hover: Darker purple, shadow
- [ ] Pressed: Same dark purple, inset shadow
- [ ] Disabled: Greyed out, no cursor changes
- [ ] Loading: Text changes, disabled appearance

---

### G. Responsive Design

#### G1. Desktop (1440px)
- [ ] Forms have max-width of ~400px
- [ ] All text readable
- [ ] No horizontal scroll
- [ ] Proper spacing between elements

#### G2. Tablet (900px)
- [ ] Forms still centered
- [ ] Font sizes slightly smaller
- [ ] Touch-friendly targets
- [ ] No layout breaks

#### G3. Mobile (640px)
- [ ] Form takes full width with padding
- [ ] Single column layout
- [ ] Buttons full width on mobile
- [ ] Text is readable (minimum 16px)
- [ ] No horizontal scroll

#### G4. Mobile (390px - iPhone SE size)
- [ ] All content still visible
- [ ] Can scroll vertically
- [ ] Form fields easily tappable
- [ ] Labels clear and readable

---

### H. Error Handling & Edge Cases

#### H1. Network Error During Registration
- [ ] Open DevTools Network tab
- [ ] Block requests to Supabase
- [ ] Try to register
- [ ] ✅ Expected: Error message displayed
- [ ] Can retry after unblocking

#### H2. Session Expiration
- [ ] Log in successfully
- [ ] Go to Supabase dashboard, manually delete session
- [ ] Try to load a page
- [ ] ✅ Expected: Redirected to login (graceful handling)

#### H3. Database Connection Failure
- [ ] During onboarding, block Supabase queries
- [ ] Try to create profile/goals
- [ ] ✅ Expected: Error message, can retry

#### H4. Special Characters in Inputs
- [ ] Name: "O'Brien"
- [ ] ✅ Expected: Accepted without issue
- [ ] Email: "test+1@example.com"
- [ ] ✅ Expected: Valid email accepted

#### H5. Very Long Inputs
- [ ] Name: 100+ characters
- [ ] ✅ Expected: Accepted (or truncated gracefully)
- [ ] Goal: 1000+ characters
- [ ] ✅ Expected: Stored and retrieved correctly

---

### I. Data Validation & Security

#### I1. Password Security
- [ ] Passwords shown as dots/masked in fields
- [ ] No password visible in URLs
- [ ] No password in browser console logs

#### I2. Session Security
- [ ] After login, check localStorage: no password stored
- [ ] Only auth tokens stored (securely)
- [ ] Tokens cleared on logout

#### I3. User Isolation
- [ ] User A registers and completes onboarding
- [ ] User B registers with different email
- [ ] User A's dashboard shows only User A's data
- [ ] User B sees different character/vector data
- [ ] ✅ Expected: No data leakage between users

#### I4. CSRF Protection
- [ ] Forms use Next.js standard practices
- [ ] No sensitive data in query parameters
- [ ] State changes via POST

---

### J. Database Verification

#### J1. User Profile Created
- [ ] After registration, check Supabase `user_profiles` table:
  - [ ] `user_id` matches auth user
  - [ ] `display_name` matches entered name
  - [ ] `timezone` matches selected timezone
  - [ ] `locale` defaults to 'en-US'

#### J2. Character Progress Created
- [ ] Check `character_progress` table:
  - [ ] `user_id` matches
  - [ ] `level` = 1
  - [ ] `rank` = 'Novice'
  - [ ] `total_xp` = 0

#### J3. Vector Progress Initialized
- [ ] Check `vector_progress` table:
  - [ ] 3 rows for user (mind, money, muscle)
  - [ ] All `level` = 1
  - [ ] All `xp` = 0

#### J4. Missions Created from Goals
- [ ] Check `missions` table:
  - [ ] One row per non-empty goal
  - [ ] `user_id` matches
  - [ ] `title` matches goal text
  - [ ] `vector` matches (mind/money/muscle)
  - [ ] `status` = 'active'

---

## Browser Testing

### Desktop Browsers
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Firefox Mobile

### Devices
- [ ] Desktop monitor (1920x1080)
- [ ] Laptop (1366x768)
- [ ] iPad/Tablet (1024x768)
- [ ] iPhone/Mobile (375x667)

---

## Performance Testing

- [ ] Page load time: < 3 seconds
- [ ] Form submission: < 2 seconds (expected Supabase latency)
- [ ] Redirect after success: < 1 second
- [ ] No layout shift (CLS) on form interactions
- [ ] No console errors or warnings

---

## Accessibility Testing

- [ ] Form labels visible and associated with inputs
- [ ] Error messages linked to fields with `aria-` attributes
- [ ] Focus ring visible on all interactive elements
- [ ] Colour contrast ratio 4.5:1+ (WCAG AA)
- [ ] Screen reader announces form fields correctly
- [ ] Keyboard-only navigation possible
- [ ] No images without alt text (none yet)
- [ ] Motion respects `prefers-reduced-motion`

---

## Sign-Off Checklist

Before marking implementation complete:

- [ ] All files created as listed
- [ ] No TypeScript errors: `tsc --noEmit`
- [ ] No ESLint errors: `npm run lint`
- [ ] All quick test scenarios (A1-A6, B1-B4, C1-C3) pass
- [ ] Dashboard displays real data (not mock)
- [ ] Data persists across sessions
- [ ] No console errors
- [ ] Responsive on mobile, tablet, desktop
- [ ] Forms validate correctly
- [ ] Error messages clear and helpful
- [ ] Loading states visible
- [ ] Sign out clears session
- [ ] Protected routes enforce auth
- [ ] Database entries created correctly

---

## Notes

- Each test should use a **unique email** to avoid conflicts
- Use test emails like: `alice+m3triad1@example.com`, `alice+m3triad2@example.com`
- Keep browser DevTools open to watch for errors
- Check Network tab for request/response details
- Test across different network speeds (DevTools throttling)
