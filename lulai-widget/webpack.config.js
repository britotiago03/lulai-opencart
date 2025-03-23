
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/widget.js',
  output: {
    filename: 'lulai-widget.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'LulAIWidget',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
