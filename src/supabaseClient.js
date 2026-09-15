import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Esto no rompe la app, pero te avisa en la consola del navegador
  // si te olvidaste de completar el archivo .env.
  console.warn(
    "[MyVet] Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env"
  );
}

export const supabase = createClient(url, anonKey);
