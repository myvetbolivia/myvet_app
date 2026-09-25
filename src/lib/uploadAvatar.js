import { supabase } from "../supabaseClient";

// Nombre EXACTO del bucket de fotos de perfil en Supabase (Storage).
export const AVATAR_BUCKET = "avatar";

// Achica la foto (máx. 800 px de lado) y la pasa a JPG, para que pese poco
// y cargue rápido. Si el navegador no puede procesarla, se sube tal cual.
async function shrinkImage(file, maxSide = 800) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    return blob ? { body: blob, ext: "jpg", type: "image/jpeg" } : null;
  } catch {
    return null;
  }
}

// Sube la foto de perfil del veterinario y devuelve su enlace público.
// Se guarda en la carpeta del propio usuario: <id del usuario>/perfil-<fecha>.jpg
export async function uploadAvatar(userId, file) {
  return uploadImage(userId, file, "perfil", 800);
}

// Sube una foto de la galería (un poco más grande, para verla ampliada).
export async function uploadGalleryPhoto(userId, file) {
  return uploadImage(userId, file, "galeria", 1400);
}

// Borra del Storage una foto a partir de su enlace público (si falla, no pasa nada).
export async function deleteImageByUrl(url) {
  const marker = `/object/public/${AVATAR_BUCKET}/`;
  const i = (url || "").indexOf(marker);
  if (i === -1) return;
  const path = decodeURIComponent(url.slice(i + marker.length));
  await supabase.storage.from(AVATAR_BUCKET).remove([path]);
}

async function uploadImage(userId, file, prefix, maxSide) {
  const shrunk = await shrinkImage(file, maxSide);
  const ext = shrunk ? shrunk.ext : ((file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg");
  const path = `${userId}/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, shrunk ? shrunk.body : file, { upsert: true, contentType: shrunk ? shrunk.type : file.type || undefined });
  if (error) throw error;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Arma un nombre de archivo seguro (sin espacios ni acentos) para los documentos.
export function safeFileName(prefix, file) {
  const ext = (file.name.split(".").pop() || "pdf").toLowerCase().replace(/[^a-z0-9]/g, "") || "pdf";
  return `${prefix}-${Date.now()}.${ext}`;
}
