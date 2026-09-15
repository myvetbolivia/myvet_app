-- =====================================================================
-- MY VET — Script único de base de datos para Supabase
-- =====================================================================
-- Cómo usar este archivo:
-- 1. Andá a tu proyecto en https://supabase.com
-- 2. En el menú de la izquierda, entrá a "SQL Editor"
-- 3. Creá una consulta nueva ("New query")
-- 4. Pegá TODO este archivo, de arriba a abajo
-- 5. Apretá "Run" (o Ctrl+Enter)
-- Con eso quedan creadas todas las tablas, reglas de seguridad y datos
-- iniciales que la aplicación necesita. Este script se puede correr una
-- sola vez en un proyecto nuevo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABLA "profiles" — un registro por cada persona que se crea una
--    cuenta (clientes, veterinarios y administradores).
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('admin','veterinarian','client')),
  full_name text,
  email text,
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now()
);

-- Cuando alguien crea una cuenta (se registra), Supabase la guarda en una
-- tabla especial llamada auth.users. Este "disparador" (trigger) copia
-- automáticamente los datos básicos a nuestra tabla "profiles", con el
-- rol "client" por defecto.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Función auxiliar para saber si el usuario que está haciendo una acción
-- es administrador. Se usa dentro de las reglas de seguridad de abajo.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = uid and role = 'admin');
$$;

alter table public.profiles enable row level security;

create policy "cualquiera puede ver perfiles básicos"
  on public.profiles for select
  using (true);

create policy "cada usuario edita su propio perfil (sin auto-ascenderse)"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role in ('client','veterinarian'));

create policy "los administradores pueden editar cualquier perfil"
  on public.profiles for update
  using (public.is_admin(auth.uid()));

create policy "los administradores pueden eliminar perfiles"
  on public.profiles for delete
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------
-- 2. TABLA "veterinarian_profiles" — la ficha profesional completa de
--    cada veterinario: datos, especialidades, plan, ubicación, etc.
-- ---------------------------------------------------------------------
create table if not exists public.veterinarian_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  whatsapp text,
  description text,
  university text,
  species text[] not null default '{}',
  specialties text[] not null default '{}',
  services text[] not null default '{}',
  provincia text,
  municipio text,
  zona text,
  address text,
  lat double precision,
  lng double precision,
  social_link text,
  photo_url text,
  schedule jsonb not null default '[]',
  plan text not null default 'basico' check (plan in ('basico','premium','ultra')),
  verification_status text not null default 'pending' check (verification_status in ('pending','approved','rejected')),
  profile_status text not null default 'inactive' check (profile_status in ('inactive','active','suspended')),
  plan_expiry date,
  featured boolean not null default false,
  rating numeric(2,1),
  reviews_count int not null default 0,
  profile_views int not null default 0,
  whatsapp_clicks int not null default 0,
  call_clicks int not null default 0,
  location_clicks int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.veterinarian_profiles enable row level security;

-- Cualquier visitante (incluso sin cuenta) puede ver los perfiles que
-- ya están activos y con el pago al día — así funciona el buscador público.
create policy "el público ve perfiles activos"
  on public.veterinarian_profiles for select
  using (profile_status = 'active' and (plan_expiry is null or plan_expiry >= current_date));

-- El veterinario dueño del perfil siempre puede ver el suyo (esté activo o no).
create policy "el veterinario ve su propio perfil"
  on public.veterinarian_profiles for select
  using (auth.uid() = id);

-- Los administradores ven todos los perfiles, en cualquier estado.
create policy "los administradores ven todos los perfiles"
  on public.veterinarian_profiles for select
  using (public.is_admin(auth.uid()));

-- Un veterinario crea su propia ficha al registrarse.
create policy "el veterinario crea su propio perfil"
  on public.veterinarian_profiles for insert
  with check (auth.uid() = id);

-- Un veterinario edita su propia ficha (pero no puede tocar plan, estado,
-- fecha de vencimiento ni si está destacado: eso solo lo controla el admin).
create policy "el veterinario edita su propio perfil"
  on public.veterinarian_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- El veterinario puede editar su ficha, pero NUNCA sus propios datos de
-- suscripción (plan, si está activo, si está destacado, hasta cuándo vence
-- o si ya fue aprobado). Este "guardia" se asegura de eso automáticamente:
-- si alguien que no es administrador intenta cambiar esos campos, la base
-- de datos los deja como estaban, sin avisar ni fallar.
create or replace function public.protect_admin_only_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    new.plan := old.plan;
    new.profile_status := old.profile_status;
    new.featured := old.featured;
    new.plan_expiry := old.plan_expiry;
    new.verification_status := old.verification_status;
  end if;
  return new;
end;
$$;

drop trigger if exists before_vet_profile_update on public.veterinarian_profiles;
create trigger before_vet_profile_update
  before update on public.veterinarian_profiles
  for each row execute procedure public.protect_admin_only_fields();

-- Los administradores pueden editar cualquier ficha (aprobar, activar,
-- cambiar plan, destacar, etc.).
create policy "los administradores editan cualquier perfil"
  on public.veterinarian_profiles for update
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------
-- 3. TABLA "verification_documents" — documentos que sube el veterinario
--    para que la administradora los revise.
-- ---------------------------------------------------------------------
create table if not exists public.verification_documents (
  id bigint generated always as identity primary key,
  veterinarian_id uuid not null references public.veterinarian_profiles(id) on delete cascade,
  doc_url text not null,
  doc_type text,
  created_at timestamptz not null default now()
);

alter table public.verification_documents enable row level security;

create policy "el veterinario ve y sube sus propios documentos"
  on public.verification_documents for all
  using (auth.uid() = veterinarian_id)
  with check (auth.uid() = veterinarian_id);

create policy "los administradores ven todos los documentos"
  on public.verification_documents for select
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------
-- 4. TABLA "reviews" — reseñas y estrellas que dejan los clientes.
-- ---------------------------------------------------------------------
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  veterinarian_id uuid not null references public.veterinarian_profiles(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now(),
  unique (veterinarian_id, client_id)
);

alter table public.reviews enable row level security;

create policy "cualquiera ve reseñas publicadas"
  on public.reviews for select
  using (status = 'published');

create policy "el veterinario ve todas sus reseñas (aunque estén ocultas)"
  on public.reviews for select
  using (auth.uid() = veterinarian_id);

create policy "los administradores ven todas las reseñas"
  on public.reviews for select
  using (public.is_admin(auth.uid()));

create policy "un cliente crea su propia reseña"
  on public.reviews for insert
  with check (auth.uid() = client_id);

create policy "los administradores pueden ocultar o eliminar reseñas"
  on public.reviews for update
  using (public.is_admin(auth.uid()));

create policy "los administradores pueden eliminar reseñas"
  on public.reviews for delete
  using (public.is_admin(auth.uid()));

-- Cada vez que se agrega, edita o borra una reseña, esta función
-- recalcula automáticamente el promedio de estrellas y la cantidad
-- de reseñas del veterinario correspondiente.
create or replace function public.recalculate_vet_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_id uuid;
begin
  target_id := coalesce(new.veterinarian_id, old.veterinarian_id);
  update public.veterinarian_profiles
  set
    reviews_count = (select count(*) from public.reviews where veterinarian_id = target_id and status = 'published'),
    rating = (select round(avg(rating)::numeric, 1) from public.reviews where veterinarian_id = target_id and status = 'published')
  where id = target_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists on_review_change on public.reviews;
create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute procedure public.recalculate_vet_rating();

-- ---------------------------------------------------------------------
-- 5. Contadores de actividad (vistas, WhatsApp, llamadas, ubicación).
--    Son funciones simples y seguras que la app llama cada vez que
--    alguien ve un perfil o toca un botón de contacto.
-- ---------------------------------------------------------------------
create or replace function public.increment_profile_view(p_vet_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.veterinarian_profiles set profile_views = profile_views + 1 where id = p_vet_id;
$$;

create or replace function public.increment_whatsapp_click(p_vet_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.veterinarian_profiles set whatsapp_clicks = whatsapp_clicks + 1 where id = p_vet_id;
$$;

create or replace function public.increment_call_click(p_vet_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.veterinarian_profiles set call_clicks = call_clicks + 1 where id = p_vet_id;
$$;

create or replace function public.increment_location_click(p_vet_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.veterinarian_profiles set location_clicks = location_clicks + 1 where id = p_vet_id;
$$;

grant execute on function public.increment_profile_view(uuid) to anon, authenticated;
grant execute on function public.increment_whatsapp_click(uuid) to anon, authenticated;
grant execute on function public.increment_call_click(uuid) to anon, authenticated;
grant execute on function public.increment_location_click(uuid) to anon, authenticated;

-- =====================================================================
-- LISTO. Con esto ya quedaron creadas todas las tablas y reglas.
-- Los siguientes pasos (crear tu usuario administrador y los buckets
-- de imágenes) se hacen desde el panel de Supabase, no acá.
-- =====================================================================
