import { ipcRenderer } from 'electron';

export type Channels = 'ipc-example' | 'app-meta';

console.log('Preload main');

const documentBodyInit = () => {
  // Browser Sync
  console.log('Registering browserSync');
  const bsScript = window.document.createElement('script');
  bsScript.src =
    'https://localhost:12719/browser-sync/browser-sync-client.js?v=2.27.10';
  bsScript.async = true;
  window.document.body.appendChild(bsScript);

  // Context Menu
  console.log('Registering context menu');
  window.addEventListener('contextmenu', (e) => {
    console.log('context menu');
    e.preventDefault();
    ipcRenderer.send('show-context-menu');
  });
};

ipcRenderer.on('context-menu-command', (e, command) => {
  console.log('context-menu-command', e, command);
  ipcRenderer.sendToHost('context-menu-command', command);
});

const documentBodyWaitHandle = setInterval(() => {
  window.onerror = function (errorMsg, url, lineNumber) {
    console.log(`Unhandled error: ${errorMsg}`);
    // Code to run when an error has occurred on the page
  };

  if (window?.document?.body) {
    clearInterval(documentBodyWaitHandle);
    try {
      documentBodyInit();
    } catch (err) {
      console.log('Error in documentBodyInit:', err);
    }

    return;
  }
  console.log('document.body not ready');
}, 300);
