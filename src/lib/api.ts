// src/lib/api.ts
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type JSONMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type Options = {
  method?: JSONMethod;
  token?: string | null;
  body?: unknown;
  headers?: Record<string, string>;
};

/**
 * Llamadas JSON (Content-Type application/json)
 */
export async function apiFetch<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const { method = "GET", token, body, headers = {} } = opts;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch (_) {
    // puede no haber body (204, etc.)
  }

  if (!res.ok) {
    const msg = (data as any)?.error || (data as any)?.message || `API error ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

/**
 * Helper para componer querystring
 */
function toQuery(query?: Record<string, string | number | boolean | undefined>) {
  if (!query) return "";
  const entries = Object.entries(query).filter(([, v]) => v !== undefined && v !== null);
  if (!entries.length) return "";
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return `?${qs}`;
}

/**
 * Subida de ficheros (FormData). No establecer "Content-Type": lo pone el navegador.
 * Ejemplo:
 *   await apiUpload(`/routes/${id}/files`, files, { token, query: { type: "invoice" } })
 */
export async function apiUpload<T = unknown>(
  path: string,
  files: File[] | Blob[],
  opts: { token?: string | null; query?: Record<string, string | number | boolean | undefined> } = {}
): Promise<T> {
  const url = `${API_URL}${path}${toQuery(opts.query)}`;

  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));

  const headers: Record<string, string> = {};
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: fd,
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch (_) {}

  if (!res.ok) {
    const msg = (data as any)?.error || (data as any)?.message || `API error ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

/**
 * DELETE simple (puedes usar apiFetch con method:"DELETE", pero esto acorta)
 */
export async function apiDelete(path: string, token?: string | null): Promise<void> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    let msg = `API error ${res.status}`;
    try {
      const j = await res.json();
      msg = j.error || j.message || msg;
    } catch {}
    throw new Error(msg);
  }
}
