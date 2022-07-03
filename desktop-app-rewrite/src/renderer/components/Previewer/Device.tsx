import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/store';
import { setAddress } from 'renderer/store/features/renderer';

interface Props {
  width: number;
  height: number;
}
const Device = ({ height, width }: Props) => {
  const address = useSelector((state: RootState) => state.renderer?.address);
  const dispatch = useDispatch();
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
      // e.preventDefault();
    });
    webview.addEventListener('did-navigate', (e) => {
      console.log('did-navigate', e.url);
      dispatch(setAddress(e.url));
    });
    console.log('Added listerner');
  }, [ref, dispatch]);

  console.log('address', address);

  return (
    <div>
      <webview
        src={address}
        style={{ height, width, display: 'inline-flex' }}
        ref={ref}
        preload={`file://${window.responsively.webviewPreloadPath}`}
      />
    </div>
  );
};

export default Device;
