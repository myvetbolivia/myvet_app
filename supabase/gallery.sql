-- =====================================================================
-- GALERÍA DE FOTOS (planes Premium y Premium Ultra Smart, hasta 5 fotos)
-- Correr UNA vez en Supabase → SQL Editor → New query → Run.
-- Las fotos se guardan en el mismo bucket "avatar", dentro de la carpeta
-- de cada veterinario, así que no hace falta crear otro bucket.
-- =====================================================================

alter table public.veterinarian_profiles
  add column if not exists gallery text[] not null default '{}';

-- Máximo 5 fotos por veterinario (la base de datos lo controla también).
alter table public.veterinarian_profiles
  drop constraint if exists gallery_max_5;
alter table public.veterinarian_profiles
  add constraint gallery_max_5 check (coalesce(cardinality(gallery), 0) <= 5);
