export function getHostFromURL(url: String) {
  let host = '';
  if (url) {
    const urlObj = new URL(url);
    host = urlObj.host;
  }
  return host;
}

export function getWebSiteName(address: string): string {
  let domain = '';
  if (address.startsWith('file://')) {
    const fileNameStartingIndex = address.lastIndexOf('/') + 1;
    let htmIndex = address.indexOf('.htm');
    if (htmIndex === -1) {
      htmIndex = address.length;
    }
    domain = address.substring(fileNameStartingIndex, htmIndex);
  } else {
    domain = new URL(address).hostname;
    domain = domain.replace('www.', '');
    const dotIndex = domain.indexOf('.');
    if (dotIndex > -1) {
      domain = domain.substr(0, domain.indexOf('.'));
    }
  }
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}
