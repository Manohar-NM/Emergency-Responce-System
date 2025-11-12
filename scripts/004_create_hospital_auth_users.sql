-- Create authentication users for the hospitals
-- These need to be run to create login credentials for each hospital

-- NOTE: You need to create these users in Supabase Auth Dashboard manually OR use this as reference
-- Go to: Authentication > Users > Add User in your Supabase dashboard

-- Hospital 1: City Hospital
-- Email: contact@cityhospital.com
-- Password: hospital123 (use a strong password in production)

-- Hospital 2: Metro Medical Center  
-- Email: info@metromedical.com
-- Password: hospital123 (use a strong password in production)

-- Hospital 3: Downtown Emergency Hospital
-- Email: contact@downtownemergency.com
-- Password: hospital123 (use a strong password in production)

-- After creating these users in Supabase Auth, they will be able to login
-- The hospitals table already exists with these email addresses
-- The login system will match the authenticated user with their hospital record
