const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // Используйте /api для всех запросов, которые должны быть проксированы
    createProxyMiddleware({
      target: 'https://www.horoscope.com', // Указываем целевой сайт
      changeOrigin: true, // Изменяет origin на целевой сайт
      pathRewrite: {
        '^/api': '', // Убираем /api из пути перед отправкой на целевой сайт
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', // Указываем заголовок User-Agent для предотвращения блокировки
      },
      onProxyRes: (proxyRes, req, res) => {
        // Опционально, если вам нужно изменять ответ перед отправкой
        // proxyRes.headers['some-header'] = 'value';
      },
    })
  );
};
