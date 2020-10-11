const {generateChecksums} = require('./generate-checksums');
const {version, build, productName} = require('../package.json');
const path = require('path');
const fs = require('fs');

const getExtraPublishFiles = () =>
  generateChecksums().then(files => {
    console.log(`\nExtra Files Included:\n${files.join('\n')}`);
    return files;
  });

exports.default = getExtraPublishFiles;
