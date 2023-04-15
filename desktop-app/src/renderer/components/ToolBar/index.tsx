import { useDispatch, useSelector } from 'react-redux';
import {
  selectIsCapturingScreenshot,
  selectIsInspecting,
  selectRotate,
  setIsCapturingScreenshot,
  setIsInspecting,
  setRotate,
} from 'renderer/store/features/renderer';
import { Icon } from '@iconify/react';
import { ScreenshotAllArgs } from 'main/screenshot';
import { selectActiveSuite } from 'renderer/store/features/device-manager';
import WebPage from 'main/screenshot/webpage';
import NavigationControls from './NavigationControls';
import Menu from './Menu';
import Button from '../Button';
import AddressBar from './AddressBar';
import ColorSchemeToggle from './ColorSchemeToggle';
import ModalLoader from '../ModalLoader';
import { PreviewSuiteSelector } from './PreviewSuiteSelector';

const Divider = () => <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />;

const ToolBar = () => {
  const rotateDevice = useSelector(selectRotate);
  const isInspecting = useSelector(selectIsInspecting);
  const isCapturingScreenshot = useSelector(selectIsCapturingScreenshot);
  const devices = useSelector(selectActiveSuite);
  const dispatch = useDispatch();

  const screenshotCaptureHandler = async () => {
    dispatch(setIsCapturingScreenshot(true));
    const webViews: NodeListOf<Electron.WebviewTag> =
      document.querySelectorAll('webView');
    const screens: Array<ScreenshotAllArgs> = [];
    webViews.forEach(async (webview) => {
      const device = devices.find((d) => d.name === webview.id);
      const webPage = new WebPage(webview as unknown as Electron.WebContents);
      const pageHeight = await webPage.getPageHeight();
      const previousHeight = webview.style.height;
      const previousTransform = webview.style.transform;
      webview.style.height = `${pageHeight}px`;
      webview.style.transform = `scale(0.1)`;
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

  return (
    <div className="flex items-center justify-between gap-2">
      <NavigationControls />
      <AddressBar />
      <Button
        onClick={() => dispatch(setRotate(!rotateDevice))}
        isActive={rotateDevice}
        title="Rotate Devices"
      >
        <Icon
          icon={
            rotateDevice
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
      <Divider />
      <PreviewSuiteSelector />
      <Menu />
      <ModalLoader
        isOpen={isCapturingScreenshot}
        onClose={handleClose}
        title="loading..."
      />
    </div>
  );
};

export default ToolBar;
