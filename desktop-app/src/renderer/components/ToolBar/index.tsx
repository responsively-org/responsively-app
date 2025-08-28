import { useDispatch, useSelector } from 'react-redux';
import {
  selectIsCapturingScreenshot,
  selectIsInspecting,
  selectRotate,
  setIsCapturingScreenshot,
  setIsInspecting,
  setRotate,
  setNotifications,
} from 'renderer/store/features/renderer';
import { Icon } from '@iconify/react';
import { ScreenshotAllArgs } from 'main/screenshot';
import { selectActiveSuite } from 'renderer/store/features/device-manager';
import WebPage from 'main/screenshot/webpage';
import { getDevicesMap } from 'common/deviceList';
import { updateWebViewHeightAndScale } from 'common/webViewUtils';
import { APP_VIEWS, setAppView } from 'renderer/store/features/ui';
import NavigationControls from './NavigationControls';
import Menu from './Menu';
import Button from '../Button';
import AddressBar from './AddressBar';
import ColorSchemeToggle from './ColorSchemeToggle';
import ModalLoader from '../ModalLoader';
import { PreviewSuiteSelector } from './PreviewSuiteSelector';
import useKeyboardShortcut, {
  SHORTCUT_CHANNEL,
} from '../KeyboardShortcutsManager/useKeyboardShortcut';
import Shortcuts from './Shortcuts';
import { ColorBlindnessControls } from './ColorBlindnessControls';

const Divider = () => <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />;

const ToolBar = () => {
  const rotateDevices = useSelector(selectRotate);
  const isInspecting = useSelector(selectIsInspecting);
  const isCapturingScreenshot = useSelector(selectIsCapturingScreenshot);
  const activeSuite = useSelector(selectActiveSuite);
  const dispatch = useDispatch();

  function handleInspectShortcut() {
    dispatch(setIsInspecting(!isInspecting));
  }

  const screenshotCaptureHandler = async () => {
    if (isCapturingScreenshot) {
      return;
    }

    dispatch(setIsCapturingScreenshot(true));
    const webViews: NodeListOf<Electron.WebviewTag> =
      document.querySelectorAll('webView');
    const screens: Array<ScreenshotAllArgs> = [];
    const devices = activeSuite.devices.map((d) => getDevicesMap()[d]);
    webViews.forEach(async (webview) => {
      const device = devices.find((d) => d.name === webview.id);
      const webPage = new WebPage(webview as unknown as Electron.WebContents);
      const pageHeight = await webPage.getPageHeight();
      const previousHeight = webview.style.height;
      const previousTransform = webview.style.transform;
      updateWebViewHeightAndScale(webview, pageHeight);
      if (device != null) {
        screens.push({
          webContentsId: webview.getWebContentsId(),
          device,
          previousHeight,
          previousTransform,
          pageHeight,
        });
      }
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await window.electron.ipcRenderer.invoke<Array<ScreenshotAllArgs>, any>(
      'screenshot:All',
      screens
    );

    // reset webviews to original size
    webViews.forEach((webview) => {
      const screent = screens.find((s) => s.device.name === webview.id);
      if (screent != null) {
        webview.style.height = screent.previousHeight;
        webview.style.transform = screent.previousTransform;
      }
    });

    dispatch(setIsCapturingScreenshot(false));
  };

  const handleClose = () => {
    // Do nothing. Prevent Dialog from closing.
  };

  const handleRotate = () => {
    dispatch(setRotate(!rotateDevices));
  };

  useKeyboardShortcut(SHORTCUT_CHANNEL.ROTATE_ALL, handleRotate);
  useKeyboardShortcut(
    SHORTCUT_CHANNEL.SCREENSHOT_ALL,
    screenshotCaptureHandler
  );
  useKeyboardShortcut(SHORTCUT_CHANNEL.INSPECT_ELEMENTS, handleInspectShortcut);

  return (
    <div className="flex items-center justify-between gap-2">
      <NavigationControls />
      <AddressBar />
      <Button
        onClick={handleRotate}
        isActive={rotateDevices}
        title="Rotate Devices"
      >
        <Icon
          icon={
            rotateDevices
              ? 'mdi:phone-rotate-portrait'
              : 'mdi:phone-rotate-landscape'
          }
        />
      </Button>
      <Button
        onClick={() => dispatch(setIsInspecting(!isInspecting))}
        isActive={isInspecting}
        title="Inspect Elements"
      >
        <Icon icon="lucide:inspect" />
      </Button>
      <Button
        onClick={screenshotCaptureHandler}
        isActive={isCapturingScreenshot}
        title="Screenshot All WebViews"
      >
        <Icon icon="lucide:camera" />
      </Button>
      <ColorSchemeToggle />
      <Shortcuts />
      <ColorBlindnessControls />
      <Divider />
      <PreviewSuiteSelector />
      <Button
        onClick={() => {
          dispatch(setAppView(APP_VIEWS.DEVICE_MANAGER));
        }}
      >
        <Icon icon="lucide:plus" width={16} />
      </Button>
      <Menu />
      <ModalLoader
        isOpen={isCapturingScreenshot}
        onClose={handleClose}
        title="Screenshot"
      />
    </div>
  );
};

export default ToolBar;
