import { handleContextMenuEvent } from 'main/webview-context-menu/handler';
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
    if (!ref.current) {
      return;
    }
    const webview = ref.current as Electron.WebviewTag;
    webview.addEventListener('dom-ready', () => {
      webview.openDevTools();
    });
    webview.addEventListener('did-navigate', (e) => {
      dispatch(setAddress(e.url));
    });

    webview.addEventListener('ipc-message', (e) => {
      if (e.channel === 'context-menu-command') {
        const { command, arg } = e.args[0];
        handleContextMenuEvent(webview, command, arg);
      }
    });
  }, [ref, dispatch]);

  const scaleFactor = 0.5;

  const scaledHeight = height * scaleFactor;
  const scaledWidth = width * scaleFactor;

  return (
    <div
      style={{ height: scaledHeight, width: scaledWidth }}
      className="origin-top-left"
    >
      <webview
        src={address}
        style={{
          height,
          width,
          display: 'inline-flex',
          transform: `scale(${scaleFactor})`,
        }}
        ref={ref}
        className="origin-top-left"
        preload={`file://${window.responsively.webviewPreloadPath}`}
      />
    </div>
  );
};

export default Device;
