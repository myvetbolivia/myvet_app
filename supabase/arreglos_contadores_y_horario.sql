-- =====================================================================
-- ARREGLOS: ubicación del consultorio, novedades del veterinario y
-- contadores de visitas / WhatsApp / llamadas / ubicación.
-- Correr UNA vez en Supabase → SQL Editor → New query → Run.
-- Se puede volver a correr sin problema.
-- =====================================================================

-- 1) Link de Google Maps del consultorio
alter table public.veterinarian_profiles
  add column if not exists maps_url text;

-- 2) Lo último que vio el veterinario en "Novedades" (se guarda en su cuenta,
--    así funciona desde cualquier celular)
alter table public.veterinarian_profiles
  add column if not exists news_seen jsonb not null default '{}';

-- 3) Horarios: los perfiles que quedaron con "A confirmar" pasan a vacío
update public.veterinarian_profiles
  set schedule = '[]'::jsonb
  where schedule = '[["A confirmar", "—"]]'::jsonb;

-- 4) Contadores: se vuelven a crear para asegurarse de que funcionen
--    para cualquier visitante (con o sin sesión iniciada).
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
