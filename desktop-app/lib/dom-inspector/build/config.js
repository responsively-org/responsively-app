const path = require('path');

const postcss = require('rollup-plugin-postcss');
const complieTools = require('rollup-plugin-babel');
const eslint = require('rollup-plugin-eslint');

const env = require('./env.js');

const config = {
  entry: path.join(__dirname, '../src/index.js'),
  plugins: [
    postcss({
      plugins: [],
      extensions: ['.css'],
    }),
    eslint({
      exclude: ['src/*.css'],
    }),
    complieTools(),
  ],
};

if (env === 'dev') {
  module.exports = Object.assign(
    {
      format: 'umd',
      moduleName: 'DomInspector',
      dest: path.join(__dirname, '../dist/dom-inspector.js'),
    },
    config
  );
} else {
  module.exports = config;
}
