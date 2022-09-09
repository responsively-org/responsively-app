import { Icon } from '@iconify/react';
import { handleContextMenuEvent } from 'main/webview-context-menu/handler';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { webViewPubSub } from 'renderer/lib/pubsub';
import { RootState } from 'renderer/store';
import { setAddress } from 'renderer/store/features/renderer';
import { NAVIGATION_EVENTS } from '../AddressBar/NavigationControls';

interface Props {
  width: number;
  height: number;
  isPrimary: boolean;
  name: string;
}

const Device = ({ height, width, isPrimary, name }: Props) => {
  const address = useSelector((state: RootState) => state.renderer?.address);
  const [loading, setLoading] = useState<boolean>(false);
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
  }, [isPrimary]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const webview = ref.current as Electron.WebviewTag;
    webview.addEventListener('dom-ready', () => {
      // webview.openDevTools();
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

    webview.addEventListener('did-start-loading', () => {
      setLoading(true);
    });
    webview.addEventListener('did-stop-loading', () => {
      setLoading(false);
    });

    webview.addEventListener('crashed', () => {
      console.log('crashed');
    });

    registerNavigationHandlers();
  }, [ref, dispatch, registerNavigationHandlers]);

  const scaleFactor = 0.75;

  const scaledHeight = height * scaleFactor;
  const scaledWidth = width * scaleFactor;

  return (
    <div>
      <div className="flex justify-between">
        <span>
          {name}{' '}
          <span className="text-xs opacity-60">
            {width}x{height}
          </span>
        </span>
        {loading ? (
          <span className="animate-spin">
            <Icon icon="ei:spinner-3" height={24} />
          </span>
        ) : null}
      </div>
      <div
        style={{ height: scaledHeight, width: scaledWidth }}
        className="origin-top-left bg-white"
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
    </div>
  );
};

export default Device;
