var fs = require('fs');
var path = require('path');

var rollup = require('rollup');
var uglify = require('uglify-js');

var env = require('./env.js');

var version = require('../package.json').version;

var config = require('./config.js');

var banner = '/*\n' +
	' * DomInspector v' + version + '\n' +
	' * (c) ' + new Date().getFullYear() + ' luoye <luoyefe@gmail.com>\n' +
	' */';

function getSize(code) {
	return (code.length / 1024).toFixed(2) + 'kb';
};

function blue(str) {
	return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m';
};

function write(dest, code) {
	return new Promise(function(resolve, reject) {
		fs.writeFile(dest, code, function(err) {
			if (err) return reject(err);
			console.log(blue(dest) + ' ' + getSize(code));
			resolve(code);
		});
	});
};

rollup.rollup(config).then(function(bundle) {
	return bundle.generate({
		banner: banner,
		format: 'umd',
		moduleName: 'DomInspector'
	}).code;
}).then(function(code) {
	return write(path.join(__dirname, '../dist/dom-inspector.js'), code);
}).then(function(code) {
	return uglify.minify(code, {
		fromString: true,
		output: {
			preamble: banner,
			ascii_only: true
		},
		compress: {
			drop_console: true
		}
	}).code;
}).then(function(code) {
	return write(path.join(__dirname, '../dist/dom-inspector.min.js'), code);
});
