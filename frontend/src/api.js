const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8765';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function saveSession(token, user) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch { void 0; }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch { void 0; }
}

export function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function isAuthenticated() {
  return !!getToken();
}

async function handleResponse(res) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore JSON parse error; non-JSON or empty body
  }
  if (!res.ok) {
    const message = data?.detail || data?.message || res.statusText || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

/**
 * Register a user. If is_professional = true, include `professional` payload:
 * {
 *   email, password, full_name?, phone?, city?,
 *   is_professional: true,
 *   professional: {
 *     nombre_completo, profesion_principal,
 *     ciudad?, barrio?, telefono?, email?, descripcion_breve?
 *   }
 * }
 */
export async function apiRegister(payload) {
  const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * Login and persist session.
 * Returns { access_token, user }
 */
export async function apiLogin({ email, password }) {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  saveSession(data?.access_token, data?.user);
  return data;
}

export async function apiLogout() {
  clearSession();
}

/**
 * Example of an authenticated GET
 */
export async function apiGet(path) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  });
  return handleResponse(res);
}

/**
 * Example of an authenticated POST
 */
export async function apiPost(path, body) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(body ?? {}),
  });
  return handleResponse(res);
}