import { Icon } from '@iconify/react';
import { useState } from 'react';
import Button from 'renderer/components/Button';
import useSound from 'use-sound';
import { ScreenshotArgs, ScreenshotResult } from 'main/screenshot';
import { Device } from 'common/deviceList';
import WebPage from 'main/screenshot/webpage';

import screenshotSfx from 'renderer/assets/sfx/screenshot.mp3';
import { selectRotate, setRotate } from 'renderer/store/features/renderer';
import { useDispatch, useSelector } from 'react-redux';
import { updateWebViewHeightAndScale } from 'common/webViewUtils';

interface Props {
  webview: Electron.WebviewTag | null;
  deviceID: string;
  device: Device;
  setScreenshotInProgress: (value: boolean) => void;
  openDevTools: () => void;
}

const Toolbar = ({
  webview,
  deviceID,
  device,
  setScreenshotInProgress,
  openDevTools,
}: Props) => {
  const [eventMirroringOff, setEventMirroringOff] = useState<boolean>(false);
  const [playScreenshotDone] = useSound(screenshotSfx, { volume: 0.5 });
  const [screenshotLoading, setScreenshotLoading] = useState<boolean>(false);
  const [fullScreenshotLoading, setFullScreenshotLoading] =
    useState<boolean>(false);
  const { devices, ...rotatedDevices } = useSelector(selectRotate);
  const dispatch = useDispatch();

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
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
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

  const rotate = () => {
    try {
      if (!devices[deviceID]) {
        return;
      }

      const devicesCloneObj = { ...devices };

      devicesCloneObj[deviceID] = {
        inSingle: !devicesCloneObj[deviceID].inSingle,
        rotate: !devicesCloneObj[deviceID].rotate,
      };

      dispatch(setRotate({ ...rotatedDevices, devices: devicesCloneObj }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error while rotate single screen', error);
    }
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
      <Button
        onClick={rotate}
        isActive={devices[deviceID]?.rotate}
        title="Rotate This Device"
      >
        <Icon
          icon={
            devices[deviceID]?.rotate
              ? 'mdi:phone-rotate-portrait'
              : 'mdi:phone-rotate-landscape'
          }
        />
      </Button>
    </div>
  );
};

export default Toolbar;
