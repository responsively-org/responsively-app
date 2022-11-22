import fs from 'fs';

export function getHostFromURL(url: String) {
  let host = '';
  if (url) {
    const urlObj = new URL(url);
    host = urlObj.host;
  }
  return host;
}

export const normalize = (address: string) => {
  if (address !== 'about:blank' && address.indexOf('://') === -1) {
    let protocol = 'https://';
    if (
      address.startsWith('localhost') ||
      address.startsWith('127.0.0.1') ||
      _inferHostname(address).indexOf('.localhost') !== -1
    ) {
      protocol = 'http://';
    } else if (fs.existsSync(address)) {
      protocol = 'file://';
    }
    address = `${protocol}${address}`;
  }
  return address;
};

const _hostnameCharHints = [':', '/', '#', '?'];
const _inferHostname = (address: string) =>
  _hostnameCharHints.reduce((curr, char) => curr.split(char)[0], address);
