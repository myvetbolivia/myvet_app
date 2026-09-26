-- =====================================================================
-- PERMISO PARA QUE LOS ADMINISTRADORES BORREN LAS FOTOS Y DOCUMENTOS
-- de un veterinario cuando eliminan su perfil desde el panel.
-- Correr UNA vez en Supabase → SQL Editor → New query → Run.
-- Se puede volver a correr sin problema.
-- =====================================================================

drop policy if exists "Administradores borran fotos" on storage.objects;
create policy "Administradores borran fotos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatar' and public.is_admin(auth.uid()));

drop policy if exists "Administradores borran documentos" on storage.objects;
create policy "Administradores borran documentos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'verification-documents' and public.is_admin(auth.uid()));
