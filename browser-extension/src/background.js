import 'webextension-polyfill';
import {MESSAGE_TYPES} from './app/commons/postMan';
import normalizeUrl from 'normalize-url';

chrome.browserAction.onClicked.addListener(activeTab => {
  const newURL = chrome.runtime.getURL(`/app/index.html?url=${activeTab.url}`);
  chrome.tabs.create({ url: newURL });
});

const currentUrls = {}

function onHeadersReceived(details) {
  console.log('currentUrls', currentUrls, details.url, details.responseHeaders && currentUrls[details.url], details.responseHeaders, currentUrls[details.url]);
  const normalizedUrl = normalizeUrl(details.url);
  if (details.responseHeaders && currentUrls[normalizedUrl]) {
      const newHeaders = removeHeader(details.responseHeaders, 'X-Frame-Options');
      console.log('newHeaders', newHeaders);
      return { responseHeaders: newHeaders };
  }
  return { responseHeaders: details.responseHeaders };
}

function removeHeader(headers, headerToRemove) {
  headerToRemove = headerToRemove.toLowerCase();
  return headers.filter(({ name }) => name.toLowerCase() != headerToRemove);
}

chrome.webRequest.onHeadersReceived.addListener(
  onHeadersReceived,
  {
    urls: ["<all_urls>"],
  },
  ['blocking', 'responseHeaders']
);

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    console.log('New Message', request);
    if (request.type === MESSAGE_TYPES.NEW_URL) {
      currentUrls[normalizeUrl(request.url)] = true;
      sendResponse({status: true});
    }
  }
);
