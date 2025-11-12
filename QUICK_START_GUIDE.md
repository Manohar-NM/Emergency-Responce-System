# Emergency Response System - Quick Start Guide

## ✅ Database Setup Complete!

You've successfully created all 4 tables:
- `hospitals` - Hospital information
- `sos_alerts` - Emergency alerts from victims
- `hospital_responses` - Hospital acceptance tracking
- `ambulance_locations` - Real-time ambulance tracking

## 🚀 Next Steps: Test Your System

### Step 1: Add Sample Hospital Data

Run this query in Supabase SQL Editor to add test hospitals:

\`\`\`sql
INSERT INTO hospitals (id, name, latitude, longitude, address, phone, email, available_ambulances, available_staff, services)
VALUES
  (gen_random_uuid(), 'City General Hospital', 12.9716, 77.5946, '123 Main St, Bangalore', '+91-80-12345678', 'contact@citygen.com', 5, 20, 'Emergency, Trauma, ICU'),
  (gen_random_uuid(), 'Metro Emergency Center', 12.9352, 77.6245, '456 Park Ave, Bangalore', '+91-80-87654321', 'info@metroemergency.com', 3, 15, 'Emergency, Cardiology, Surgery'),
  (gen_random_uuid(), 'St. Mary Medical Center', 13.0067, 77.5619, '789 Lake Rd, Bangalore', '+91-80-11223344', 'help@stmary.com', 4, 18, 'Emergency, Pediatrics, Neurology');
\`\`\`

### Step 2: Create Test Accounts

#### For Victims:
1. Go to `/auth/register`
2. Register as a victim
3. Add medical records (blood group, allergies, emergency contact)
4. You'll be taken to the SOS page

#### For Hospitals:
1. Go to `/auth/register` 
2. Register as a hospital
3. Access hospital dashboard at `/hospital/dashboard`

### Step 3: Test the SOS Flow

#### As a Victim:
1. Navigate to `/victim/sos`
2. Click the **"Send SOS Alert"** button
3. The system will:
   - Capture your GPS location (latitude, longitude, accuracy)
   - Send alert to nearby hospitals
   - Display your medical records
   - Show "Waiting for hospital response..."

#### As a Hospital:
1. Go to `/hospital/dashboard`
2. You'll see the incoming SOS alert with:
   - Victim name and medical details
   - Distance from hospital
   - Location coordinates
3. Click **"Accept Alert"** to respond
4. Click **"Dispatch Ambulance"** to send help

#### Back to Victim View:
1. Once hospital accepts, the victim will see:
   - ✅ **Hospital name that responded** (e.g., "City General Hospital")
   - 📍 **Your location with accuracy** (e.g., "±15 meters")
   - 🚑 **Ambulance status** (Dispatched → En Route → Arrived)
   - ⏱️ **Estimated Time of Arrival**

## 📋 Key Features to Test

### Medical Records Management
- Add multiple medical records
- Delete records you don't need
- Records automatically appear in SOS alerts

### Real-time Tracking
- Watch ambulance status update
- See ETA countdown
- Track ambulance location

### Location Accuracy
- System shows GPS accuracy (±X meters)
- Latitude and longitude displayed
- Helps hospitals locate you precisely

## 🔧 Troubleshooting

### If SOS button doesn't work:
1. Allow location permissions in your browser
2. Check browser console for errors
3. Verify Supabase tables were created correctly

### If hospital doesn't appear:
1. Make sure you ran the hospital seed script
2. Check that hospitals have `available_ambulances > 0`
3. Verify the hospital is within range (default: 10km)

### If ambulance status doesn't update:
1. Hospital must click "Accept Alert" first
2. Then click "Dispatch Ambulance"
3. Status should change: Dispatched → En Route → Arrived

## 🎯 Expected User Flow

\`\`\`
Victim Registration 
  → Add Medical Records 
  → SOS Page 
  → Press SOS Button 
  → Location Captured (with accuracy)
  → Alert Sent to Hospitals
  → Hospital Accepts 
  → Hospital Name Displayed to Victim
  → Ambulance Dispatched 
  → Real-time Status Updates
  → Help Arrives!
\`\`\`

## 📊 What You'll See on SOS Page

When a hospital responds, the victim sees:

\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 SOS ALERT ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hospital: City General Hospital ✅
Status: Ambulance En Route 🚑
ETA: 8 minutes ⏱️

Your Location:
📍 12.9716, 77.5946
📏 Accuracy: ±15 meters

Medical Records:
🩸 Blood Group: O+
⚠️ Allergies: Penicillin
📞 Emergency Contact: +91-9876543210
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

## ✨ Your System is Ready!

Everything is set up. Just add sample hospitals and start testing the complete emergency response workflow!
