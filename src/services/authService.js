import { getSupabaseClient, hasSupabaseConfig } from '../config/supabase.js';
import { HttpError } from '../utils/httpError.js';

function ensureSupabaseClient(token) {
  const client = getSupabaseClient(token);

  if (!client) {
    throw new HttpError(500, 'Supabase is not configured');
  }

  return client;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at
  };
}

export function parseAuthPayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email) {
    throw new HttpError(400, 'email is required');
  }

  if (!password) {
    throw new HttpError(400, 'password is required');
  }

  return { email, password };
}

export async function signUpUser(email, password) {
  const client = ensureSupabaseClient();
  const { data, error } = await client.auth.signUp({ email, password });

  if (error) {
    throw new HttpError(400, error.message || 'Unable to create user');
  }

  if (!data.user) {
    throw new HttpError(400, 'Unable to create user');
  }

  return sanitizeUser(data.user);
}

export async function loginUser(email, password) {
  const client = ensureSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: sanitizeUser(data.user)
  };
}

export async function verifyAccessToken(token) {
  if (!hasSupabaseConfig()) {
    throw new HttpError(401, 'Invalid or expired token');
  }

  try {
    const client = ensureSupabaseClient(token);
    const { data, error } = await client.auth.getUser(token);

    if (error || !data.user) {
      throw new HttpError(401, 'Invalid or expired token');
    }

    return sanitizeUser(data.user);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(401, 'Invalid or expired token');
  }
}

export async function logoutUser(token) {
  if (!hasSupabaseConfig()) {
    throw new HttpError(401, 'Invalid or expired token');
  }

  try {
    const client = ensureSupabaseClient(token);
    const { error } = await client.auth.signOut();

    if (error) {
      throw new HttpError(401, 'Invalid or expired token');
    }
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(401, 'Invalid or expired token');
  }
}

export function isSupabaseReady() {
  return hasSupabaseConfig();
}