const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function hashFile(file, algorithm = 'sha512', encoding = 'hex', options = {}) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    hash.on('error', reject).setEncoding(encoding);
    fs.createReadStream(
      file,
      Object.assign({}, options, {
        highWaterMark: 1024 * 1024,
        /* better to use more memory but hash faster */
      })
    )
      .on('error', reject)
      .on('end', () => {
        hash.end();
        resolve(hash.read());
      })
      .pipe(hash, {
        end: false,
      });
  });
}

const RELATIVE_FOLDER_PATH = '../release';
const CHECKSUM_SUFFIX = '.checksum.sha512';
const SKIP_SUFFIX_LIST = [CHECKSUM_SUFFIX, '.yml', '.yaml', '.txt'];

const generateChecksums = async () => {
  const result = [];
  const installerPath = path.resolve(__dirname, RELATIVE_FOLDER_PATH);
  const files = await fs.promises.readdir(installerPath);
  console.log("\nGenerating checksum files for files in: '%s'", installerPath);

  for (const file of files) {
    if (SKIP_SUFFIX_LIST.some(s => file.endsWith(s))) continue;

    const filePath = path.join(installerPath, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isFile()) {
      const checksumFile = `${file}${CHECKSUM_SUFFIX}`;
      const checksumFilePath = path.join(installerPath, checksumFile);
      const checksum = await hashFile(filePath);
      await fs.promises.writeFile(checksumFilePath, checksum);
      console.log("'%s' -> '%s'", checksum, checksumFile);
      result.push(checksumFilePath);
    }
  }
  return result;
};

module.exports = {generateChecksums};
