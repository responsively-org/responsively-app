console.log('Preload webview');

const documentBodyInit = () => {
  console.log('Registering browserSync');
  const bsScript = window.document.createElement('script');
  bsScript.src =
    'https://localhost:12719/browser-sync/browser-sync-client.js?v=2.27.10';
  bsScript.async = true;
  window.document.body.appendChild(bsScript);
};

let documentBodyWaitHandle = setInterval(() => {
  if (window?.document?.body) {
    clearInterval(documentBodyWaitHandle);
    documentBodyInit();
    return;
  }
  console.log('docuemnt.body not ready');
}, 1000);
