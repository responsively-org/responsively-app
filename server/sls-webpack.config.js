const slsw = require('serverless-webpack');
const webpack = require('webpack');

process.env.NODE_ENV = slsw.lib.options.stage || 'development';
const mode =
  process.env.NODE_ENV === 'development' ? 'development' : 'production';

module.exports = {
  entry: slsw.lib.entries,
  mode: mode,
  target: 'node',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/, /__test__/, /assets/, /coverage/],
        loader: 'babel-loader',
        query: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {node: '10.16'}, // Node version on AWS Lambda
                modules: false,
                loose: true,
              },
            ],
          ],
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
};
