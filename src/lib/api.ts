const API_URL = import.meta.env.VITE_API_URL || "";

function getAdminKey(): string {
  return localStorage.getItem("portalx6_admin_key") || "";
}

export function setAdminKey(key: string) {
  localStorage.setItem("portalx6_admin_key", key);
}

export function hasAdminKey(): boolean {
  return Boolean(getAdminKey());
}

export function isAdminVerified(): boolean {
  return Boolean(getAdminKey()) && localStorage.getItem("portalx6_admin_verified") === "1";
}

export async function verifyAdminKey(key: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/health`, {
    method: "POST",
    headers: { "x-api-key": key },
  });
  const ok = res.ok;
  if (ok) {
    localStorage.setItem("portalx6_admin_key", key);
    localStorage.setItem("portalx6_admin_verified", "1");
  }
  return ok;
}

export function clearAdminKey() {
  localStorage.removeItem("portalx6_admin_key");
  localStorage.removeItem("portalx6_admin_verified");
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request gagal (${res.status})`);
  return json.data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": getAdminKey() },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-api-key": getAdminKey() },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: { "x-api-key": getAdminKey() },
  });
  return handleResponse<T>(res);
}

export { API_URL };
