export const setBrowserZoom = async zoom => {
  console.log('setBrowserZoom', zoom);
  if (!window.chrome || !window.chrome.tabs) {
    return;
  }
  const tab = (await window.chrome.tabs.query({currentWindow: true, active : true}))[0];
  await window.chrome.tabs.setZoom(tab.id, zoom);
}