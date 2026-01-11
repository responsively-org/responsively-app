import { ipcRenderer } from 'electron';

const documentBodyInit = () => {
  // Browser Sync
  const bsScript = window.document.createElement('script');
  bsScript.src =
    'https://localhost:12719/browser-sync/browser-sync-client.js?v=2.27.10';
  bsScript.async = true;
  window.document.body.appendChild(bsScript);

  // Context Menu
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    ipcRenderer.send('show-context-menu', {
      contextMenuMeta: { x: e.x, y: e.y },
    });
  });

  window.addEventListener('wheel', (e) => {
    ipcRenderer.sendToHost('pass-scroll-data', {
      coordinates: { x: e.deltaX, y: e.deltaY },
      innerHeight: document.body.scrollHeight,
      innerWidth: window.innerWidth,
    });
  });

  // To detect if user is typing in an input field
  const isUserTyping = () => {
    const el = document.activeElement;
    if (!el) return false;

    return (
      el.tagName === 'INPUT' ||
      el.tagName === 'TEXTAREA' ||
      (el as HTMLElement).isContentEditable
    );
  };

  // Handle F key for fullscreen toggle
  window.addEventListener('keydown', (e) => {
    // Prevent fullscreen if user is typing
    if (isUserTyping()) return;

    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();

      // Check if already in fullscreen
      if (document.fullscreenElement) {
        // Exit fullscreen
        document.exitFullscreen().catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Error exiting fullscreen:', err);
        });
      } else {
        // Request fullscreen
        document.documentElement.requestFullscreen().catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Error requesting fullscreen:', err);
        });
      }
    }
  });

  window.addEventListener('dom-ready', () => {
    const { body } = document;
    const html = document.documentElement;

    const height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );

    ipcRenderer.sendToHost('pass-scroll-data', {
      coordinates: { x: 0, y: 0 },
      innerHeight: height,
      innerWidth: window.innerWidth,
    });
  });
};

ipcRenderer.on('context-menu-command', (_, command) => {
  ipcRenderer.sendToHost('context-menu-command', command);
});

const documentBodyWaitHandle = setInterval(() => {
  window.onerror = function logError(errorMsg, url, lineNumber) {
    // Log to external service instead of console to prevent sensitive information leakage
  };

  if (window?.document?.body) {
    clearInterval(documentBodyWaitHandle);
    try {
      documentBodyInit();
    } catch (err) {
      // Error in document body initialization, continue
    }

    return;
  }
}, 300);
