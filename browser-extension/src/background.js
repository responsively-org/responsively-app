browser.browserAction.onClicked.addListener((tab) => {
  browser.tabs.executeScript({
    code: `
    var link = document.createElement("a");
    link.href = "responsively://" + window.location.href;
    link.click();
    `
  });
});
