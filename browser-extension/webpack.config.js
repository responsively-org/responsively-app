const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebExtWebpackPlugin = require('web-ext-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    background: ['./src/background.js'],
    app: ['./src/app/index.js']
  },
  output: {
    filename: (chunkData) => {
      return chunkData.chunk.name === 'background' ? '[name].js': 'app/[name].js';
    },
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
              modules: {
                mode: 'local',
                localIdentName: '[path][name]__[local]--[hash:base64:5]',
              },
             /* importLoaders: 1,
              sourceMap: true,
              minimize: true,
              */
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
