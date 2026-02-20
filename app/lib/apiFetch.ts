/**
 * Thin wrapper around fetch that automatically attaches the Bearer token
 * from localStorage to every request.
 *
 * Usage:
 *   import { apiFetch } from "@/lib/apiFetch";
 *   const data = await apiFetch("/products");
 */

const TOKEN_KEY = "admin_token";

type FetchOptions = RequestInit & {
  /** Extra headers beyond Content-Type + Authorization */
  headers?: Record<string, string>;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // Token expired / invalid — kick back to login
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("admin_user");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? `HTTP ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
}
