-- ==========================================
-- OTAKONCE + SUPABASE — schema
-- Proyecto: crea estas tablas en el SQL Editor de Supabase.
-- El backend (/api) usa la SERVICE ROLE KEY, que bypass RLS.
-- Solo `cosplayers` tiene lectura pública (galería del sitio).
-- ==========================================

-- 1. Estado global (tema sincronizado)
create table if not exists app_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);
alter table app_state enable row level security;
-- Sin políticas públicas: solo service role.

-- 2. Postulaciones pasarela (contienen PII: contact, foto)
create table if not exists cosplay_applications (
  id text primary key,
  created_at timestamptz default now(),
  status text default 'pending',
  name varchar(80) not null,
  character varchar(120) not null,
  city varchar(60) default 'Concepción',
  contact varchar(160) not null,
  instagram varchar(200) default '',
  bio varchar(280) default '',
  photo text default '' -- 1 sola foto: URL https (Cloudinary) o data:image pequeña
);
alter table cosplay_applications enable row level security;
-- Sin políticas públicas: solo service role (el admin entra vía /api con sesión).

-- 3. Galería publicada (lo que ve todo el mundo, sin PII)
create table if not exists cosplayers (
  id text primary key,
  created_at timestamptz default now(),
  name varchar(80) not null,
  character varchar(120) not null,
  city varchar(60) default 'Concepción',
  image text default '',
  instagram varchar(200) default '',
  bio varchar(280) default '',
  role varchar(80) default 'Pasarela Individual',
  type varchar(20) default 'community',
  featured boolean default false
);
alter table cosplayers enable row level security;

-- Lectura pública de la galería (sin exponer contact: esa columna ni existe aquí)
drop policy if exists "public read cosplayers" on cosplayers;
create policy "public read cosplayers"
  on cosplayers for select
  to anon, authenticated
  using (true);

-- 4. Postulaciones de comunidades (contienen PII: contact, logo)
create table if not exists community_applications (
  id text primary key,
  created_at timestamptz default now(),
  status text default 'pending',
  name varchar(80) not null,
  type varchar(60) not null,
  description varchar(400) not null,
  contact varchar(160) not null,
  instagram varchar(200) default '',
  logo text default '' -- 1 solo logo: URL https (Cloudinary) o data:image pequeña
);
alter table community_applications enable row level security;
-- Sin políticas públicas: solo service role (el admin entra vía /api con sesión).

-- 5. Comunidades publicadas (lo que ve todo el mundo, sin PII)
create table if not exists communities (
  id text primary key,
  created_at timestamptz default now(),
  name varchar(80) not null,
  type varchar(60) not null,
  description varchar(400) not null,
  logo text default '',
  instagram varchar(200) default ''
);
alter table communities enable row level security;

drop policy if exists "public read communities" on communities;
create policy "public read communities"
  on communities for select
  to anon, authenticated
  using (true);
