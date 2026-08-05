import './environment.js';
import { createClient } from '@supabase/supabase-js';

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

function buildClient(token) {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return createClient(config.url, config.key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    },
    global: {
      headers
    }
  });
}

export function getSupabaseClient(token) {
  return buildClient(token);
}

export function hasSupabaseConfig() {
  return Boolean(getSupabaseConfig());
}