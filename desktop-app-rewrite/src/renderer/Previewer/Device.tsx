import { useEffect, useRef } from 'react';

interface Props {
  url: string;
  width: number;
  height: number;
}
const Device = ({ url, height, width }: Props) => {
  const ref = useRef<Electron.WebviewTag>(null);

  useEffect(() => {
    console.log('In useEffect', window.electron);
    if (!ref.current) {
      console.log('Webview is null');
      return;
    }
    const webview = ref.current as Electron.WebviewTag;
    webview.addEventListener('dom-ready', function () {
      console.log('dom-ready');
      webview.openDevTools();
    });
    webview.addEventListener('certificate-error', function (e) {
      console.log('certificate-error', e);
      //e.preventDefault();
    });
    console.log('Added listerner');
  }, [ref]);

  return (
    <div>
      <webview
        src={url}
        style={{ height, width, display: 'inline-flex' }}
        ref={ref}
        preload={`file://${window.responsively.webviewPreloadPath}`}
      />
    </div>
  );
};

export default Device;
