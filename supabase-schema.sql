-- Supabase SQL schema for the Finanças app
-- Execute this in Supabase SQL editor or via Supabase migrations

-- Enable UUID generation
create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null check (role in ('husband', 'wife')),
  password text not null,
  avatar text not null,
  color text not null,
  created_at timestamp with time zone default now()
);

create table if not exists categories (
  id text primary key,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text not null,
  color text not null,
  created_at timestamp with time zone default now()
);

create table if not exists credit_cards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credit_limit numeric not null,
  closing_day integer not null,
  due_day integer not null,
  color text not null,
  user_id uuid references users(id) on delete set null,
  created_at timestamp with time zone default now()
);

create table if not exists incomes (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  value numeric not null,
  description text not null,
  category_id text not null references categories(id) on delete restrict,
  user_id uuid references users(id) on delete set null,
  notes text,
  created_at timestamp with time zone default now()
);

create table if not exists installment_groups (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  total_value numeric not null,
  total_installments integer not null,
  installment_value numeric not null,
  category_id text not null references categories(id) on delete restrict,
  payment_method text not null,
  user_id uuid references users(id) on delete set null,
  card_id uuid references credit_cards(id) on delete set null,
  start_date date not null,
  created_at timestamp with time zone default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  purchase_date date not null,
  due_date date not null,
  value numeric not null,
  description text not null,
  category_id text not null references categories(id) on delete restrict,
  payment_method text not null,
  user_id uuid references users(id) on delete set null,
  status text not null check (status in ('paid', 'pending')),
  notes text,
  installment_group_id uuid references installment_groups(id) on delete set null,
  installment_number integer,
  total_installments integer,
  card_id uuid references credit_cards(id) on delete set null,
  created_at timestamp with time zone default now()
);

create table if not exists financial_goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_value numeric not null,
  current_value numeric not null,
  target_date date not null,
  description text,
  icon text not null,
  color text not null,
  user_id uuid references users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Optionally insert the default categories used by the app
insert into categories (id, name, type, icon, color)
values
  ('cat-sal', 'Salário', 'income', '💼', '#10b981'),
  ('cat-free', 'Freelance', 'income', '💻', '#6366f1'),
  ('cat-venda', 'Venda', 'income', '🛒', '#f59e0b'),
  ('cat-invest', 'Investimentos', 'income', '📈', '#3b82f6'),
  ('cat-outros-in', 'Outros', 'income', '💰', '#8b5cf6'),
  ('cat-alim', 'Alimentação', 'expense', '🍔', '#ef4444'),
  ('cat-farm', 'Farmácia', 'expense', '💊', '#ec4899'),
  ('cat-comb', 'Combustível', 'expense', '⛽', '#f97316'),
  ('cat-ener', 'Energia', 'expense', '⚡', '#eab308'),
  ('cat-agua', 'Água', 'expense', '💧', '#06b6d4'),
  ('cat-inter', 'Internet', 'expense', '🌐', '#8b5cf6'),
  ('cat-alug', 'Aluguel', 'expense', '🏠', '#6366f1'),
  ('cat-esc', 'Escola', 'expense', '📚', '#3b82f6'),
  ('cat-saude', 'Saúde', 'expense', '🏥', '#10b981'),
  ('cat-lazer', 'Lazer', 'expense', '🎮', '#f59e0b'),
  ('cat-cart', 'Cartão de Crédito', 'expense', '💳', '#64748b'),
  ('cat-outros-ex', 'Outros', 'expense', '📦', '#94a3b8')
on conflict (id) do nothing;
