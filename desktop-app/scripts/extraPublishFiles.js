const {generateChecksums} = require('./generate-checksums');

exports.default = function() {
  return generateChecksums()
    .then(files => {
      // add *.zip file
      return files;
    })
    .catch(e => {
      console.log('Something went wrong generating checksum files');
      return [];
    });
};
