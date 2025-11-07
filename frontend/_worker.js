export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Try to serve the asset first
    let response = await env.ASSETS.fetch(request);

    // If it's a 404 and not an API call or asset file, serve index.html for SPA routing
    if (response.status === 404 &&
        !url.pathname.startsWith('/api/') &&
        !url.pathname.includes('.')) {
      // Serve index.html for SPA routes
      const indexRequest = new Request(new URL('/', url.origin), request);
      response = await env.ASSETS.fetch(indexRequest);
    }

    return response;
  },
};
