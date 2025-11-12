# Hospital Login Fix

## The Problem
You're trying to log in with `principleaiet08@gmail.com` but this email doesn't exist in the hospitals table yet.

## The Solution

### Option 1: Add Your Email to Database (Recommended)
Run this SQL script in your Supabase SQL Editor:

\`\`\`sql
INSERT INTO hospitals (name, address, phone, email, coordinates, available_beds, specialties)
VALUES 
  (
    'Principal AI Hospital',
    '123 Tech Street, Digital City',
    '+1-555-TECH-123',
    'principleaiet08@gmail.com',
    point(77.5946, 12.9716),
    50,
    ARRAY['Emergency Care', 'Technology', 'AI Medicine']
  )
ON CONFLICT (email) DO NOTHING;
\`\`\`

This is the same as running `scripts/005_add_hospital_users.sql`.

### Option 2: Use Existing Hospital Accounts
You can also log in with these pre-seeded hospital emails (from `scripts/002_seed_hospitals.sql`):

1. **contact@cityhospital.com** - City General Hospital
2. **info@metromedical.com** - Metro Medical Center  
3. **admin@stmarys.org** - St. Mary's Hospital

**Any password will work** - this is a demo system with simplified authentication.

## After Login
Once logged in successfully, you'll be able to:
- View incoming SOS alerts
- Accept emergency requests
- Dispatch ambulances
- Track ambulance location
- See your hospital's information

## Next Steps
1. Run the SQL script above OR use one of the existing hospital emails
2. Go to `/auth/login`
3. Select "Hospital" as role
4. Enter the email and any password
5. Click Login
