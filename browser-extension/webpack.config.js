const webpack = require('webpack');
const path = require('path');
const SizePlugin = require('size-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebExtWebpackPlugin = require('@ianwalter/web-ext-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  stats: 'errors-only',
  entry: {
    background: './src/background',
    popup: './src/popup',
    // Add HMR client
    main: [
      'webpack-hot-middleware/client?reload=true', // Use 'reload=true' for CSS
      './src/index.js', // Adjust to your main file
    ],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/', // Required for HMR
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, "src")
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ["@babel/preset-env", { modules: false }],
              "@babel/preset-react"
            ],
            plugins: [
              "@babel/plugin-transform-react-constant-elements",
              "@babel/plugin-proposal-object-rest-spread",
              "@babel/plugin-proposal-class-properties",
              "@babel/plugin-transform-runtime",
              'react-refresh/babel', // Add React Refresh for HMR
            ],
          },
        },
      },
      {
        test: /\.(svg|gif|png|jpg)$/,
        use: 'url-loader',
      }
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // Enable HMR
    new SizePlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/*',
          context: 'public',
        },
        {
          from: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
        }
      ],
    }),
    new WebExtWebpackPlugin({ sourceDir: path.join(__dirname, 'dist'), verbose: true }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,
          compress: false,
          output: {
            beautify: true,
            indent_level: 2
          }
        }
      })
    ]
  }
};
