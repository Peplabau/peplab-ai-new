import { SHOP_PATH } from '@/lib/routes';
import { getAdminAccess } from '@/lib/admin-access';
import { DEFAULT_LANDING_PAGE_SETTINGS, getSiteSetting } from '@/lib/settings';

const DASHBOARD_PATH = '/dashboard';

/** Allow same-origin path redirects only (blocks protocol-relative URLs). */
export function sanitizeRedirectPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw).trim();
    if (!decoded.startsWith('/') || decoded.startsWith('//')) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function isLandingPageEnabled(): Promise<boolean> {
  const settings = await getSiteSetting('landing_page_settings', DEFAULT_LANDING_PAGE_SETTINGS);
  return settings.enabled !== false;
}

/** Where to send a customer after login, based on admin landing toggle and ?redirect=. */
export async function resolvePostLoginPath(
  redirectParam: string | null | undefined,
  userId?: string | null,
): Promise<string> {
  const safeRedirect = sanitizeRedirectPath(redirectParam ?? null);
  if (safeRedirect) return safeRedirect;

  if (userId) {
    const access = await getAdminAccess(userId);
    if (access === 'landing') return '/admin/dashboard';
  }

  const landingEnabled = await isLandingPageEnabled();
  return landingEnabled ? DASHBOARD_PATH : SHOP_PATH;
}
