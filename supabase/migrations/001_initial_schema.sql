-- =====================================================
-- BOLÃO & CHURRAS — Schema Inicial
-- Supabase/PostgreSQL
-- =====================================================

-- EXTENSÕES
create extension if not exists "uuid-ossp";

-- =====================================================
-- TABELA: profiles (espelho de auth.users)
-- =====================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- RLS: Cada usuário vê e edita apenas seu próprio perfil
create policy "profiles: select own"
  on public.profiles for select
  to authenticated
  using ( (select auth.uid()) = id );

create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

create policy "profiles: insert own"
  on public.profiles for insert
  to authenticated
  with check ( (select auth.uid()) = id );

-- Grants
grant select, insert, update on public.profiles to authenticated;

-- =====================================================
-- TABELA: groups
-- =====================================================
create table public.groups (
  id uuid primary key default uuid_generate_v4(),
  organizer_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  pool_entry_fee numeric(10,2) default 0,
  event_date timestamptz,
  event_location text,
  pix_key text,
  pix_qrcode text,
  scoring_exact boolean default true,
  scoring_winner boolean default true,
  points_exact int default 3,
  points_winner int default 1,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index idx_groups_slug on public.groups(slug);
create index idx_groups_organizer on public.groups(organizer_id);

alter table public.groups enable row level security;

-- RLS: Organizador tem controle total; público pode ler grupos ativos
create policy "groups: organizer full access"
  on public.groups for all
  to authenticated
  using ( (select auth.uid()) = organizer_id )
  with check ( (select auth.uid()) = organizer_id );

create policy "groups: public read active"
  on public.groups for select
  to anon, authenticated
  using ( is_active = true );

grant select on public.groups to anon, authenticated;
grant insert, update, delete on public.groups to authenticated;

-- =====================================================
-- TABELA: participants
-- =====================================================
create table public.participants (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name text not null,
  whatsapp text not null,
  has_paid boolean default false,
  paid_at timestamptz,
  confirmed_presence boolean default false,
  avatar_seed text not null,
  created_at timestamptz default now(),
  unique(group_id, whatsapp)
);

create index idx_participants_group on public.participants(group_id);

alter table public.participants enable row level security;

-- RLS: Leitura pública do grupo; escrita para criar participante (sem auth); 
--       organizador tem controle total
create policy "participants: public read"
  on public.participants for select
  to anon, authenticated
  using ( true );

create policy "participants: anon insert"
  on public.participants for insert
  to anon, authenticated
  with check ( true );

create policy "participants: organizer update"
  on public.participants for update
  to authenticated
  using (
    exists (
      select 1 from public.groups g
      where g.id = group_id and g.organizer_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.groups g
      where g.id = group_id and g.organizer_id = (select auth.uid())
    )
  );

create policy "participants: self update"
  on public.participants for update
  to anon, authenticated
  using ( true )
  with check ( true );

create policy "participants: organizer delete"
  on public.participants for delete
  to authenticated
  using (
    exists (
      select 1 from public.groups g
      where g.id = group_id and g.organizer_id = (select auth.uid())
    )
  );

grant select, insert, update on public.participants to anon, authenticated;
grant delete on public.participants to authenticated;

-- =====================================================
-- TABELA: matches
-- =====================================================
create table public.matches (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  external_id int,
  home_team text not null,
  away_team text not null,
  home_flag text,
  away_flag text,
  match_date timestamptz not null,
  stage text not null default 'Fase de Grupos',
  status text not null default 'scheduled' check (status in ('scheduled','live','finished','cancelled')),
  home_score int,
  away_score int,
  created_at timestamptz default now()
);

create index idx_matches_group on public.matches(group_id);

alter table public.matches enable row level security;

create policy "matches: public read"
  on public.matches for select
  to anon, authenticated
  using ( true );

create policy "matches: organizer write"
  on public.matches for all
  to authenticated
  using (
    exists (
      select 1 from public.groups g
      where g.id = group_id and g.organizer_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.groups g
      where g.id = group_id and g.organizer_id = (select auth.uid())
    )
  );

grant select on public.matches to anon, authenticated;
grant insert, update, delete on public.matches to authenticated;

-- =====================================================
-- TABELA: predictions
-- =====================================================
create table public.predictions (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  home_prediction int not null check (home_prediction >= 0),
  away_prediction int not null check (away_prediction >= 0),
  points_earned int default 0,
  created_at timestamptz default now(),
  unique(match_id, participant_id)
);

create index idx_predictions_match on public.predictions(match_id);
create index idx_predictions_participant on public.predictions(participant_id);

alter table public.predictions enable row level security;

-- Qualquer um pode ler palpites (ranking público)
create policy "predictions: public read"
  on public.predictions for select
  to anon, authenticated
  using ( true );

-- Qualquer um pode inserir palpite (sem login)
create policy "predictions: insert"
  on public.predictions for insert
  to anon, authenticated
  with check ( true );

-- Atualização de palpite (pelo participante ou organizador)
create policy "predictions: update"
  on public.predictions for update
  to anon, authenticated
  using ( true )
  with check ( true );

grant select, insert, update on public.predictions to anon, authenticated;

-- =====================================================
-- TABELA: event_items
-- =====================================================
create table public.event_items (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete set null,
  item_name text not null,
  quantity text default '1',
  unit text default 'un',
  assigned boolean default false,
  created_at timestamptz default now()
);

create index idx_event_items_group on public.event_items(group_id);

alter table public.event_items enable row level security;

create policy "event_items: public read"
  on public.event_items for select
  to anon, authenticated
  using ( true );

create policy "event_items: insert"
  on public.event_items for insert
  to anon, authenticated
  with check ( true );

create policy "event_items: delete own"
  on public.event_items for delete
  to anon, authenticated
  using ( true );

grant select, insert, delete on public.event_items to anon, authenticated;

-- =====================================================
-- TRIGGER: Criar perfil automaticamente ao registrar
-- =====================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Revoke de execução pública da função
revoke execute on function public.handle_new_user() from anon;
