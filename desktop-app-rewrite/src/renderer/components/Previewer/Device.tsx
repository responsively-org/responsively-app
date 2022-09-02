import { handleContextMenuEvent } from 'main/webview-context-menu/handler';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { webViewPubSub } from 'renderer/lib/pubsub';
import { RootState } from 'renderer/store';
import { setAddress } from 'renderer/store/features/renderer';
import { NAVIGATION_EVENTS } from '../AddressBar/NavigationControls';

interface Props {
  width: number;
  height: number;
  isPrimary: boolean;
}
const Device = ({ height, width, isPrimary }: Props) => {
  const address = useSelector((state: RootState) => state.renderer?.address);
  const dispatch = useDispatch();
  const ref = useRef<Electron.WebviewTag>(null);

  const registerNavigationHandlers = useCallback(() => {
    webViewPubSub.subscribe(NAVIGATION_EVENTS.RELOAD, () => {
      if (ref.current) {
        ref.current.reload();
      }
    });
    if (isPrimary) {
      webViewPubSub.subscribe(NAVIGATION_EVENTS.BACK, () => {
        if (ref.current) {
          ref.current.goBack();
        }
      });

      webViewPubSub.subscribe(NAVIGATION_EVENTS.FORWARD, () => {
        if (ref.current) {
          ref.current.goForward();
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const webview = ref.current as Electron.WebviewTag;
    webview.addEventListener('dom-ready', () => {
      //webview.openDevTools();
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

    registerNavigationHandlers();
  }, [ref, dispatch, registerNavigationHandlers]);

  const scaleFactor = 0.75;

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
        data-scale-factor={scaleFactor}
      />
    </div>
  );
};

export default Device;
