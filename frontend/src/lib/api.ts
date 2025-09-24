import type { AdminArtist } from "@/types/admin";
const BASE = import.meta.env.VITE_API_BASE ?? "";

async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const AdminAPI = {
  listArtists: (status: string) =>
    api<AdminArtist[]>(`/admin/artists?status=${encodeURIComponent(status)}`),
  approveArtist: (id: number) =>
    api<{ id: number; status: "approved" }>(`/admin/artists/${id}/approve`, { method: "POST" }),
  rejectArtist: (id: number, reason?: string) =>
    api<{ id: number; status: "rejected"; rejection_reason?: string }>(
      `/admin/artists/${id}/reject`,
      { method: "POST", body: JSON.stringify({ reason }) }
    ),
};