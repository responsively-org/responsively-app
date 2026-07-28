import {Icon} from '@iconify/react';
import {useState} from 'react';
import Button from 'renderer/components/Button';
import {Device} from 'common/deviceList';
import {useDeviceScreenshot} from 'renderer/hooks/useScreenshot';
import {ColorBlindnessTools} from './ColorBlindnessTools';
import DesignOverlayControls from './DesignOverlayControls';

interface Props {
  webview: Electron.WebviewTag | null;
  device: Device;
  setScreenshotInProgress: (value: boolean) => void;
  openDevTools: () => void;
  toggleRuler: () => void;
  /** Controlled: the device's individual-rotation state lives in the store. */
  rotated: boolean;
  onRotate: (state: boolean) => void;
  onIndividualLayoutHandler: (device: Device) => void;
  isIndividualLayout: boolean;
  isDeviceRotationEnabled: boolean;
}

const Toolbar = ({
  webview,
  device,
  setScreenshotInProgress,
  openDevTools,
  toggleRuler,
  rotated,
  onRotate,
  onIndividualLayoutHandler,
  isIndividualLayout,
  isDeviceRotationEnabled,
}: Props) => {
  const [eventMirroringOff, setEventMirroringOff] = useState<boolean>(false);
  const [isDesignOverlayModalOpen, setIsDesignOverlayModalOpen] = useState<boolean>(false);
  const {
    quickScreenshot,
    fullScreenshot,
    quickLoading: screenshotLoading,
    fullLoading: fullScreenshotLoading,
  } = useDeviceScreenshot({
    webview,
    device,
    onFullPageCapturePending: setScreenshotInProgress,
  });

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
          window.___browserSync___.socket.${eventMirroringOff ? 'open' : 'close'}()
        }
        true
      `
      );
      setEventMirroringOff(!eventMirroringOff);
    } catch (error) {
      console.error('Error while toggleing event mirroring', error);
    }
  };

  const toggleRulers = async () => {
    if (webview === null) {
      return;
    }
    toggleRuler();
  };

  const rotate = async () => {
    onRotate(!rotated);
  };

  const scrollToTop = () => {
    if (webview) {
      webview.executeJavaScript('window.scrollTo({ top: 0, behavior: "smooth" })', false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-1">
      <div className="my-1 inline-flex max-w-[78%] items-center gap-1 overflow-x-auto">
        <Button onClick={refreshView} title="Refresh This View">
          <Icon icon="ic:round-refresh" />
        </Button>
        <Button onClick={quickScreenshot} isLoading={screenshotLoading} title="Quick Screenshot">
          <div className="relative h-4 w-4">
            <Icon icon="ic:outline-photo-camera" className="absolute left-0 top-0" />
            <Icon
              icon="clarity:lightning-solid"
              className="absolute right-[-2px] top-[-1px]"
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
        <Button onClick={() => setIsDesignOverlayModalOpen(true)} title="Design Overlay">
          <Icon icon="lucide:layers" />
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
          disabled={!isDeviceRotationEnabled}
          title={
            isDeviceRotationEnabled
              ? 'Rotate This Device'
              : 'Rotation not available for non-mobile devices'
          }
        >
          <Icon icon={rotated ? 'mdi:phone-rotate-portrait' : 'mdi:phone-rotate-landscape'} />
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
        <Icon icon={isIndividualLayout ? 'ic:twotone-zoom-in-map' : 'ic:twotone-zoom-out-map'} />
      </Button>
      <DesignOverlayControls
        device={device}
        isOpen={isDesignOverlayModalOpen}
        onClose={() => setIsDesignOverlayModalOpen(false)}
      />
    </div>
  );
};

export default Toolbar;
