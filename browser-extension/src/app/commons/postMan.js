export const MESSAGE_TYPES = {
  NEW_URL: 'NEW_URL',
};

export async function setURL(url) {
  return chrome.runtime.sendMessage({type: MESSAGE_TYPES.NEW_URL, url});
}