import { supabase } from '@/lib/supabase';
import { cached, invalidateCache, TTL_ADMIN } from '@/lib/cache';

export type AdminAccess = 'full' | 'landing' | null;

async function resolveAdminAccess(userId: string): Promise<AdminAccess> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (user?.id === userId && user.user_metadata?.role === 'admin') return 'full';

    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin, can_manage_landing')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      if (error.message?.includes('can_manage_landing')) {
        const { data: fallback } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', userId)
          .maybeSingle();
        return fallback?.is_admin ? 'full' : null;
      }
      return null;
    }

    if (data?.is_admin) return 'full';
    if (data?.can_manage_landing) return 'landing';
    return null;
  } catch (err) {
    console.error('Error resolving admin access:', err);
    return null;
  }
}

export const getAdminAccess = (userId: string): Promise<AdminAccess> =>
  cached(`admin-access:${userId}`, () => resolveAdminAccess(userId), TTL_ADMIN);

export function invalidateAdminAccess(userId?: string): void {
  invalidateCache(userId ? `admin-access:${userId}` : 'admin-access:');
}

export async function setLandingPageEnabled(enabled: boolean): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('set_landing_page_enabled', { p_enabled: enabled });
  if (error) return { ok: false, error: error.message };
  const row = data as { ok?: boolean; error?: string } | null;
  if (row?.ok) {
    invalidateCache('setting:landing_page_settings');
    invalidateCache('all_settings');
    return { ok: true };
  }
  return { ok: false, error: row?.error || 'Could not update landing page' };
}

export async function grantLandingAccess(
  email: string,
  enabled = true,
  fullName?: string,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('grant_landing_access', {
    p_email: email.trim(),
    p_enabled: enabled,
    p_full_name: fullName?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as { ok?: boolean; error?: string; user_id?: string } | null;
  if (row?.ok) {
    if (row.user_id) invalidateAdminAccess(row.user_id);
    return { ok: true };
  }
  const code = row?.error;
  if (code === 'profile_not_found') {
    return { ok: false, error: 'No account with that email yet. Ask them to sign up first, then grant access.' };
  }
  if (code === 'not_authorized') return { ok: false, error: 'Only a full admin can grant this.' };
  return { ok: false, error: code || 'Could not update landing access' };
}
