import {Icon} from '@iconify/react';
import cx from 'classnames';
import {useState} from 'react';
import {Device} from 'common/deviceList';
import {useDeviceScreenshot} from 'renderer/hooks/useScreenshot';
import {ColorBlindnessTools} from './ColorBlindnessTools';
import DesignOverlayControls from './DesignOverlayControls';

interface Props {
  getWebview: () => Electron.WebviewTag | null;
  device: Device;
  setScreenshotInProgress: (value: boolean) => void;
  onCaptured: () => void;
  onSimulationChange: (name: string | undefined) => void;
  openDevTools: () => void;
  toggleRuler: () => void;
  /** Controlled: the device's individual-rotation state lives in the store. */
  rotated: boolean;
  onRotate: (state: boolean) => void;
  onIndividualLayoutHandler: (device: Device) => void;
  isIndividualLayout: boolean;
  isDeviceRotationEnabled: boolean;
}

interface PillButtonProps {
  title: string;
  isActive?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

/** 28px action inside the floating device pill (Hybrid Studio design). */
const PillButton = ({
  title,
  isActive,
  isLoading = false,
  disabled = false,
  onClick,
  children,
}: PillButtonProps) => (
  <button
    type="button"
    title={title}
    aria-pressed={isActive}
    disabled={disabled}
    onClick={onClick}
    className={cx(
      'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] text-[15px] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent',
      isActive === true ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-hover hover:text-fg',
      {'cursor-not-allowed opacity-40': disabled}
    )}
  >
    <span className="pointer-events-none contents">
      {isLoading ? <Icon icon="line-md:loading-twotone-loop" /> : children}
    </span>
  </button>
);

const Toolbar = ({
  getWebview,
  device,
  setScreenshotInProgress,
  onCaptured,
  onSimulationChange,
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
    getWebview,
    device,
    onFullPageCapturePending: setScreenshotInProgress,
    onCaptured,
  });

  const refreshView = () => {
    const webview = getWebview();
    if (webview) {
      webview.reload();
    }
  };

  const toggleEventMirroring = async () => {
    const webview = getWebview();
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
    if (getWebview() === null) {
      return;
    }
    toggleRuler();
  };

  const rotate = async () => {
    onRotate(!rotated);
  };

  const scrollToTop = () => {
    const webview = getWebview();
    if (webview) {
      webview.executeJavaScript('window.scrollTo({ top: 0, behavior: "smooth" })', false);
    }
  };

  return (
    // Wrap rather than clip: at typical zoom a phone column is ~200px while the
    // pill needs ~330px, and clipped buttons would be unclickable.
    <div
      data-testid="device-pill"
      className="my-1 flex w-fit max-w-full flex-wrap items-center gap-[2px] rounded-[9px] border border-line bg-panel p-[3px] opacity-0 shadow-elevated transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100"
    >
      <PillButton title="Refresh This View" onClick={refreshView}>
        <Icon icon="ic:round-refresh" />
      </PillButton>
      <PillButton title="Quick Screenshot" isLoading={screenshotLoading} onClick={quickScreenshot}>
        <Icon icon="lucide:camera" />
      </PillButton>
      <PillButton
        title="Full Page Screenshot"
        isLoading={fullScreenshotLoading}
        onClick={fullScreenshot}
      >
        <Icon icon="ic:outline-photo-camera" />
      </PillButton>
      <PillButton title="Design Overlay" onClick={() => setIsDesignOverlayModalOpen(true)}>
        <Icon icon="lucide:layers" />
      </PillButton>
      <PillButton
        title="Disable Event Mirroring"
        isActive={eventMirroringOff}
        onClick={toggleEventMirroring}
      >
        <Icon icon="fluent:plug-disconnected-24-regular" />
      </PillButton>
      <PillButton title="Open Devtools" onClick={openDevTools}>
        <Icon icon="ic:round-code" />
      </PillButton>
      <PillButton
        title={
          isDeviceRotationEnabled
            ? 'Rotate This Device'
            : 'Rotation not available for non-mobile devices'
        }
        disabled={!isDeviceRotationEnabled}
        isActive={isDeviceRotationEnabled ? rotated : undefined}
        onClick={rotate}
      >
        <Icon icon={rotated ? 'mdi:phone-rotate-portrait' : 'mdi:phone-rotate-landscape'} />
      </PillButton>
      <PillButton title="Scroll to Top" onClick={scrollToTop}>
        <Icon icon="ic:baseline-arrow-upward" />
      </PillButton>
      <PillButton title="Show rulers" onClick={toggleRulers}>
        <Icon icon="tdesign:measurement-1" />
      </PillButton>
      <ColorBlindnessTools getWebview={getWebview} onSimulationChange={onSimulationChange} />
      <PillButton
        title={`${isIndividualLayout ? 'Disable' : 'Enable'} Individual Layout`}
        isActive={isIndividualLayout}
        onClick={() => onIndividualLayoutHandler(device)}
      >
        <Icon icon={isIndividualLayout ? 'ic:twotone-zoom-in-map' : 'ic:twotone-zoom-out-map'} />
      </PillButton>
      <DesignOverlayControls
        device={device}
        isOpen={isDesignOverlayModalOpen}
        onClose={() => setIsDesignOverlayModalOpen(false)}
      />
    </div>
  );
};

export default Toolbar;
