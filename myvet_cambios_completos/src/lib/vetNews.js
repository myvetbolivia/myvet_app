// "Novedades" del veterinario: compara sus contadores actuales (vistas,
// WhatsApp, llamadas, ubicación, reseñas) con los que tenía la última vez
// que entró a su panel. Lo último que vio se guarda en este celular.

const FIELDS = [
  { key: "profile_views", singular: "persona vio tu perfil", plural: "personas vieron tu perfil" },
  { key: "whatsapp_clicks", singular: "persona te escribió por WhatsApp", plural: "personas te escribieron por WhatsApp" },
  { key: "call_clicks", singular: "persona te llamó", plural: "personas te llamaron" },
  { key: "location_clicks", singular: "persona buscó cómo llegar a tu consultorio", plural: "personas buscaron cómo llegar a tu consultorio" },
  { key: "reviews_count", singular: "reseña nueva", plural: "reseñas nuevas" },
];

const storageKey = (vetId) => `myvet_novedades_${vetId}`;

function readSeen(vetId) {
  try {
    const raw = localStorage.getItem(storageKey(vetId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Devuelve la lista de novedades (vacía si no hay nada nuevo).
// La primera vez que se usa en un celular no muestra nada: solo toma el punto de partida.
export function getVetNews(vet) {
  if (!vet?.id) return [];
  const seen = readSeen(vet.id);
  if (!seen) {
    markVetNewsSeen(vet);
    return [];
  }
  return FIELDS.map((f) => ({ ...f, count: Math.max(0, (vet[f.key] || 0) - (seen[f.key] || 0)) }))
    .filter((f) => f.count > 0)
    .map((f) => ({
      key: f.key,
      count: f.count,
      text: `${f.count} ${f.count === 1 ? f.singular : f.plural}`,
    }));
}

// Marca todo como visto (se llama al entrar al panel del veterinario).
export function markVetNewsSeen(vet) {
  if (!vet?.id) return;
  const snapshot = Object.fromEntries(FIELDS.map((f) => [f.key, vet[f.key] || 0]));
  try { localStorage.setItem(storageKey(vet.id), JSON.stringify(snapshot)); } catch { /* sin almacenamiento, no pasa nada */ }
}
