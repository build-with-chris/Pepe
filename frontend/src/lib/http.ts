export class AppError extends Error { code?: number; details?: any; }
export class ValidationError extends AppError { constructor(msg: string, details: any){ super(msg); this.code=422; this.details=details; } }
export class AuthError extends AppError {}
export class ForbiddenError extends AppError {}
export class NotFoundError extends AppError {}
export class ConflictError extends AppError {}
export class NetworkError extends AppError {}

export async function fetchWithRetry(url: string, options: RequestInit = {}, { timeoutMs=15000, retries=1 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (res.ok) return res;

    let body: any = null;
    try { body = await res.json(); } catch { body = { message: await res.text().catch(()=>"") }; }

    const msg = body?.message || `HTTP ${res.status}`;
    switch (res.status) {
      case 401: throw new AuthError(msg);
      case 403: throw new ForbiddenError(msg);
      case 404: throw new NotFoundError(msg);
      case 409: throw new ConflictError(msg);
      case 422: throw new ValidationError(msg, body?.details || {});
      default:  { const err = new AppError(msg); err.code = res.status; err.details = body?.details; throw err; }
    }
  } catch (e: any) {
    if (e?.name === "AbortError") throw new NetworkError("Zeitüberschreitung – Server antwortet nicht.");
    if (retries > 0) { await new Promise(r => setTimeout(r, 500)); return fetchWithRetry(url, options, { timeoutMs, retries: retries-1 }); }
    if (!navigator.onLine) throw new NetworkError("Offline – bitte Internetverbindung prüfen.");
    if (e instanceof AppError) throw e;
    throw new NetworkError("Netzwerkfehler – Verbindung fehlgeschlagen.");
  } finally {
    clearTimeout(timer);
  }
}