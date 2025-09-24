const baseUrl = import.meta.env.VITE_API_URL;

export async function getMe(token: string) {
  const res = await fetch(`${baseUrl}/api/artists/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`GET /artists/me ${res.status}`);
  return res.json();
}

export async function upsertMeProfile(token: string, payload: any) {
  const res = await fetch(`${baseUrl}/api/artists/me/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`PATCH /artists/me/profile ${res.status} ${t.slice(0, 120)}`);
  }
  return res.json().catch(() => ({}));
}

export async function createArtist(token: string, payload: any) {
  const res = await fetch(`${baseUrl}/api/artists`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /artists ${res.status}`);
  return res.json();
}

export async function updateArtist(token: string, id: string, payload: any) {
  const res = await fetch(`${baseUrl}/api/artists/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`PATCH /artists/${id} ${res.status} ${t.slice(0, 120)}`);
  }
  return res.json().catch(() => ({}));
}