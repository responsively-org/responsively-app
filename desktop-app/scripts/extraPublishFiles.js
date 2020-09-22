const {generateChecksums} = require('./generate-checksums');
const {version, build, productName} = require('../package.json');
const path = require('path');
const fs = require('fs');

const RELATIVE_FOLDER_PATH = '../release';

const getZipFile = () => {
  const product = (build || {}).productName || productName;
  const zipName = `${product}-${version}.zip`;
  const zipPath = path.resolve(__dirname, RELATIVE_FOLDER_PATH, zipName);

  if (fs.existsSync(zipPath)) {
    console.log(`\nIncluded '${zipName}' in publish files`);
    return zipPath;
  }
  throw new Error(`Expected zip file '${zipPath}' not found`);
};

const getExtraPublishFiles = () =>
  generateChecksums().then(files => {
    const zipFile = getZipFile();
    const all = [zipFile, ...files];
    console.log(`\nExtra Files Included:\n${all.join('\n')}`);
    return all;
  });

exports.default = getExtraPublishFiles;
