const UPSTREAM = 'https://eu.posthog.com';
const ALLOW_ORIGIN = 'https://pepeshows.de'; // bei Bedarf auf deine Preview-Domain erweitern

function corsHeaders(req: Request) {
  const reqOrigin = req.headers.get('Origin') || '';
  // Erlaube exakt die anfragende Origin, sofern pepeshows.de; sonst Fallback
  let origin = ALLOW_ORIGIN;
  try {
    const o = new URL(reqOrigin);
    if (o.hostname.endsWith('pepeshows.de')) origin = reqOrigin;
  } catch {}

  // Preflight-Header dynamisch spiegeln
  const reqMethod = req.headers.get('Access-Control-Request-Method') || 'GET,POST,OPTIONS';
  const reqHeaders = req.headers.get('Access-Control-Request-Headers') || 'Content-Type, Authorization';

  return {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': reqMethod || 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': reqHeaders,
    'Access-Control-Max-Age': '86400',
    // Hilfreich fürs Debugging im Network-Panel
    'Access-Control-Expose-Headers': 'cf-cache-status',
  } as Record<string, string>;
}

export default {
  async fetch(req: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(req.url);

    // Debug-Probe: /__probe zeigt, ob die Route am Worker hängt
    if (url.pathname === '/__probe') {
      return new Response('ok', { status: 200, headers: corsHeaders(req) });
    }

    // 1) Preflight sofort beantworten
    if (req.method === 'OPTIONS') {
      const headers = corsHeaders(req);
      headers['Cache-Control'] = 'no-store';
      return new Response(null, { status: 204, headers });
    }

    // 2) Proxy-Ziel bauen
    const target = new URL(url.pathname + url.search, UPSTREAM);

    // 3) /static/*: GET direkt weiterleiten (CORS-Header adden, Cache bleibt wie konfiguriert)
    const isStatic = url.pathname.startsWith('/static/');
    const init: RequestInit = {
      method: req.method,
      headers: new Headers(req.headers),
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.arrayBuffer(),
    };
    // Host-Header auf Upstream setzen
    (init.headers as Headers).set('Host', new URL(UPSTREAM).host);

    const upstreamRes = await fetch(target.toString(), init);

    // 4) CORS-Header der Antwort hinzufügen
    const resHeaders = new Headers(upstreamRes.headers);
    const extra = corsHeaders(req);
    Object.entries(extra).forEach(([k, v]) => resHeaders.set(k, v));

    // Keine Caches für Event-Endpunkte und Preflights
    if (req.method === 'OPTIONS' || url.pathname.startsWith('/e/') || url.pathname.startsWith('/capture/')) {
      resHeaders.set('Cache-Control', 'no-store');
    }

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: resHeaders,
    });
  },
}