require("webextension-polyfill");

chrome.browserAction.onClicked.addListener(activeTab => {
    const newURL = chrome.runtime.getURL(`/app/index.html?url=${activeTab.url}`);
    chrome.tabs.create({ url: newURL });
});