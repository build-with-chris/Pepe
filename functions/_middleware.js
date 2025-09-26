export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // For API routes or assets, serve normally
  if (pathname.startsWith('/api/') ||
      pathname.startsWith('/assets/') ||
      pathname.startsWith('/images/') ||
      pathname.startsWith('/videos/') ||
      pathname.includes('.')) {
    return env.ASSETS.fetch(request);
  }

  // For all other routes (SPA routes), serve index.html
  const modifiedRequest = new Request(request.url.replace(pathname, '/'), {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  return env.ASSETS.fetch(modifiedRequest);
}