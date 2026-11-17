/**
 * XTREME AI In-App Update Engine
 * Manages checking for updates, cache flushing, and live hot-reloading for Web, PWA, and Desktop App.
 */

export const CURRENT_APP_VERSION = '1.5.0';
export const CURRENT_BUILD_TIMESTAMP = 1794500000000;

/**
 * Checks the live server for any newly deployed version
 */
export async function checkForAppUpdates() {
  try {
    const res = await fetch(`/version.json?_nocache=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!res.ok) {
      return { hasUpdate: false, currentVersion: CURRENT_APP_VERSION, error: 'Could not fetch version data' };
    }

    const data = await res.json();
    const serverTimestamp = data.buildTimestamp || 0;
    const serverVersion = data.version || CURRENT_APP_VERSION;

    // Check if server build is newer or version string differs
    const isNewer = serverTimestamp > CURRENT_BUILD_TIMESTAMP || serverVersion !== CURRENT_APP_VERSION;

    return {
      hasUpdate: isNewer,
      currentVersion: CURRENT_APP_VERSION,
      serverVersion: data.version,
      buildDate: data.buildDate,
      title: data.title,
      highlights: data.highlights || []
    };
  } catch (err) {
    console.warn('Update check failed:', err.message);
    return { hasUpdate: false, currentVersion: CURRENT_APP_VERSION, error: err.message };
  }
}

/**
 * Performs a comprehensive cache-clearing update and reloads the application
 */
export async function applyAppUpdate() {
  try {
    // 1. Purge all CacheStorage caches
    if ('caches' in window) {
      const cacheKeys = await window.caches.keys();
      await Promise.all(cacheKeys.map(k => window.caches.delete(k)));
    }

    // 2. Unregister or update Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        try {
          await reg.update();
          await reg.unregister();
        } catch (e) {
          // ignore
        }
      }
    }

    // 3. Mark update timestamp in localStorage so the app knows it was refreshed
    localStorage.setItem('xtreme_last_updated_at', Date.now().toString());

    // 4. Hard reload with cache-busting timestamp
    const separator = window.location.href.includes('?') ? '&' : '?';
    const reloadTarget = window.location.origin + window.location.pathname + separator + '_fresh=' + Date.now();
    window.location.replace(reloadTarget);
  } catch (err) {
    console.error('Failed to clear cache during update:', err);
    window.location.reload(true);
  }
}
