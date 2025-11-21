-- ============================================================
-- Supabase schema for Fiverr for Students
-- Each block is heavily commented so you know what to paste
-- into the SQL editor inside Supabase (or psql). All tables
-- are designed for a multi-role marketplace (students + hosts).
-- ============================================================

-- Users table: stores every authenticated mailbox.
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  avatar_url text,
  phone_number text,
  usn text,
  semester text,
  role text default 'student', -- student | host | admin
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Services table: listings that hosts create.
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references users(id) on delete cascade,
  host_email text not null,
  host_name text,
  title text not null,
  description text not null,
  category text not null,
  price_in_inr integer,
  price_min integer,
  price_max integer,
  tags text[],
  delivery_estimate text,
  portfolio_link text,
  created_at timestamptz default now()
);

-- Cart table: temporary intent data for students.
create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  user_email text not null,
  service_id uuid references services(id),
  quantity integer default 1,
  portfolio_link text,
  message text,
  added_at timestamptz default now()
);

-- Wishlist table: simple many-to-many favorites.
create table if not exists wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  service_id uuid references services(id),
  added_at timestamptz default now()
);

-- Orders table: finalised checkouts.
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  buyer_email text not null,
  buyer_name text,
  host_email text not null,
  host_name text,
  service_id uuid references services(id),
  listing_title text,
  listing_description text,
  portfolio_link text,
  message text,
  status text default 'carted', -- carted | checkout attempted | pending | paid | completed
  total_in_inr integer not null,
  placed_at timestamptz default now(),
  created_at timestamptz default now(),
  last_activity timestamptz default now()
);

-- Order items table: line items within each order.
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  service_id uuid references services(id),
  quantity integer default 1,
  unit_price integer not null
);

