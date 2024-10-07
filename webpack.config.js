module.exports = {
  // ... другие настройки
  module: {
    rules: [
      // ... другие правила
      {
        test: /\.js$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: ['source-map-loader'],
      },
    ],
  },
  // Если у вас включен devtool:
  devtool: 'source-map',  // Используйте, если нужно отладочное отображение кода
};
