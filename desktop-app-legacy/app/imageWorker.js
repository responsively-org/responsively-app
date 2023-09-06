const registerPromiseWorker = require('promise-worker/register');
const mergeImg = require('merge-img');
const {promisify} = require('util');
const Jimp = require('jimp');
const os = require('os');
const path = require('path');
const uuid = require('uuid');
const fs = require('fs-extra');

const UUID = uuid.v4;
const tempDir = path.join(os.tmpdir(), UUID());

registerPromiseWorker(({images, direction, resultFilename}) => {
  if (direction === 'horizontal') {
    return stitchHorizontally(images);
  }
  return stitchVertically(images, resultFilename);
});

async function stitchHorizontally(images) {
  const result = await mergeImg(
    images.map(img => ({src: Buffer.from(img)})),
    {
      direction: false,
    }
  );
  const tempPath = await writeToTempFile(result);
  return tempPath;
}

async function writeToTempFile(image) {
  return new Promise(async (resolve, reject) => {
    await fs.ensureDir(tempDir);
    const tempPath = path.join(tempDir, `${UUID()}.jpg`);
    await image.write(tempPath, err => {
      if (err) {
        return reject(err);
      }
      return resolve(tempPath);
    });
  });
}

async function stitchVertically(images, {dir, file}) {
  const result = await mergeImg(
    await Promise.all(
      images.map(async img => {
        const JimpImg = await Jimp.read(img);
        return {
          src: await JimpImg.getBufferAsync('image/jpeg'),
        };
      })
    ),
    {
      direction: true,
    }
  );
  await fs.ensureDir(dir);
  await Promise.all([
    result.write(path.join(dir, file)),
    ...images.map(image => fs.remove(image)),
  ]);
}
