-- =====================================================================
-- VARIAS PROVINCIAS, MUNICIPIOS Y ZONAS POR VETERINARIO
-- (para los que atienden a domicilio o van a las propiedades)
-- Correr UNA vez en Supabase → SQL Editor → New query → Run.
-- Se puede volver a correr sin problema.
-- =====================================================================

alter table public.veterinarian_profiles
  add column if not exists provincias text[] not null default '{}',
  add column if not exists municipios text[] not null default '{}',
  add column if not exists zonas text[] not null default '{}';

-- Pasar lo que ya tenían cargado los veterinarios registrados (una sola
-- provincia, municipio y zona) a las listas nuevas, sin perder nada.
update public.veterinarian_profiles
  set provincias = array[provincia]
  where provincia is not null and provincia <> '' and cardinality(provincias) = 0;

update public.veterinarian_profiles
  set municipios = array[municipio]
  where municipio is not null and municipio <> '' and cardinality(municipios) = 0;

update public.veterinarian_profiles
  set zonas = array[zona]
  where zona is not null and zona <> '' and cardinality(zonas) = 0;
