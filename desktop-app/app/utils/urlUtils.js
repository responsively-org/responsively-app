export function getHostFromURL(url: String) {
  let host = '';
  if (url) {
    const urlObj = new URL(url);
    host = urlObj.host;
  }
  return host;
}
