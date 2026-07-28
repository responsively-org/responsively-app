import {RefObject, useEffect, useState} from 'react';

/**
 * Tracks the guest lifecycle of one <webview>: readiness (first dom-ready)
 * and per-load chrome tweaks that must re-run on every page.
 */
const useWebviewLifecycle = (
  ref: RefObject<Electron.WebviewTag | null>,
  {isMobileCapable}: {isMobileCapable: boolean}
) => {
  const [webviewReady, setWebviewReady] = useState<boolean>(false);

  useEffect(() => {
    const webview = ref.current;
    if (!webview) return undefined;
    const onDomReady = () => setWebviewReady(true);
    webview.addEventListener('dom-ready', onDomReady);
    return () => {
      webview.removeEventListener('dom-ready', onDomReady);
      setWebviewReady(false);
    };
  }, [ref]);

  useEffect(() => {
    const webview = ref.current;
    if (!webview || !isMobileCapable) {
      return undefined;
    }
    const hideScrollbars = () => {
      webview.insertCSS(`
               ::-webkit-scrollbar {
              display: none;
              } `);
    };
    webview.addEventListener('dom-ready', hideScrollbars);
    return () => {
      webview.removeEventListener('dom-ready', hideScrollbars);
    };
  }, [ref, isMobileCapable]);

  return {webviewReady};
};

export default useWebviewLifecycle;
