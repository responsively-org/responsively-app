import { handleContextMenuEvent } from 'main/webview-context-menu/handler';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from 'renderer/components/Spinner';
import { webViewPubSub } from 'renderer/lib/pubsub';
import {
  selectAddress,
  selectRotate,
  selectZoomFactor,
  setAddress,
} from 'renderer/store/features/renderer';
import { NAVIGATION_EVENTS } from '../../AddressBar/NavigationControls';
import Toolbar from './Toolbar';

interface Props {
  width: number;
  height: number;
  isPrimary: boolean;
  name: string;
}

const Device = ({
  height: heightProp,
  width: widthProp,
  isPrimary,
  name,
}: Props) => {
  const rotateDevice = useSelector(selectRotate);
  let height = heightProp;
  let width = widthProp;
  if (rotateDevice) {
    const temp = width;
    width = height;
    height = temp;
  }
  const address = useSelector(selectAddress);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const zoomfactor = useSelector(selectZoomFactor);
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

  const scaledHeight = height * zoomfactor;
  const scaledWidth = width * zoomfactor;

  return (
    <div>
      <div className="flex justify-between">
        <span>
          {name}{' '}
          <span className="text-xs opacity-60">
            {width}x{height}
          </span>
        </span>
        {loading ? <Spinner spinnerHeight={24} /> : null}
      </div>
      <Toolbar webview={ref.current} />
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
            transform: `scale(${zoomfactor})`,
          }}
          ref={ref}
          className="origin-top-left"
          preload={`file://${window.responsively.webviewPreloadPath}`}
          data-scale-factor={zoomfactor}
        />
      </div>
    </div>
  );
};

export default Device;
