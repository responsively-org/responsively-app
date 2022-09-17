import { Icon } from '@iconify/react';
import { useState } from 'react';
import Button from 'renderer/components/Button';
import useSound from 'use-sound';
import { ScreenshotArgs, ScreenshotResult } from 'main/screenshot';

import screenshotSfx from 'renderer/assets/sfx/screenshot.mp3';

interface Props {
  webview: Electron.WebviewTag | null;
}

const Toolbar = ({ webview }: Props) => {
  const [eventMirroringOff, setEventMirroringOff] = useState<boolean>(false);
  const [playScreenshotDone] = useSound(screenshotSfx, { volume: 0.5 });
  const [screenshotLoading, setScreenshotLoading] = useState<boolean>(false);

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
      });
      playScreenshotDone();
    } catch (error) {
      console.error('Error while taking quick screenshot', error);
    }
    setScreenshotLoading(false);
  };

  return (
    <div className="my-1 flex gap-1">
      <Button onClick={quickScreenshot} isLoading={screenshotLoading}>
        <Icon icon="ic:outline-photo-camera" />
      </Button>
      <Button onClick={toggleEventMirroring} isActive={eventMirroringOff}>
        <Icon icon="fluent:plug-disconnected-24-regular" />
      </Button>
    </div>
  );
};

export default Toolbar;
