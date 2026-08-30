/**
 * One-off helper: create a storefront account and try to flag landing access.
 * Usage:
 *   LANDING_OP_EMAIL=... LANDING_OP_PASSWORD=... LANDING_OP_NAME=Sufyan node scripts/create-landing-operator.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(path) {
  const out = {};
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 1) continue;
      out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  } catch {
    /* missing file */
  }
  return out;
}

const fileEnv = {
  ...loadEnvFile(resolve(process.cwd(), '.env')),
  ...loadEnvFile(resolve(process.cwd(), '../peplab-ai/.env')),
};

const url = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY || fileEnv.VITE_SUPABASE_ANON_KEY;
const email = (process.env.LANDING_OP_EMAIL || '').trim().toLowerCase();
const password = process.env.LANDING_OP_PASSWORD || '';
const fullName = (process.env.LANDING_OP_NAME || 'Sufyan').trim();

if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}
if (!email || !password) {
  console.error('Missing LANDING_OP_EMAIL or LANDING_OP_PASSWORD');
  process.exit(1);
}

const supabase = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name: fullName, name: fullName } },
});

let userId = signUpData?.user?.id || null;
let created = false;

if (signUpError) {
  const already = /already\s+registered|already\s+exists/i.test(signUpError.message || '');
  if (!already) {
    console.error('SIGNUP_FAILED', signUpError.message);
    process.exit(1);
  }
  console.log('ACCOUNT_EXISTS');
} else {
  created = Boolean(userId);
  console.log(created ? 'ACCOUNT_CREATED' : 'SIGNUP_NO_USER');
}

const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (signInError) {
  console.log('SIGNIN_FAILED', signInError.message);
} else {
  userId = signInData.user?.id || userId;
  console.log('SIGNED_IN', userId || '');
}

if (userId) {
  await new Promise((r) => setTimeout(r, 800));
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      can_manage_landing: true,
    })
    .eq('id', userId);

  if (profileErr) {
    console.log('PROFILE_UPDATE_FAILED', profileErr.message);
  } else {
    const { data: row } = await supabase
      .from('profiles')
      .select('id, email, full_name, can_manage_landing, is_admin')
      .eq('id', userId)
      .maybeSingle();
    console.log('PROFILE', JSON.stringify(row));
  }
}

console.log(JSON.stringify({ created, userId, email, fullName }));
