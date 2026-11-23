import {IPC_MAIN_CHANNELS} from 'common/constants';
import {useDispatch, useSelector} from 'react-redux';
import {
  selectIsCapturingScreenshot,
  selectIsInspecting,
  selectRotate,
  setIsCapturingScreenshot,
  setIsInspecting,
  setRotate,
} from 'renderer/store/features/renderer';
import {Icon} from '@iconify/react';
import {ScreenshotArgs, ScreenshotAllArgs, ScreenshotResult} from 'main/screenshot';
import {selectActiveSuite} from 'renderer/store/features/device-manager';
import {getDevicesMap} from 'common/deviceList';
import {
  FULL_PAGE_SETTLE_MS,
  prepareFullPageCapture,
  useShutterSound,
} from 'renderer/hooks/useScreenshot';
import {APP_VIEWS, setAppView} from 'renderer/store/features/ui';
import NavigationControls from './NavigationControls';
import Menu from './Menu';
import AddressBar from './AddressBar';
import {IconButton, ToolbarAction, ToolbarDivider, ToolbarGroup} from './primitives';
import ColorSchemeToggle from './ColorSchemeToggle';
import ModalLoader from '../ModalLoader';
import {PreviewSuiteSelector} from './PreviewSuiteSelector';
import useKeyboardShortcut, {
  SHORTCUT_CHANNEL,
} from '../KeyboardShortcutsManager/useKeyboardShortcut';
import McpPanel from './McpPanel';
import {ColorBlindnessControls} from './ColorBlindnessControls';

const ToolBar = () => {
  const rotateDevices = useSelector(selectRotate);
  const isInspecting = useSelector(selectIsInspecting);
  const isCapturingScreenshot = useSelector(selectIsCapturingScreenshot);
  const activeSuite = useSelector(selectActiveSuite);
  const dispatch = useDispatch();
  const playShutter = useShutterSound();

  function handleInspectShortcut() {
    dispatch(setIsInspecting(!isInspecting));
  }

  const screenshotCaptureHandler = async () => {
    if (isCapturingScreenshot) {
      return;
    }

    dispatch(setIsCapturingScreenshot(true));
    const webViews: NodeListOf<Electron.WebviewTag> = document.querySelectorAll('webView');
    const screens: Array<ScreenshotAllArgs> = [];
    const restores: Array<() => void> = [];
    const devices = activeSuite.devices.map((d) => getDevicesMap()[d]);
    // Sequential await: every webview must be measured and resized before the
    // capture fires (the old forEach(async) raced the capture call).
    for (const webview of Array.from(webViews)) {
      const device = devices.find((d) => d.name === webview.id);
      if (device != null) {
        const prep = await prepareFullPageCapture(webview);
        screens.push({
          webContentsId: webview.getWebContentsId(),
          device,
          previousHeight: prep.previousHeight,
          previousTransform: prep.previousTransform,
          pageHeight: prep.pageHeight,
        });
        restores.push(prep.restore);
      }
    }
    await new Promise((resolve) => {
      setTimeout(resolve, FULL_PAGE_SETTLE_MS);
    });
    await window.electron.ipcRenderer.invoke<Array<ScreenshotAllArgs>, unknown>(
      IPC_MAIN_CHANNELS.SCREENSHOT_ALL,
      screens
    );

    // reset webviews to original size
    restores.forEach((restore) => {
      restore();
    });

    dispatch(setIsCapturingScreenshot(false));
    playShutter();
  };

  // Viewport-only capture: unlike Capture (which resizes every webview to the
  // full page height first), this leaves the previews untouched so each shot
  // is just the visible first fold.
  const quickCaptureHandler = async () => {
    if (isCapturingScreenshot) {
      return;
    }

    dispatch(setIsCapturingScreenshot(true));
    const webViews: NodeListOf<Electron.WebviewTag> = document.querySelectorAll('webView');
    const devices = activeSuite.devices.map((d) => getDevicesMap()[d]);
    const screens: Array<Promise<ScreenshotResult>> = [];
    for (const webview of Array.from(webViews)) {
      const device = devices.find((d) => d.name === webview.id);
      if (device != null) {
        screens.push(
          window.electron.ipcRenderer.invoke<ScreenshotArgs, ScreenshotResult>(
            IPC_MAIN_CHANNELS.SCREENSHOT,
            {
              webContentsId: webview.getWebContentsId(),
              device,
            }
          )
        );
      }
    }
    await Promise.all(screens);

    dispatch(setIsCapturingScreenshot(false));
    playShutter();
  };

  const handleClose = () => {
    // Do nothing. Prevent Dialog from closing.
  };

  const handleRotate = () => {
    dispatch(setRotate(!rotateDevices));
  };

  useKeyboardShortcut(SHORTCUT_CHANNEL.ROTATE_ALL, handleRotate);
  useKeyboardShortcut(SHORTCUT_CHANNEL.SCREENSHOT_ALL, screenshotCaptureHandler);
  useKeyboardShortcut(SHORTCUT_CHANNEL.QUICK_CAPTURE_ALL, quickCaptureHandler);
  useKeyboardShortcut(SHORTCUT_CHANNEL.INSPECT_ELEMENTS, handleInspectShortcut);

  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line-soft bg-panel px-[14px]">
      <NavigationControls />
      {/* Fill the available space while keeping the address input usable
          when the toolbar gets crowded. */}
      <div className="min-w-[150px] flex-1 xl:min-w-[220px]">
        <AddressBar />
      </div>
      <ToolbarGroup>
        <ToolbarAction onClick={handleRotate} isActive={rotateDevices} title="Rotate Devices">
          <Icon
            icon={rotateDevices ? 'mdi:phone-rotate-portrait' : 'mdi:phone-rotate-landscape'}
            fontSize={16}
          />
          <span className="hidden 2xl:inline">Rotate</span>
        </ToolbarAction>
        <ToolbarAction
          onClick={() => dispatch(setIsInspecting(!isInspecting))}
          isActive={isInspecting}
          title="Inspect Elements"
        >
          <Icon icon="lucide:inspect" fontSize={15} />
          <span className="hidden 2xl:inline">Inspect</span>
        </ToolbarAction>
        <ToolbarAction
          onClick={screenshotCaptureHandler}
          isActive={isCapturingScreenshot}
          title="Screenshot All WebViews"
        >
          <Icon icon="lucide:camera" fontSize={15} />
          <span className="hidden 2xl:inline">Capture</span>
        </ToolbarAction>
        <IconButton
          onClick={quickCaptureHandler}
          isActive={isCapturingScreenshot}
          title="Quick Capture"
        >
          <Icon icon="lucide:scan" width={16} />
        </IconButton>
        <ColorBlindnessControls />
        <ColorSchemeToggle />
      </ToolbarGroup>
      <ToolbarDivider />
      <McpPanel />
      <PreviewSuiteSelector />
      <IconButton
        onClick={() => {
          dispatch(setAppView(APP_VIEWS.DEVICE_MANAGER));
        }}
        title="Device Manager"
      >
        <Icon icon="lucide:plus" width={16} />
      </IconButton>
      <Menu />
      <ModalLoader isOpen={isCapturingScreenshot} onClose={handleClose} title="Screenshot" />
    </div>
  );
};

export default ToolBar;
