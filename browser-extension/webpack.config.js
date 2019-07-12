const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebExtWebpackPlugin = require('web-ext-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    background: ['./src/background.js'],
  },
  output: {
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: '[name]_[local]_[hash:base64]',
              sourceMap: true,
              minimize: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin(
      [
        {from: 'public', to: './'},
      ],
      {debug: true, context: '.'}
    ),
    new WebExtWebpackPlugin({ sourceDir: path.resolve('./dist') })
  ],
};
