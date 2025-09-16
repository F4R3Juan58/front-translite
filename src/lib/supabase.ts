import { createClient } from "@supabase/supabase-js";

// Las variables vienen de tu archivo .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "❌ Faltan las variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el archivo .env"
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
