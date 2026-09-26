import { supabase } from "../supabaseClient";

// "Novedades" del veterinario: compara sus contadores actuales (vistas,
// WhatsApp, llamadas, ubicación, reseñas) con los que tenía la última vez
// que entró a su panel. Lo último que vio se guarda en su cuenta
// (columna news_seen), así funciona igual desde cualquier celular.

const FIELDS = [
  { key: "profile_views", singular: "persona vio tu perfil", plural: "personas vieron tu perfil" },
  { key: "whatsapp_clicks", singular: "persona te escribió por WhatsApp", plural: "personas te escribieron por WhatsApp" },
  { key: "call_clicks", singular: "persona te llamó", plural: "personas te llamaron" },
  { key: "location_clicks", singular: "persona buscó cómo llegar a tu consultorio", plural: "personas buscaron cómo llegar a tu consultorio" },
  { key: "reviews_count", singular: "reseña nueva", plural: "reseñas nuevas" },
];

export const NEWS_COLUMNS = "id, news_seen, " + FIELDS.map((f) => f.key).join(", ");

// Devuelve la lista de novedades (vacía si no hay nada nuevo).
// La primera vez muestra toda la actividad desde que se registró.
export function getVetNews(vet) {
  if (!vet?.id) return [];
  const seen = vet.news_seen || {};
  return FIELDS.map((f) => ({ ...f, count: Math.max(0, (vet[f.key] || 0) - (seen[f.key] || 0)) }))
    .filter((f) => f.count > 0)
    .map((f) => ({ key: f.key, count: f.count, text: `${f.count} ${f.count === 1 ? f.singular : f.plural}` }));
}

// Marca todo como visto (se llama al entrar al panel del veterinario).
export async function markVetNewsSeen(vet) {
  if (!vet?.id) return;
  const snapshot = Object.fromEntries(FIELDS.map((f) => [f.key, vet[f.key] || 0]));
  const { error } = await supabase.from("veterinarian_profiles").update({ news_seen: snapshot }).eq("id", vet.id);
  if (error) console.error("No se pudieron marcar las novedades como vistas:", error);
}
