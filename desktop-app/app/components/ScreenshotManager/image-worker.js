// @flow
const registerPromiseWorker = require('promise-worker/register');

registerPromiseWorker(async ({mergedImg}) => {
  const regex = /^data:.+\/(.+);base64,(.*)$/;
  const matches = mergedImg.match(regex);
  const ext = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');
  return [buffer, ext];
});
