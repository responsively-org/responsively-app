import { Device as IDevice } from 'common/deviceList';
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
  device: IDevice;
  isPrimary: boolean;
}

const Device = ({ isPrimary, device }: Props) => {
  const rotateDevice = useSelector(selectRotate);
  let { height, width } = device;
  if (rotateDevice) {
    const temp = width;
    width = height;
    height = temp;
  }
  const address = useSelector(selectAddress);
  const [loading, setLoading] = useState<boolean>(false);
  const [screenshotInProgress, setScreenshotInProgess] =
    useState<boolean>(false);
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
      console.error('Web view crashed');
    });

    registerNavigationHandlers();
  }, [ref, dispatch, registerNavigationHandlers]);

  const scaledHeight = height * zoomfactor;
  const scaledWidth = width * zoomfactor;

  return (
    <div>
      <div className="flex justify-between">
        <span>
          {device.name}
          <span className="text-xs opacity-60">
            {width}x{height}
          </span>
        </span>
        {loading ? <Spinner spinnerHeight={24} /> : null}
      </div>
      <Toolbar
        webview={ref.current}
        device={device}
        setScreenshotInProgress={setScreenshotInProgess}
      />
      <div
        style={{ height: scaledHeight, width: scaledWidth }}
        className="relative origin-top-left bg-white"
      >
        <webview
          id={device.name}
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
        {screenshotInProgress ? (
          <div
            className="absolute top-0 left-0 flex h-full w-full items-center justify-center bg-slate-600 bg-opacity-95"
            style={{ height: scaledHeight, width: scaledWidth }}
          >
            <Spinner spinnerHeight={30} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Device;
