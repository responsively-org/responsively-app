import {ipcRenderer} from 'electron';
import {IPC_MAIN_CHANNELS} from 'common/constants';

window.onerror = function logError(errorMsg, url, lineNumber) {
  console.log(`Unhandled error: ${errorMsg} ${url} ${lineNumber}`);
};

// Scroll/wheel mirroring can fire every frame on every preview — coalesce to
// one host message per animation frame. Wheel deltas are summed so the total
// mirrored scroll distance is preserved.
let wheelDelta: {x: number; y: number} | null = null;
let scrollPending = false;
let flushRequested = false;

const flushScrollData = () => {
  flushRequested = false;
  if (wheelDelta !== null) {
    ipcRenderer.sendToHost('pass-scroll-data', {
      coordinates: {
        x: wheelDelta.x,
        y: wheelDelta.y,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      },
      innerHeight: document.body.scrollHeight,
      innerWidth: window.innerWidth,
    });
  } else if (scrollPending) {
    ipcRenderer.sendToHost('pass-scroll-data', {
      coordinates: {
        x: 0,
        y: 0,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      },
      innerHeight: document.body.scrollHeight,
      innerWidth: window.innerWidth,
    });
  }
  wheelDelta = null;
  scrollPending = false;
};

const requestFlush = () => {
  if (!flushRequested) {
    flushRequested = true;
    window.requestAnimationFrame(flushScrollData);
  }
};

const documentBodyInit = () => {
  // Browser Sync
  const bsPort = ipcRenderer.sendSync(IPC_MAIN_CHANNELS.GET_BROWSER_SYNC_PORT);
  const bsScript = window.document.createElement('script');
  bsScript.src = `https://localhost:${bsPort}/browser-sync/browser-sync-client.js?v=2.27.10`;
  bsScript.async = true;
  window.document.body.appendChild(bsScript);

  // Context Menu
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    ipcRenderer.send('show-context-menu', {
      contextMenuMeta: {x: e.x, y: e.y},
    });
  });

  window.addEventListener('wheel', (e) => {
    wheelDelta = {
      x: (wheelDelta?.x ?? 0) + e.deltaX,
      y: (wheelDelta?.y ?? 0) + e.deltaY,
    };
    requestFlush();
  });

  window.addEventListener('scroll', () => {
    scrollPending = true;
    requestFlush();
  });

  // To detect if user is typing in an input field
  const isUserTyping = () => {
    const el = document.activeElement;
    if (!el) return false;

    return (
      el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable
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
          console.error('Error exiting fullscreen:', err);
        });
      } else {
        // Request fullscreen
        document.documentElement.requestFullscreen().catch((err) => {
          console.error('Error requesting fullscreen:', err);
        });
      }
    }
  });

  // Report the full page height to the host once the page (and its assets,
  // which affect layout) has loaded.
  window.addEventListener('load', () => {
    const {body} = document;
    const html = document.documentElement;

    const height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );

    ipcRenderer.sendToHost('pass-scroll-data', {
      coordinates: {x: 0, y: 0},
      innerHeight: height,
      innerWidth: window.innerWidth,
    });
  });
};

ipcRenderer.on('context-menu-command', (_, command) => {
  ipcRenderer.sendToHost('context-menu-command', command);
});

const init = () => {
  try {
    documentBodyInit();
  } catch (err) {
    console.log('Error in documentBodyInit:', err);
  }
};

// Preload scripts run before the document is parsed; body exists by
// DOMContentLoaded. (Replaces a 300ms polling loop.)
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
