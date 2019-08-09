import 'webextension-polyfill';
import {MESSAGE_TYPES} from '../app/commons/postMan';
import normalizeUrl from 'normalize-url';
import {processCSPHeader} from './utils';

chrome.browserAction.onClicked.addListener(activeTab => {
  const newURL = chrome.runtime.getURL(`/app/index.html?url=${activeTab.url}`);
  chrome.tabs.create({ url: newURL });
});

const currentUrls = {}

function onHeadersReceived(details) {
  console.log('currentUrls', currentUrls, details.url, details.responseHeaders && currentUrls[details.url], details.responseHeaders, currentUrls[details.url]);
  const normalizedUrl = normalizeUrl(details.url);
  if (details.responseHeaders && currentUrls[normalizedUrl]) {
      const extensionURL = chrome.runtime.getURL('/');
      const CSPHeader = getHeader(details.responseHeaders, 'Content-Security-Policy');
      const newCSPHeaderValue = processCSPHeader(CSPHeader, extensionURL);
      let newHeaders = removeHeader(details.responseHeaders, 'Content-Security-Policy');
      newHeaders = addHeader(newHeaders, 'Content-Security-Policy', newCSPHeaderValue);
      newHeaders = removeHeader(newHeaders, 'X-Frame-Options');
      /*console.log('After X-frameOptions removal', newHeaders)
      newHeaders = addHeader(newHeaders, 'x-frame-options', `allow-from ${extensionURL}`)
      */
      console.log('newHeaders', newHeaders);
      return { responseHeaders: newHeaders };
  }
  return { responseHeaders: details.responseHeaders };
}

function removeHeader(headers, headerToRemove) {
  headerToRemove = headerToRemove.toLowerCase();
  return headers.filter(({ name }) => name.toLowerCase() != headerToRemove);
}

function addHeader(headers, name, value) {
  headers.push({name, value});
  return headers;
}

function getHeader(headers, headerToFind) {
  headerToFind = headerToFind.toLowerCase();
  return headers.filter(({name}) => name.toLowerCase() === headerToFind)[0];
}

chrome.webRequest.onHeadersReceived.addListener(
  onHeadersReceived,
  {
    urls: ["<all_urls>"],
    types: ["main_frame", "sub_frame"]
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
