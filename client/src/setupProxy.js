module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://www.horoscope.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })
  );
};