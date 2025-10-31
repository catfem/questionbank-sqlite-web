export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API requests by proxying to the Worker
    if (url.pathname.startsWith('/api/')) {
      const workerUrl = `https://questionbank-api.your-subdomain.workers.dev${url.pathname}${url.search}`;
      
      const response = await fetch(workerUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      
      return response;
    }
    
    // Serve static files
    return env.ASSETS.fetch(request);
  },
};