import {IPC_MAIN_CHANNELS} from 'common/constants';
import {Device} from 'common/deviceList';
import {ScreenshotArgs, ScreenshotResult} from 'main/screenshot';
import {useState} from 'react';
import screenshotSfx from 'renderer/assets/sfx/screenshot.mp3';
import useSound from 'use-sound';

/**
 * The camera shutter, silenced during E2E runs so test machines don't click
 * through every screenshot spec.
 */
export const useShutterSound = () => {
  const [play] = useSound(screenshotSfx, {volume: 0.5});
  return () => {
    if (!window.responsively.isE2E) {
      play();
    }
  };
};

interface DeviceScreenshotParams {
  getWebview: () => Electron.WebviewTag | null;
  device: Device;
  onFullPageCapturePending?: (inProgress: boolean) => void;
  /** Fires when a capture lands — drives the frame flash. */
  onCaptured?: () => void;
}

/**
 * Per-device screenshot service: quick (viewport) and full-page capture with
 * loading state and the shutter sound in one place.
 */
export const useDeviceScreenshot = ({
  getWebview,
  device,
  onFullPageCapturePending,
  onCaptured,
}: DeviceScreenshotParams) => {
  const playShutter = useShutterSound();
  const [quickLoading, setQuickLoading] = useState<boolean>(false);
  const [fullLoading, setFullLoading] = useState<boolean>(false);

  const quickScreenshot = async () => {
    const webview = getWebview();
    if (webview === null) {
      return;
    }
    setQuickLoading(true);
    try {
      await window.electron.ipcRenderer.invoke<ScreenshotArgs, ScreenshotResult>(
        IPC_MAIN_CHANNELS.SCREENSHOT,
        {
          webContentsId: webview.getWebContentsId(),
          device,
        }
      );
      onCaptured?.();
      playShutter();
    } catch (error) {
      console.error('Error while taking quick screenshot', error);
    }
    setQuickLoading(false);
  };

  const fullScreenshot = async () => {
    const webview = getWebview();
    if (webview === null) {
      return;
    }
    setFullLoading(true);
    try {
      onFullPageCapturePending?.(true);
      await window.electron.ipcRenderer.invoke<ScreenshotArgs, ScreenshotResult>(
        IPC_MAIN_CHANNELS.SCREENSHOT,
        {
          webContentsId: webview.getWebContentsId(),
          device,
          fullPage: true,
        }
      );

      onFullPageCapturePending?.(false);
      playShutter();
    } catch (error) {
      console.error('Error while taking full screenshot', error);
      onFullPageCapturePending?.(false);
    }
    setFullLoading(false);
  };

  return {quickScreenshot, fullScreenshot, quickLoading, fullLoading};
};
