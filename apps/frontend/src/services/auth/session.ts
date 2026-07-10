const TOKEN_KEY = "novalink.token";
const USER_KEY = "novalink.user";
const EXPIRES_AT_KEY = "novalink.session-expires-at";
const DEFAULT_SESSION_DAYS = 7;
const SETTINGS_KEY = "novalink.company-settings";

export type SessionUser = {
  id: string;
  username: string;
  roles: string[];
  permissions: string[];
};

function storage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

function configuredSessionDurationMs() {
  const localStorage = storage();
  if (!localStorage) return DEFAULT_SESSION_DAYS * 24 * 60 * 60 * 1000;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const days = raw ? Number((JSON.parse(raw) as { sessionDays?: number }).sessionDays) : DEFAULT_SESSION_DAYS;
    const normalizedDays = Number.isFinite(days) ? Math.min(Math.max(days, 1), 30) : DEFAULT_SESSION_DAYS;
    return normalizedDays * 24 * 60 * 60 * 1000;
  } catch {
    return DEFAULT_SESSION_DAYS * 24 * 60 * 60 * 1000;
  }
}

function expirationFromToken(token: string) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(window.atob(padded)) as { exp?: number };
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

function isExpired(expiresAt: string | null) {
  return Boolean(expiresAt && Number(expiresAt) <= Date.now());
}

export function saveSession(token: string, user: SessionUser) {
  const localStorage = storage();
  if (!localStorage) return;
  const expiresAt = expirationFromToken(token) ?? Date.now() + configuredSessionDurationMs();
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify({ ...user, permissions: user.permissions ?? [] }));
  localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
}

export function getToken() {
  const localStorage = storage();
  if (!localStorage) return null;
  const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
  if (isExpired(expiresAt)) {
    clearSession();
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): SessionUser | null {
  const localStorage = storage();
  if (!localStorage || !getToken()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as SessionUser;
    return { ...user, roles: user.roles ?? [], permissions: user.permissions ?? [] };
  } catch {
    return null;
  }
}

export function clearSession() {
  const localStorage = storage();
  if (!localStorage) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function hasPermission(permission: string) {
  const user = getUser();
  return Boolean(user?.roles?.includes("ADMINISTRADOR") || user?.permissions?.includes(permission));
}
