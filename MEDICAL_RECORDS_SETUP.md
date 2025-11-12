# Medical Records & SOS System Setup Guide

## Overview
This Emergency Response System now includes a complete medical records flow with Supabase integration.

## User Flow

1. **Registration** → After creating a victim account, users are redirected to the medical records setup page
2. **Medical Records Setup** → Users can add their medical history (optional, can skip)
3. **SOS Page** → Main emergency page with full functionality

## Features

### Medical Records
- Add, view, and delete medical records
- Fields: Date, Type, Hospital/Clinic, Notes
- Stored in localStorage for persistence

### SOS Emergency System
- **One-Click SOS**: Press the big red button to activate emergency alert
- **Location Tracking**: Automatically shares GPS coordinates with accuracy
- **Hospital Response**: Shows which hospital has accepted the alert with:
  - Hospital name
  - Ambulance status (dispatched/en-route/arrived)
  - ETA (estimated time of arrival)
  - Location coordinates with accuracy measurement
- **Medical Info Display**: Shows blood group, allergies, and emergency contacts
- **SOS History**: Keeps track of all past emergency alerts

## Database Setup

### Step 1: Create Tables
Run the script: `scripts/001_create_tables.sql`

This creates:
- `hospitals` - Hospital information
- `sos_alerts` - Emergency alerts from victims
- `hospital_responses` - Hospital responses to SOS alerts
- `ambulance_locations` - Real-time ambulance tracking

### Step 2: Seed Hospital Data
Run the script: `scripts/002_seed_hospitals.sql`

This adds sample hospitals to the database.

### Step 3: Test Hospital Response (Optional)
Run the script: `scripts/003_test_hospital_response.sql`

This simulates a hospital responding to your SOS alert so you can see the hospital name displayed.

## How It Works

### When a Victim Presses SOS:

1. **Location Captured**: GPS coordinates with accuracy are captured
2. **Alert Created**: SOS alert saved to Supabase with victim details
3. **Hospitals Notified**: Nearby hospitals within 10km are identified
4. **Real-time Tracking**: System polls every 2 seconds for hospital responses
5. **Hospital Acceptance**: When a hospital responds, their name and ambulance status are displayed
6. **Location Displayed**: Shows:
   - Latitude and Longitude
   - Accuracy (±X meters)
   - Responding hospital name
   - Ambulance status and ETA

### Information Shared with Hospitals:
- Victim's name
- Blood group
- Known allergies
- Emergency contact name and phone
- Precise GPS location with accuracy
- Medical records (visible on SOS page)

## Environment Variables

The following Supabase environment variables are already configured:
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Testing the System

1. **Create a victim account** at `/auth/register`
2. **Add medical records** (or skip)
3. **Go to SOS page** at `/victim/sos`
4. **Complete your profile** if not done yet
5. **Press the SOS button**
6. **Watch the magic happen**:
   - Location is captured and displayed
   - Nearby hospitals are listed
   - Run the test script to simulate a hospital response
   - Hospital name will appear along with ambulance tracking

## Key Improvements

✅ **Supabase Integration**: All data persists in the cloud
✅ **Hospital Name Display**: Shows which hospital accepted the SOS
✅ **Location Accuracy**: Displays GPS accuracy (±X meters)
✅ **Medical Records**: Full CRUD operations for medical history
✅ **Real-time Updates**: Ambulance status updates every 2 seconds
✅ **Row Level Security**: Database is protected with RLS policies

## Troubleshooting

### No hospital response showing?
- Make sure you've run the database setup scripts (001 and 002)
- After pressing SOS, run script 003 to simulate a hospital response
- Check that the alert was created in the `sos_alerts` table

### Location not working?
- Browser must grant location permissions
- HTTPS is required for geolocation API
- Check browser console for location errors

### Database connection issues?
- Verify Supabase environment variables are set correctly
- Check that tables exist in your Supabase dashboard
- Ensure RLS policies are configured properly
