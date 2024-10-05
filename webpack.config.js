module.exports = {
    // ...
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          use: ['source-map-loader'],
          exclude: /node_modules/, // Исключаем папку node_modules
        },
      ],
    },
    // ...
  };
  