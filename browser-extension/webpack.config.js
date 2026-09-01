const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  stats: 'errors-only',
  entry: {
    popup: './src/popup',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
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
          },
        },
      },
      {
        test: /\.(svg|gif|png|jpg)$/,
        type: 'asset/inline',
      }
    ],
  },
  plugins: [
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
  ],
  optimization: {
    // Keep the bundle readable for extension store reviews
    minimize: false,
  },
};
