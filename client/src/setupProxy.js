const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // SSE endpoint — disable buffering so events stream in real-time
  app.use(
    '/api/logs',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      selfHandleResponse: false,
      on: {
        proxyReq: (proxyReq) => {
          proxyReq.setHeader('Accept', 'text/event-stream');
        },
        proxyRes: (proxyRes) => {
          proxyRes.headers['cache-control'] = 'no-cache';
          proxyRes.headers['x-accel-buffering'] = 'no';
        },
      },
    })
  );

  // All other API routes
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
    })
  );
};
