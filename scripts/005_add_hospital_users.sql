-- Add email addresses that can be used to login as hospitals
-- These emails match the hospitals in the seed data

-- Note: This system uses simple authentication.
-- Any of these emails can log in with any password for demo purposes.
-- In production, implement proper password hashing and validation.

-- Available Hospital Login Credentials:
-- 1. contact@cityhospital.com (City General Hospital)
-- 2. info@metromedical.com (Metro Medical Center)
-- 3. admin@stmarys.org (St. Mary's Hospital)

-- You can also use the following test email for quick testing:
-- principleaiet08@gmail.com - This will need to be added to the hospitals table

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
