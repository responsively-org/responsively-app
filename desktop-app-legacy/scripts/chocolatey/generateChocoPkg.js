const {version} = require('../../package.json');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const replaceInFiles = require('replace-in-file');
const {spawn} = require('child_process');
const {ncp} = require('ncp');
const https = require('https');

ncp.limit = 16;

const checksumFileName = `ResponsivelyApp-Setup-${version}.exe`;
const releasePath = path.resolve(__dirname, '../../release');
const filesToReplace = [
  path.resolve(releasePath, 'choco/tools/chocolateyinstall.ps1'),
  path.resolve(releasePath, 'choco/tools/VERIFICATION.txt'),
  path.resolve(releasePath, 'choco/responsively.nuspec'),
];

const getSha512 = () =>
  new Promise((resolve, reject) => {
    const installerPath = path.resolve(releasePath, checksumFileName);
    console.log(`\nGetting checksum of '${installerPath}'`);
    if (fs.existsSync(installerPath)) {
      const hash = crypto.createHash('sha512');
      hash.on('error', reject);
      fs.createReadStream(installerPath, {highWaterMark: 1024 * 1024})
        .on('error', reject)
        .on('end', () => {
          hash.end();
          const sha = Buffer.from(hash.read())
            .toString('hex')
            .toUpperCase();
          console.log('Success: ', sha);
          resolve(sha);
        })
        .pipe(hash, {
          end: false,
        });
    } else {
      reject(new Error(`Expected installer file '${installerPath}' not found`));
    }
  });

const replaceTokensInTemplates = async checksum => {
  console.log('\nReplacing release info in template files');
  const options = {
    files: filesToReplace,
    from: [/#VERSION#/g, /#CHECKSUM#/g],
    to: [version, checksum],
  };
  const results = await replaceInFiles(options);
  console.log('Replacing result: ', results);
};

const execChocoPack = () =>
  new Promise((resolve, reject) => {
    console.log('\nExecuting choco pack');
    const destination = path.resolve(releasePath, 'choco');
    const chocoPkgCmd = spawn('choco', ['pack'], {cwd: destination});
    chocoPkgCmd.stdout.on('data', data => {
      console.log(`stdout: ${data}`);
    });

    chocoPkgCmd.stderr.on('data', data => {
      console.log(`stderr: ${data}`);
    });

    chocoPkgCmd.on('error', error => {
      console.log(`error: ${error.message}`);
    });

    chocoPkgCmd.on('close', code => {
      if (code === 0) resolve();
      else reject();
    });
  });

const ensureInstallerFile = async () => {
  console.log('\nEnsure installer file');
  return new Promise((resolve, reject) => {
    const installerPath = path.resolve(releasePath, checksumFileName);
    if (fs.existsSync(installerPath)) {
      console.log('Removing existing installer file');
      fs.rmdirSync(installerPath, {recursive: true});
    }

    const url = `https://github.com/responsively-org/responsively-app/releases/download/v${version}/ResponsivelyApp-Setup-${version}.exe`;
    console.log(`Downloading '${checksumFileName}' file from github`);
    const file = fs.createWriteStream(installerPath);
    https
      .get(url, response => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            console.log('Download finished');
            resolve();
          });
        });
      })
      .on('error', err => {
        fs.unlink(dest);
        console.log('Download error!');
        reject(err.message);
      });
  });
};

const generateChocoPkg = async () => {
  console.log(
    `\nGenerating Chocolatey package folder for responsively v${version}`
  );
  const source = path.resolve(__dirname, 'responsively');
  const destination = path.resolve(releasePath, 'choco');

  if (!fs.existsSync(source)) {
    return console.error('Template not found');
  }

  if (fs.existsSync(destination)) {
    console.log('Cleaning old version output');
    fs.rmdirSync(destination, {recursive: true});
  }

  ncp(source, destination, async err => {
    console.log('Moving choco package folder to release path');
    if (err) {
      return console.error(err);
    }
    console.log('done!');
    try {
      await ensureInstallerFile();
      const checksum = await getSha512();
      await replaceTokensInTemplates(checksum);
      await execChocoPack();
    } catch (e) {
      console.error('Something went wrong', e);
    }
  });
};

generateChocoPkg();
