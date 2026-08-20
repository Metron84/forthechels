-- Chelsea Supporters Club UAE — forthechels (Level B)
-- Run in Supabase SQL Editor. Enable Anonymous sign-ins in Auth settings.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create sequence if not exists public.member_number_seq start 643;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  member_number text unique,
  role text not null default 'member'
    check (role in ('member', 'committee', 'admin')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'expired')),
  season text not null default '2026/27',
  valid_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.assign_member_number()
returns trigger language plpgsql as $$
begin
  if new.member_number is null then
    new.member_number := 'CFC·' || lpad(nextval('public.member_number_seq')::text, 4, '0');
  end if;
  if new.valid_until is null then
    new.valid_until := make_date(2027, 5, 31);
  end if;
  return new;
end;
$$;

create trigger profiles_member_number before insert on public.profiles
  for each row execute function public.assign_member_number();

create table public.fixtures (
  id uuid primary key default gen_random_uuid(),
  match_date date not null,
  competition text not null,
  title text not null,
  kickoff_gst text not null,
  venue text not null default 'Belgian Beer Café · Souk Madinat Jumeirah',
  doors_open text,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  predictions_open boolean not null default true,
  created_at timestamptz not null default now()
);

create index fixtures_date_idx on public.fixtures (match_date);

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (fixture_id, profile_id)
);

create index rsvps_fixture_idx on public.rsvps (fixture_id);

create or replace view public.fixture_going_counts as
select f.id as fixture_id, count(r.id)::int as going_count
from public.fixtures f
left join public.rsvps r on r.fixture_id = f.id
group by f.id;

create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  pick text not null,
  points int not null default 0,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fixture_id, profile_id)
);

create trigger predictions_updated before update on public.predictions
  for each row execute function public.set_updated_at();

create table public.vault_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('finals', 'season', 'ours', 'pods')),
  title text not null,
  subtitle text not null default '',
  youtube_url text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  headline text not null,
  body text,
  memory_year int,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  tag text not null default 'Club',
  title text not null,
  body text not null,
  author text not null default 'Committee',
  pinned boolean not null default false,
  published_at timestamptz not null default now()
);

create table public.perks (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('food', 'retail', 'auto', 'travel', 'services')),
  name text not null,
  location text not null default '',
  offer text not null,
  how_to_redeem text not null,
  logo_label text not null default '',
  is_open_slot boolean not null default false,
  sort_order int not null default 0,
  published boolean not null default true
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  cost_aed int not null,
  capacity int not null,
  taken int not null default 0,
  waiting_list_only boolean not null default false,
  sort_order int not null default 0,
  published boolean not null default true
);

create table public.trip_registrations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'held'
    check (status in ('held', 'paid', 'cancelled', 'waiting')),
  held_until timestamptz,
  created_at timestamptz not null default now(),
  unique (trip_id, profile_id)
);

create table public.hafh_entries (
  id uuid primary key default gen_random_uuid(),
  fixture_label text not null,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  display_initials text not null,
  travel_note text not null default '',
  tag text not null default 'Needs a ticket',
  created_at timestamptz not null default now()
);

create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value) values
  ('season', '"2026/27"'),
  ('featured_venue', '"Belgian Beer Café · doors 18:30"'),
  ('member_count_display', '642'),
  ('membership_fee_aed', '150'),
  ('payment_mode', '"stub"'),
  ('on_this_day', '{"year":2012,"headline":"Drogba. Munich. Penalty five.","prompt":"Where were you when it went in?"}')
on conflict (key) do nothing;

-- RLS
alter table public.profiles enable row level security;
alter table public.fixtures enable row level security;
alter table public.rsvps enable row level security;
alter table public.predictions enable row level security;
alter table public.vault_items enable row level security;
alter table public.memories enable row level security;
alter table public.notices enable row level security;
alter table public.perks enable row level security;
alter table public.trips enable row level security;
alter table public.trip_registrations enable row level security;
alter table public.hafh_entries enable row level security;
alter table public.app_settings enable row level security;

create policy "fixtures read" on public.fixtures for select using (true);
create policy "vault read" on public.vault_items for select using (published = true);
create policy "notices read" on public.notices for select using (true);
create policy "perks read" on public.perks for select using (published = true);
create policy "trips read" on public.trips for select using (published = true);
create policy "memories read" on public.memories for select using (published = true);
create policy "settings read" on public.app_settings for select using (true);

create policy "profiles read public names" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles insert own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

create policy "rsvps read" on public.rsvps for select using (true);
create policy "rsvps insert own" on public.rsvps
  for insert with check (auth.uid() = profile_id);
create policy "rsvps delete own" on public.rsvps
  for delete using (auth.uid() = profile_id);

create policy "predictions read" on public.predictions for select using (true);
create policy "predictions insert own" on public.predictions
  for insert with check (auth.uid() = profile_id);
create policy "predictions update own" on public.predictions
  for update using (auth.uid() = profile_id);

create policy "trip_regs read own" on public.trip_registrations
  for select using (auth.uid() = profile_id);
create policy "trip_regs insert own" on public.trip_registrations
  for insert with check (auth.uid() = profile_id);

create policy "hafh read" on public.hafh_entries for select using (true);
create policy "hafh insert own" on public.hafh_entries
  for insert with check (auth.uid() = profile_id);

create policy "memories insert own" on public.memories
  for insert with check (auth.uid() = profile_id);
