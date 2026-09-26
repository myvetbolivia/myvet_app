// Suma una visita o un clic (WhatsApp, llamada, ubicación) al contador del
// veterinario. Usa "keepalive" para que el aviso llegue aunque el celular
// salga enseguida de la página para abrir WhatsApp o el teléfono.
const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function track(fn, vetId) {
  if (!URL || !KEY || !vetId) return;
  try {
    fetch(`${URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      keepalive: true,
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_vet_id: vetId }),
    }).catch(() => {});
  } catch {
    /* si falla, no interrumpe al usuario */
  }
}

// Número de Bolivia listo para llamar o para WhatsApp (agrega +591 si hace falta).
export function boliviaNumber(raw) {
  const num = (raw || "").replace(/\D/g, "");
  if (!num) return "";
  return num.length <= 8 ? `591${num}` : num;
}
