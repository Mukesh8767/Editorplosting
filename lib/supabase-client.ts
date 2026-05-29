import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "./config";

let supabaseClient: SupabaseClient | null = null;
let supabaseAdmin: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_URL are required.");
  }

  if (!supabaseClient) {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }

  return supabaseClient;
};

export const getSupabaseAdmin = () => {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_KEY and SUPABASE_URL are required.");
  }

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceKey, {
      auth: { persistSession: false },
    });
  }

  return supabaseAdmin;
};
