-- =====================================================================
-- PERMISOS DE STORAGE (fotos de perfil y documentos de verificación)
-- Correr UNA vez en Supabase → SQL Editor → New query → Run.
-- Se puede volver a correr sin problema: borra y recrea las reglas.
-- =====================================================================

-- ---------- FOTOS DE PERFIL (bucket "avatar", público) ----------

-- Cualquiera puede ver las fotos (para el perfil público).
drop policy if exists "Fotos de perfil visibles para todos" on storage.objects;
create policy "Fotos de perfil visibles para todos"
  on storage.objects for select
  using (bucket_id = 'avatar');

-- Cada veterinario sube fotos solo dentro de su propia carpeta.
drop policy if exists "Veterinarios suben su foto" on storage.objects;
create policy "Veterinarios suben su foto"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatar' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Veterinarios cambian su foto" on storage.objects;
create policy "Veterinarios cambian su foto"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatar' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatar' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Veterinarios borran su foto" on storage.objects;
create policy "Veterinarios borran su foto"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatar' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- DOCUMENTOS (bucket "verification-documents", privado) ----------

-- Cada veterinario sube documentos solo a su propia carpeta.
drop policy if exists "Veterinarios suben sus documentos" on storage.objects;
create policy "Veterinarios suben sus documentos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Veterinarios reemplazan sus documentos" on storage.objects;
create policy "Veterinarios reemplazan sus documentos"
  on storage.objects for update to authenticated
  using (bucket_id = 'verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- Solo el propio veterinario y los administradores pueden ver los documentos.
drop policy if exists "Documentos visibles para su dueño y administradores" on storage.objects;
create policy "Documentos visibles para su dueño y administradores"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'verification-documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin(auth.uid()))
  );
