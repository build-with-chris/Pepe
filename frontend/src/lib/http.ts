// Custom error classes for better error handling
export class HttpError extends Error {
  /** HTTP-Statuscode der Antwort, 0 bei Netzfehlern. */
  status: number;
  /** Fehlerschlüssel des Backends, z. B. "validation_error". */
  code?: string;
  /** Die Request-ID aus der Antwort — taucht so auch im Serverlog auf. */
  requestId?: string;

  constructor(message: string, status = 0, code?: string, requestId?: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

export class ValidationError extends HttpError {
  details: Record<string, any>;

  constructor(message: string, details: Record<string, any> = {}, status = 400,
              code?: string, requestId?: string) {
    super(message, status, code, requestId);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class AuthError extends HttpError {
  constructor(message: string, status = 401, code?: string, requestId?: string) {
    super(message, status, code, requestId);
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string, status = 403, code?: string, requestId?: string) {
    super(message, status, code, requestId);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends HttpError {
  constructor(message: string, status = 409, code?: string, requestId?: string) {
    super(message, status, code, requestId);
    this.name = 'ConflictError';
  }
}

export class NetworkError extends HttpError {
  constructor(message: string) {
    super(message, 0);
    this.name = 'NetworkError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, status = 404, code?: string, requestId?: string) {
    super(message, status, code, requestId);
    this.name = 'NotFoundError';
  }
}

/** Antwort des Backends: { error, message, code, request_id, details? }. */
interface ApiErrorBody {
  error?: string;
  message?: string;
  request_id?: string;
  details?: Record<string, unknown>;
}

/**
 * Liest den Fehlerkörper aus, ohne bei Nicht-JSON oder leerem Body zu werfen.
 *
 * Der Grund: Bisher wurde jeder Serverfehler auf einen festen Satz wie
 * "Validation failed" eingedampft. Die eigentliche Meldung — inklusive der
 * `request_id`, mit der man die Zeile im Serverlog findet — ging verloren.
 */
async function readErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text) as ApiErrorBody;
    } catch {
      return { message: text.slice(0, 500) };
    }
  } catch {
    return {};
  }
}

function fallbackMessage(status: number): string {
  switch (status) {
    case 400: return 'Die Angaben wurden vom Server abgelehnt.';
    case 401: return 'Nicht angemeldet oder Sitzung abgelaufen.';
    case 403: return 'Keine Berechtigung für diese Aktion.';
    case 404: return 'Nicht gefunden.';
    case 409: return 'Der Eintrag steht im Konflikt mit einem bestehenden.';
    default: return `Serverfehler (HTTP ${status}).`;
  }
}

// Fetch with retry logic and error handling
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 3
): Promise<Response> {
  let lastError: unknown;

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const body = await readErrorBody(response);
        const message = body.message || fallbackMessage(response.status);
        const code = body.error;
        const reqId = body.request_id;

        // Fachliche Fehler: Der Server hat entschieden, ein zweiter Versuch
        // ändert daran nichts.
        switch (response.status) {
          case 400:
          case 422:
            throw new ValidationError(message, body.details || body,
                                      response.status, code, reqId);
          case 401:
            throw new AuthError(message, response.status, code, reqId);
          case 403:
            throw new ForbiddenError(message, response.status, code, reqId);
          case 404:
            throw new NotFoundError(message, response.status, code, reqId);
          case 409:
            throw new ConflictError(message, response.status, code, reqId);
        }

        // Alles andere (5xx, 429) gilt als vorübergehend und wird wiederholt.
        throw new HttpError(message, response.status, code, reqId);
      }

      return response;
    } catch (error) {
      lastError = error;

      // Don't retry for non-network errors
      if (error instanceof ValidationError ||
          error instanceof AuthError ||
          error instanceof ForbiddenError ||
          error instanceof ConflictError ||
          error instanceof NotFoundError) {
        throw error;
      }

      // If this is the last retry, throw the error
      if (i === retries) {
        // `fetch` wirft bei Netzproblemen einen TypeError ohne verwertbaren
        // Text. Alles andere behält seine Meldung.
        if (error instanceof TypeError) {
          throw new NetworkError(
            'Verbindung zum Server nicht möglich. Bitte Internetverbindung prüfen.'
          );
        }
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw lastError;
}