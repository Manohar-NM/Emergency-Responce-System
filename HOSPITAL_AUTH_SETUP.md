# Hospital Authentication Setup Guide

The Emergency Response System now uses **Supabase Authentication** for secure hospital logins.

## Setup Instructions

### Step 1: Create Hospital User Accounts

You need to create user accounts in Supabase Auth for each hospital:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Users**
3. Click **Add User** (manually via dashboard)

Create accounts for each hospital:

**Hospital 1: City Hospital**
- Email: `contact@cityhospital.com`
- Password: `hospital123` (choose a strong password)
- Confirm email: ✓ (check "Auto Confirm User")

**Hospital 2: Metro Medical Center**
- Email: `info@metromedical.com`
- Password: `hospital123` (choose a strong password)
- Confirm email: ✓ (check "Auto Confirm User")

**Hospital 3: Downtown Emergency Hospital**
- Email: `contact@downtownemergency.com`
- Password: `hospital123` (choose a strong password)
- Confirm email: ✓ (check "Auto Confirm User")

### Step 2: Test Hospital Login

1. Go to `/auth/login`
2. Select "Hospital" role
3. Enter hospital email and password
4. Click "Sign In"

The system will:
1. Authenticate the user via Supabase Auth
2. Verify the email matches a hospital in the database
3. Load the correct hospital's dashboard and data

### Step 3: Create Additional Hospitals (Optional)

To add new hospitals:

1. **Add to database**: Insert hospital record into `hospitals` table
2. **Create auth user**: Add user account in Supabase Auth with same email
3. **Use same password pattern**: Keep it secure and documented

## How It Works

**Authentication Flow:**
1. User enters email/password on login page
2. System authenticates via Supabase Auth (`signInWithPassword`)
3. System queries `hospitals` table to get hospital details
4. Hospital dashboard loads with authenticated user's data
5. Each hospital only sees their own information

**Security Features:**
- Real password validation via Supabase Auth
- Email verification support
- Secure session management
- Hospital data isolation (each hospital sees only their data)

## Troubleshooting

**"Invalid email or password" error:**
- Make sure the user account exists in Supabase Auth
- Verify the password is correct
- Check that email confirmation is complete

**"Hospital account not found" error:**
- User exists in Auth but not in `hospitals` table
- Run the seed script `002_seed_hospitals.sql` to add hospital records
- Ensure email addresses match exactly between Auth and database

**Wrong hospital data showing:**
- This should no longer happen with proper authentication
- Check browser console for "[v0]" debug logs
- Clear localStorage and try logging in again

## Production Security

Before deploying to production:

1. Change all default passwords to strong, unique passwords
2. Enable email confirmation for new users
3. Set up proper password reset flows
4. Consider adding 2FA for hospital accounts
5. Remove all console.log debug statements
