-- Insert sample hospitals
insert into public.hospitals (name, email, phone, address, latitude, longitude, services, available_ambulances, available_staff)
values
  ('City Hospital', 'contact@cityhospital.com', '+1 (555) 111-2222', '123 Medical Ave, New York, NY 10001', 40.7128, -74.0060, 'Cardiac Care, Trauma Center, 24/7 ER, Pediatrics', 5, 12),
  ('Metro Medical Center', 'info@metromedical.com', '+1 (555) 222-3333', '456 Health St, New York, NY 10002', 40.7200, -73.9950, 'Emergency Care, Surgery, ICU', 3, 8),
  ('Downtown Emergency Hospital', 'contact@downtownemergency.com', '+1 (555) 333-4444', '789 Emergency Blvd, New York, NY 10003', 40.7050, -74.0100, 'Trauma Center, Pediatric ER, Burn Unit', 4, 10)
on conflict (email) do nothing;
