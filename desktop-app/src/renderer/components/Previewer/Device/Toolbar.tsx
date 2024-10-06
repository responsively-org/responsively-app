import { Icon } from '@iconify/react';
import { useState } from 'react';
import Button from 'renderer/components/Button';
import useSound from 'use-sound';
import { ScreenshotArgs, ScreenshotResult } from 'main/screenshot';
import { Device } from 'common/deviceList';
import WebPage from 'main/screenshot/webpage';

import screenshotSfx from 'renderer/assets/sfx/screenshot.mp3';
import { updateWebViewHeightAndScale } from 'common/webViewUtils';
import { ColorBlindnessTools } from './ColorBlindnessTools';

interface Props {
  webview: Electron.WebviewTag | null;
  device: Device;
  setScreenshotInProgress: (value: boolean) => void;
  openDevTools: () => void;
  toggleRuler: () => void;
  onRotate: (state: boolean) => void;
  onIndividualLayoutHandler: (device: Device) => void;
  isIndividualLayout: boolean;
}

const newVersionText = {
  id: 'new-version',
  text: 'There is a new version available.',
  link: 'https://responsively.app/download',
  linkText: 'See More',
};

const Toolbar = ({
  webview,
  device,
  setScreenshotInProgress,
  openDevTools,
  toggleRuler,
  onRotate,
  onIndividualLayoutHandler,
  isIndividualLayout,
}: Props) => {
  const [eventMirroringOff, setEventMirroringOff] = useState<boolean>(false);
  const [playScreenshotDone] = useSound(screenshotSfx, { volume: 0.5 });
  const [screenshotLoading, setScreenshotLoading] = useState<boolean>(false);
  const [fullScreenshotLoading, setFullScreenshotLoading] =
    useState<boolean>(false);
  const [rotated, setRotated] = useState<boolean>(false);

  const refreshView = () => {
    if (webview) {
      webview.reload();
    }
  };

  const toggleEventMirroring = async () => {
    if (webview === null) {
      return;
    }
    try {
      await webview.executeJavaScript(
        `
        if(window.___browserSync___){
          window.___browserSync___.socket.${
            eventMirroringOff ? 'open' : 'close'
          }()
        }
        true
      `
      );
      setEventMirroringOff(!eventMirroringOff);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error while toggleing event mirroring', error);
    }
  };

  const quickScreenshot = async () => {
    if (webview === null) {
      return;
    }
    setScreenshotLoading(true);
    try {
      await window.electron.ipcRenderer.invoke<
        ScreenshotArgs,
        ScreenshotResult
      >('screenshot', {
        webContentsId: webview.getWebContentsId(),
        device,
      });
      playScreenshotDone();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error while taking quick screenshot', error);
    }
    setScreenshotLoading(false);
  };

  const fullScreenshot = async () => {
    if (webview === null) {
      return;
    }
    setFullScreenshotLoading(true);
    try {
      const webviewTag = window.document.getElementById(device.name);
      if (webviewTag === null) {
        return;
      }
      setScreenshotInProgress(true);
      const webPage = new WebPage(webview as unknown as Electron.WebContents);
      const pageHeight = await webPage.getPageHeight();

      const previousHeight = webviewTag.style.height;
      const previousTransform = webviewTag.style.transform;
      updateWebViewHeightAndScale(webviewTag, pageHeight);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await window.electron.ipcRenderer.invoke<
        ScreenshotArgs,
        ScreenshotResult
      >('screenshot', {
        webContentsId: webview.getWebContentsId(),
        device,
      });

      webviewTag.style.height = previousHeight;
      webviewTag.style.transform = previousTransform;
      setScreenshotInProgress(false);
      playScreenshotDone();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error while taking full screenshot', error);
    }
    setFullScreenshotLoading(false);
  };

  const toggleRulers = async () => {
    if (webview === null) {
      return;
    }
    toggleRuler();
  };

  const rotate = async () => {
    setRotated(!rotated);
    onRotate(!rotated);
  };

  const scrollToTop = () => {
    if (webview) {
      webview.executeJavaScript(
        'window.scrollTo({ top: 0, behavior: "smooth" })',
        false
      );
    }
  };

  return (
    <div className="flex items-center justify-between gap-1">
      <div className="my-1 inline-flex max-w-[78%] items-center gap-1 overflow-x-auto">
        <Button onClick={refreshView} title="Refresh This View">
          <Icon icon="ic:round-refresh" />
        </Button>
        <Button
          onClick={quickScreenshot}
          isLoading={screenshotLoading}
          title="Quick Screenshot"
        >
          <div className="relative h-4 w-4">
            <Icon
              icon="ic:outline-photo-camera"
              className="absolute top-0 left-0"
            />
            <Icon
              icon="clarity:lightning-solid"
              className="absolute top-[-1px] right-[-2px]"
              height={8}
            />
          </div>
        </Button>
        <Button
          onClick={fullScreenshot}
          isLoading={fullScreenshotLoading}
          title="Full Page Screenshot"
        >
          <Icon icon="ic:outline-photo-camera" />
        </Button>
        <Button
          onClick={toggleEventMirroring}
          isActive={eventMirroringOff}
          title="Disable Event Mirroring"
        >
          <Icon icon="fluent:plug-disconnected-24-regular" />
        </Button>
        <Button onClick={openDevTools} title="Open Devtools">
          <Icon icon="ic:round-code" />
        </Button>
        <Button onClick={rotate} title="Rotate This Device">
          <Icon
            icon={
              rotated
                ? 'mdi:phone-rotate-portrait'
                : 'mdi:phone-rotate-landscape'
            }
          />
        </Button>
        <Button onClick={scrollToTop} title="Scroll to Top">
          <Icon icon="ic:baseline-arrow-upward" />
        </Button>
        <Button onClick={toggleRulers} title="Show rulers">
          <Icon icon="tdesign:measurement-1" />
        </Button>
        <ColorBlindnessTools webview={webview} />
      </div>
      <Button
        onClick={() => onIndividualLayoutHandler(device)}
        title={`${isIndividualLayout ? 'Disable' : 'Enable'} Individual Layout`}
      >
        <Icon
          icon={
            isIndividualLayout
              ? 'ic:twotone-zoom-in-map'
              : 'ic:twotone-zoom-out-map'
          }
        />
      </Button>
    </div>
  );
};

export default Toolbar;
