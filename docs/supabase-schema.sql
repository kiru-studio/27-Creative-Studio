-- ====================================================================
-- 27 CREATIVE STUDIO — PRODUCTION OS & CRM SUPABASE DATABASE SCHEMA
-- ====================================================================
-- Execute this script in your Supabase project's SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
do $$ begin
  create type public.team_role as enum ('principal', 'producer', 'crew', 'editor', 'client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.inquiry_status as enum (
    'new', 
    'contacted', 
    'call_scheduled', 
    'shoot_booked', 
    'in_production', 
    'in_edit', 
    'delivered', 
    'lost'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.shoot_status as enum ('scheduled', 'shooting', 'in_edit', 'review', 'delivered');
exception when duplicate_object then null; end $$;

-- 3. PROFILES & RBAC TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role public.team_role not null default 'crew',
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 4. CLIENTS & LIVE SOCIAL INTELLIGENCE
create table if not exists public.clients (
  id uuid default uuid_generate_v4() primary key,
  brand_name text not null,
  business_type text not null, -- restaurant, showroom, retail, education, other
  primary_contact text not null,
  phone text not null,
  email text,
  instagram_handle text,
  google_maps_url text,
  live_followers int default 0,
  follower_start int default 0,
  growth_multiplier numeric(4, 2) default 1.0,
  top_reel_views text default '0',
  total_posts int default 0,
  google_rating numeric(2, 1) default 5.0,
  google_reviews_count int default 0,
  total_revenue numeric(10, 2) default 0,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. INQUIRIES & CRM PIPELINE (SEND BRIEF LEADS)
create table if not exists public.inquiries (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) on delete set null,
  client_name text not null,
  contact text not null, -- phone or email
  business_name text,
  business_type text,
  deliverables text[] not null default array[]::text[],
  story text not null,
  status public.inquiry_status not null default 'new',
  deal_value numeric(10, 2) default 0,
  source text default 'web_brief', -- web_brief, whatsapp, referral, walk_in
  assigned_to text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. SHOOTS & MASTER SCHEDULE
create table if not exists public.shoots (
  id uuid default uuid_generate_v4() primary key,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  client_id uuid references public.clients(id) on delete cascade,
  client_name text not null,
  shoot_date date not null,
  call_time text not null default '09:00 AM',
  location_address text not null,
  google_maps_link text,
  assigned_crew text[] default array[]::text[],
  gear_checklist text[] default array['Sony FX3 Cinema Body', 'Sony 24-70mm f/2.8 GM', 'Wireless Mic Kit', 'Godox Lighting Kit', 'SanDisk 128GB V90 Cards']::text[],
  deliverable_reels int default 4,
  deliverable_films int default 1,
  status public.shoot_status not null default 'scheduled',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.inquiries enable row level security;
alter table public.shoots enable row level security;

-- Policies for Profiles
create policy "Allow read for authenticated users" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "Allow admin write" on public.profiles
  for all using (auth.role() = 'authenticated');

-- Policies for Clients, Inquiries & Shoots (Read/Write for team)
create policy "Public can insert inquiries" on public.inquiries
  for insert with check (true);

create policy "Authenticated users can manage inquiries" on public.inquiries
  for all using (auth.role() = 'authenticated' or auth.role() = 'anon');

create policy "Authenticated users can manage clients" on public.clients
  for all using (auth.role() = 'authenticated' or auth.role() = 'anon');

create policy "Authenticated users can manage shoots" on public.shoots
  for all using (auth.role() = 'authenticated' or auth.role() = 'anon');

-- 8. SEED DATA (Active Studio Clients & Initial Pipeline)
insert into public.clients (
  brand_name, business_type, primary_contact, phone, instagram_handle, 
  google_maps_url, live_followers, follower_start, growth_multiplier, 
  top_reel_views, total_posts, google_rating, google_reviews_count, total_revenue
) values 
(
  'Thamira Restaurant', 'restaurant', 'Chef & Operations', '+91 83004 78244', '@thamira_restaurant',
  'https://maps.google.com/?q=Polpettai,+Thoothukudi', 10100, 1650, 6.1,
  '10.1K views', 150, 4.5, 150, 45000
),
(
  'MM Cars', 'showroom', 'Showroom Manager', '+91 83004 78244', '@mmcars_tuticorin',
  'https://maps.google.com/?q=Thoothukudi+High+Way', 4850, 1200, 4.0,
  '13.6K views', 96, 4.7, 85, 60000
),
(
  'Surya Mobiles', 'retail', 'Store Director', '+91 83004 78244', '@suryamobiles_authoor',
  'https://maps.google.com/?q=Authoor,+Thoothukudi', 1059, 0, 10.5,
  '18.2K views', 191, 4.6, 110, 35000
),
(
  'ThoorigAI Infotech', 'education', 'Summit Lead', '+91 83004 78244', '@thoorigai_infotech',
  'https://maps.google.com/?q=Thoothukudi', 3200, 800, 4.0,
  '9.16K views', 136, 4.8, 45, 30000
) on conflict do nothing;

-- Initial Inquiries
insert into public.inquiries (
  client_name, contact, business_name, business_type, deliverables, story, status, deal_value, source
) values
(
  'Karthik Raja', '+91 98421 55678', 'Anand Milk Sweets', 'retail',
  array['Reels & video content', 'Festival & offer creatives'],
  'Diwali sweet box launch and festival reel series for our Thoothukudi branches.',
  'shoot_booked', 25000, 'web_brief'
),
(
  'Dr. Sundar M.', '+91 94431 88990', 'Pearl City Dental Hospital', 'other',
  array['Instagram page handling', 'Growth strategy'],
  'We need professional clinical ambience showcase, doctor trust reels, and patient smile stories.',
  'call_scheduled', 30000, 'web_brief'
),
(
  'Priya Nathan', '+91 97890 12345', 'Harbour View Café', 'restaurant',
  array['Reels & video content', 'Google Business Profile'],
  'Sunset sea-view café reels, mocktail menu showcase, and Google maps review optimization.',
  'in_production', 20000, 'whatsapp'
) on conflict do nothing;

-- Initial Shoots
insert into public.shoots (
  client_name, shoot_date, call_time, location_address, assigned_crew, deliverable_reels, deliverable_films, status
) values
(
  'Anand Milk Sweets', current_date + interval '2 days', '08:30 AM', 
  'Polpettai Main Road, Thoothukudi', array['Director (Kiru)', 'Cinematographer (Arun)'], 4, 1, 'scheduled'
),
(
  'Harbour View Café', current_date + interval '4 days', '03:30 PM', 
  'Beach Road, Thoothukudi', array['Director (Kiru)', 'Sound & Lighting'], 3, 0, 'scheduled'
) on conflict do nothing;
