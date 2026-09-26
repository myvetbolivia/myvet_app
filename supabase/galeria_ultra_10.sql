-- =====================================================================
-- GALERÍA: hasta 10 fotos para Premium Ultra Smart (Premium sigue con 5,
-- eso lo controla la página).
-- Correr UNA vez en Supabase → SQL Editor → New query → Run.
-- Se puede volver a correr sin problema.
-- =====================================================================

alter table public.veterinarian_profiles
  drop constraint if exists gallery_max_5;
alter table public.veterinarian_profiles
  drop constraint if exists gallery_max_10;
alter table public.veterinarian_profiles
  add constraint gallery_max_10 check (coalesce(cardinality(gallery), 0) <= 10);
