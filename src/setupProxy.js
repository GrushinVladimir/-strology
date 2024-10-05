const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://www.horoscope.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Удаляет префикс /api из URL
      },
    })
  );
};
