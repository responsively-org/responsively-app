/**
 * Webpack config for the MCP bridge CLI. The bundle runs under plain Node
 * (the @responsively/mcp npx bootstrap requires it in-process), so the target
 * is 'node' — NOT electron-main. It is shipped in the packaged app's
 * resources/mcp/ directory via electron-builder extraResources.
 */

import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import checkNodeEnv from '../scripts/check-node-env';

checkNodeEnv('production');

const configuration: webpack.Configuration = {
  devtool: 'source-map',

  mode: 'production',

  target: 'node',

  entry: {
    cli: path.join(webpackPaths.srcPath, 'mcp-cli', 'index.ts'),
  },

  output: {
    path: path.join(webpackPaths.distPath, 'mcp'),
    filename: '[name].js',
    library: {
      type: 'commonjs2',
    },
  },

  optimization: {
    // Readable stack traces in bug reports; size is irrelevant in the installer.
    minimize: false,
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
  ],

  // Keep the real runtime __dirname so cli.js can find manifest.json beside itself.
  node: {
    __dirname: false,
    __filename: false,
  },
};

export default merge(baseConfig, configuration);
