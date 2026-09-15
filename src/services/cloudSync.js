// Cloud synchronization service for cross-device theme persistence and cosplay registrations
const THEME_OBJECT_ID = 'ff808181a09d98f701a0a30588070a70';
const APPLICATIONS_OBJECT_ID = 'ff808181a09d98f701a0a306952c0a72';
const API_BASE = 'https://api.restful-api.dev/objects';

const LOCAL_KEYS = {
  THEME: 'otakonce_cloud_theme',
  APPLICATIONS: 'otakonce_cosplay_applications'
};

/**
 * Fetch the global theme configured by the admin across all devices.
 */
export const getGlobalTheme = async () => {
  try {
    const res = await fetch(`${API_BASE}/${THEME_OBJECT_ID}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.themeMode) {
        localStorage.setItem(LOCAL_KEYS.THEME, json.data.themeMode);
        return json.data.themeMode;
      }
    }
  } catch (err) {
    console.warn('Could not fetch cloud theme, falling back to local storage:', err);
  }
  return localStorage.getItem(LOCAL_KEYS.THEME) || 'normal';
};

/**
 * Save the global theme and broadcast it to all devices via the cloud API.
 */
export const saveGlobalTheme = async (themeMode) => {
  localStorage.setItem(LOCAL_KEYS.THEME, themeMode);
  try {
    const res = await fetch(`${API_BASE}/${THEME_OBJECT_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'otakonce-global-theme',
        data: { themeMode, updatedAt: Date.now() }
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not save cloud theme:', err);
    return false;
  }
};

/**
 * Fetch all pending cosplay pasarela applications from cloud.
 */
export const getCosplayApplications = async () => {
  try {
    const res = await fetch(`${API_BASE}/${APPLICATIONS_OBJECT_ID}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data.applications)) {
        localStorage.setItem(LOCAL_KEYS.APPLICATIONS, JSON.stringify(json.data.applications));
        return json.data.applications;
      }
    }
  } catch (err) {
    console.warn('Could not fetch cloud applications:', err);
  }
  try {
    const local = localStorage.getItem(LOCAL_KEYS.APPLICATIONS);
    return local ? JSON.parse(local) : [];
  } catch {
    return [];
  }
};

/**
 * Submit a new cosplay pasarela application.
 */
export const submitCosplayApplication = async (application) => {
  const newApp = {
    id: Date.now(),
    createdAt: new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: 'pending',
    ...application
  };

  // 1. Update local storage first
  let currentList = [];
  try {
    const local = localStorage.getItem(LOCAL_KEYS.APPLICATIONS);
    currentList = local ? JSON.parse(local) : [];
  } catch {
    currentList = [];
  }
  const updatedLocal = [newApp, ...currentList.filter(a => a.id !== newApp.id)];
  localStorage.setItem(LOCAL_KEYS.APPLICATIONS, JSON.stringify(updatedLocal));

  // 2. Sync to cloud API
  try {
    const cloudApps = await getCosplayApplications();
    const updatedCloud = [newApp, ...cloudApps.filter(a => a.id !== newApp.id)];

    await fetch(`${API_BASE}/${APPLICATIONS_OBJECT_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'otakonce-cosplay-applications',
        data: { applications: updatedCloud, updatedAt: Date.now() }
      })
    });
  } catch (err) {
    console.warn('Could not sync application to cloud:', err);
  }

  return newApp;
};

/**
 * Remove or dismiss a cosplay application from the list.
 */
export const removeCosplayApplication = async (applicationId) => {
  // Update local
  try {
    const local = localStorage.getItem(LOCAL_KEYS.APPLICATIONS);
    if (local) {
      const filtered = JSON.parse(local).filter(a => a.id !== applicationId);
      localStorage.setItem(LOCAL_KEYS.APPLICATIONS, JSON.stringify(filtered));
    }
  } catch {}

  // Update cloud
  try {
    const cloudApps = await getCosplayApplications();
    const filtered = cloudApps.filter(a => a.id !== applicationId);
    await fetch(`${API_BASE}/${APPLICATIONS_OBJECT_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'otakonce-cosplay-applications',
        data: { applications: filtered, updatedAt: Date.now() }
      })
    });
    return filtered;
  } catch (err) {
    console.warn('Could not remove cloud application:', err);
    return [];
  }
};
