const fs = require('fs');
const path = require('path');

const rollup = require('rollup');
const uglify = require('uglify-js');

const env = require('./env.js');

const {version} = require('../package.json');

const config = require('./config.js');

const banner =
  `${'/*\n' + ' * DomInspector v'}${version}\n` +
  ` * (c) ${new Date().getFullYear()} luoye <luoyefe@gmail.com>\n` +
  ' */';

function getSize(code) {
  return `${(code.length / 1024).toFixed(2)}kb`;
}

function blue(str) {
  return `\x1b[1m\x1b[34m${str}\x1b[39m\x1b[22m`;
}

function write(dest, code) {
  return new Promise((resolve, reject) => {
    fs.writeFile(dest, code, err => {
      if (err) return reject(err);
      console.log(`${blue(dest)} ${getSize(code)}`);
      resolve(code);
    });
  });
}

rollup
  .rollup(config)
  .then(
    bundle =>
      bundle.generate({
        banner,
        format: 'umd',
        moduleName: 'DomInspector',
      }).code
  )
  .then(code => write(path.join(__dirname, '../dist/dom-inspector.js'), code))
  .then(
    code =>
      uglify.minify(code, {
        fromString: true,
        output: {
          preamble: banner,
          ascii_only: true,
        },
        compress: {
          drop_console: true,
        },
      }).code
  )
  .then(code =>
    write(path.join(__dirname, '../dist/dom-inspector.min.js'), code)
  );
