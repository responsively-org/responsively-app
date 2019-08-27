var path = require('path');

var postcss = require('rollup-plugin-postcss');
var complieTools = require('rollup-plugin-babel');
var eslint = require('rollup-plugin-eslint');

var env = require('./env.js');

var config = {
	entry: path.join(__dirname, '../src/index.js'),
	plugins: [
		postcss({
			plugins: [],
			extensions: ['.css']
		}),
		eslint({
			exclude: [
				'src/*.css',
			]
		}),
		complieTools()
	]
};

if (env === 'dev') {
	module.exports = Object.assign({
		format: 'umd',
		moduleName: 'DomInspector',
		dest: path.join(__dirname, '../dist/dom-inspector.js')
	}, config);
} else {
	module.exports = config;
}
