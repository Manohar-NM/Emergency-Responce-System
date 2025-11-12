-- Create hospitals table
create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null,
  address text not null,
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  services text,
  available_ambulances int default 0,
  available_staff int default 0,
  created_at timestamp with time zone default now()
);

-- Create SOS alerts table
create table if not exists public.sos_alerts (
  id uuid primary key default gen_random_uuid(),
  victim_id text not null,
  victim_name text not null,
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  accuracy decimal(10, 2),
  blood_group text,
  allergies text,
  emergency_contact text,
  emergency_contact_name text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  priority text default 'medium' check (priority in ('high', 'medium', 'low')),
  distance decimal(10, 2),
  created_at timestamp with time zone default now()
);

-- Create hospital responses table to track which hospital responded
create table if not exists public.hospital_responses (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid references public.sos_alerts(id) on delete cascade,
  hospital_id uuid references public.hospitals(id) on delete cascade,
  hospital_name text not null,
  status text default 'dispatched' check (status in ('dispatched', 'en-route', 'arrived', 'completed')),
  eta int, -- estimated time of arrival in minutes
  responded_at timestamp with time zone default now()
);

-- Create ambulance locations table
create table if not exists public.ambulance_locations (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid references public.sos_alerts(id) on delete cascade,
  hospital_id uuid references public.hospitals(id) on delete cascade,
  hospital_name text not null,
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  status text default 'dispatched' check (status in ('dispatched', 'en-route', 'arrived')),
  eta int default 8,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.hospitals enable row level security;
alter table public.sos_alerts enable row level security;
alter table public.hospital_responses enable row level security;
alter table public.ambulance_locations enable row level security;

-- RLS Policies for hospitals (read-only for now)
create policy "Allow public read access to hospitals"
  on public.hospitals for select
  using (true);

-- RLS Policies for SOS alerts
create policy "Allow anyone to create SOS alerts"
  on public.sos_alerts for insert
  with check (true);

create policy "Allow public read access to SOS alerts"
  on public.sos_alerts for select
  using (true);

create policy "Allow public update to SOS alerts"
  on public.sos_alerts for update
  using (true);

-- RLS Policies for hospital responses
create policy "Allow anyone to create hospital responses"
  on public.hospital_responses for insert
  with check (true);

create policy "Allow public read access to hospital responses"
  on public.hospital_responses for select
  using (true);

create policy "Allow public update to hospital responses"
  on public.hospital_responses for update
  using (true);

-- RLS Policies for ambulance locations
create policy "Allow anyone to create ambulance locations"
  on public.ambulance_locations for insert
  with check (true);

create policy "Allow public read access to ambulance locations"
  on public.ambulance_locations for select
  using (true);

create policy "Allow public update to ambulance locations"
  on public.ambulance_locations for update
  using (true);
