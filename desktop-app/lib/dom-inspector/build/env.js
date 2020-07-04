const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

module.exports = argv.env || 'production';
