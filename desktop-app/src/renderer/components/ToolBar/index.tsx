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
import { ScreenshotAllArgs, FormData, EventData } from 'main/screenshot';
import { selectActiveSuite } from 'renderer/store/features/device-manager';
import WebPage from 'main/screenshot/webpage';
import { getDevicesMap } from 'common/deviceList';
import { updateWebViewHeightAndScale } from 'common/webViewUtils';
import { useState } from 'react';
import NavigationControls from './NavigationControls';
import Menu from './Menu';
import Button from '../Button';
import AddressBar from './AddressBar';
import ColorSchemeToggle from './ColorSchemeToggle';
import ModalLoader from '../ModalLoader';
import { PreviewSuiteSelector } from './PreviewSuiteSelector';
import CaptureAllScreens from '../ModalLoader/captureAllScreens';

const Divider = () => <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />;

const ToolBar = () => {
  const rotateDevices = useSelector(selectRotate);
  const isInspecting = useSelector(selectIsInspecting);
  const isCapturingScreenshot = useSelector(selectIsCapturingScreenshot);
  const activeSuite = useSelector(selectActiveSuite);
  const [showDiaglogue, setShowDialogue] = useState(false);
  const dispatch = useDispatch();

  const screenshotCaptureHandler = async (
    captureEachScreen: boolean,
    mergeImage: boolean,
    prefix = ''
  ) => {
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
    const eventData: EventData = {
      captureEachImage: captureEachScreen,
      mergeImages: mergeImage,
      prefix,
      screens,
    };
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await window.electron.ipcRenderer.invoke<EventData, any>(
      'screenshot:All',
      eventData
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

  const captureAllScreensFormData = async (data: FormData) => {
    setShowDialogue(false);
    await screenshotCaptureHandler(
      data.captureEachImage,
      data.mergeImages,
      data.prefix
    );
  };

  const captureAllScreens = async () => {
    // TODO: take screen capture
    setShowDialogue(true);
  };

  const handleClose = () => {
    // Do nothing. Prevent Dialog from closing.
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <NavigationControls />
      <AddressBar />
      <Button
        onClick={() => dispatch(setRotate(!rotateDevices))}
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
        onClick={captureAllScreens}
        isActive={isCapturingScreenshot}
        title="Screenshot All WebViews"
      >
        <Icon icon="lucide:camera" />
      </Button>
      <ColorSchemeToggle />
      <Divider />
      <PreviewSuiteSelector />
      <Menu />
      <CaptureAllScreens
        isOpen={showDiaglogue}
        onClose={() => setShowDialogue(false)}
        title="Capture All Pages"
        formData={captureAllScreensFormData}
      />
      <ModalLoader
        isOpen={isCapturingScreenshot}
        onClose={handleClose}
        title="Screenshot"
      />
    </div>
  );
};

export default ToolBar;
