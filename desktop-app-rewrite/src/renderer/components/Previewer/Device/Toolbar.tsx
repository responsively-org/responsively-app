import { Icon } from '@iconify/react';
import { useState } from 'react';
import Button from 'renderer/components/Button';
import useSound from 'use-sound';
import { ScreenshotArgs, ScreenshotResult } from 'main/screenshot';
import { Device } from 'common/deviceList';

import screenshotSfx from 'renderer/assets/sfx/screenshot.mp3';
import WebPage from 'main/screenshot/webpage';

interface Props {
  webview: Electron.WebviewTag | null;
  device: Device;
  setScreenshotInProgress: (value: boolean) => void;
}

const Toolbar = ({ webview, device, setScreenshotInProgress }: Props) => {
  const [eventMirroringOff, setEventMirroringOff] = useState<boolean>(false);
  const [playScreenshotDone] = useSound(screenshotSfx, { volume: 0.5 });
  const [screenshotLoading, setScreenshotLoading] = useState<boolean>(false);
  const [fullScreenshotLoading, setFullScreenshotLoading] =
    useState<boolean>(false);

  const toggleEventMirroring = async () => {
    if (webview == null) {
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
      console.error('Error while toggleing event mirroring', error);
    }
  };

  const quickScreenshot = async () => {
    if (webview == null) {
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
      console.error('Error while taking quick screenshot', error);
    }
    setScreenshotLoading(false);
  };

  const fullScreenshot = async () => {
    if (webview == null) {
      return;
    }
    setFullScreenshotLoading(true);
    try {
      const webviewTag = window.document.getElementById(device.name);
      if (webviewTag == null) {
        return;
      }
      setScreenshotInProgress(true);
      const webPage = new WebPage(webview as unknown as Electron.WebContents);
      const pageHeight = await webPage.getPageHeight();

      const previousHeight = webviewTag.style.height;
      const previousTransform = webviewTag.style.transform;
      webviewTag.style.height = `${pageHeight}px`;
      webviewTag.style.transform = `scale(0.1)`;

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
      console.error('Error while taking full screenshot', error);
    }
    setFullScreenshotLoading(false);
  };

  return (
    <div className="my-1 flex items-center gap-1">
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
        onClick={toggleEventMirroring}
        isActive={eventMirroringOff}
        title="Disable Event Mirroring"
      >
        <Icon icon="fluent:plug-disconnected-24-regular" />
      </Button>
      <Button
        onClick={fullScreenshot}
        isLoading={fullScreenshotLoading}
        title="Full Page Screenshot"
      >
        <Icon icon="ic:outline-photo-camera" />
      </Button>
    </div>
  );
};

export default Toolbar;
