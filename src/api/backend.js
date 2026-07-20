const API_BASE_URL = "http://127.0.0.1:4001/api";
const TOKEN_STORAGE_KEY = "home-sky.auth-token";

export function loadToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function request(path, options = {}) {
  const token = loadToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

export async function signUp(payload) {
  const data = await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  saveToken(data.token);
  return data.user;
}

export async function logIn(payload) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  saveToken(data.token);
  return data.user;
}

export async function getGoogleConfig() {
  return request("/auth/google/config");
}

export async function logInWithGoogleCredential(credential) {
  const data = await request("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  saveToken(data.token);
  return data.user;
}

export async function getMe() {
  return request("/me");
}

export async function saveUserLocations(payload) {
  return request("/locations", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
