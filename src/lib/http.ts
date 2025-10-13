// Custom error classes for better error handling
export class ValidationError extends Error {
  details: Record<string, any>;
  
  constructor(message: string, details: Record<string, any> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Fetch with retry logic and error handling
export async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  retries: number = 3
): Promise<Response> {
  let lastError: Error;

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      
      // Handle different HTTP status codes
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        throw new ValidationError('Validation failed', errorData);
      }
      
      if (response.status === 401) {
        throw new AuthError('Authentication failed');
      }
      
      if (response.status === 403) {
        throw new ForbiddenError('Access forbidden');
      }
      
      if (response.status === 404) {
        throw new NotFoundError('Resource not found');
      }
      
      if (response.status === 409) {
        throw new ConflictError('Resource conflict');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      
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
        if (error instanceof TypeError || error.message.includes('fetch')) {
          throw new NetworkError('Network request failed');
        }
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  
  throw lastError!;
}