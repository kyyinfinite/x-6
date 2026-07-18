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
