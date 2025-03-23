// widget/webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/widget.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lulai-widget.js',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};