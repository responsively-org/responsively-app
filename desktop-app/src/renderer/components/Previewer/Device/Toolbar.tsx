import {Icon} from '@iconify/react';
import cx from 'classnames';
import {useRef, useState} from 'react';
import {useDispatch} from 'react-redux';
import {Device} from 'common/deviceList';
import Popover from 'renderer/components/Popover';
import {useDeviceScreenshot} from 'renderer/hooks/useScreenshot';
import {
  overlayModeOf,
  setOverlayImage,
  setOverlayMode,
  setOverlayOpacity,
  toggleDesignOverlay,
  type DesignOverlayState,
  type ViewResolution,
} from 'renderer/store/features/design-overlay';
import {ColorBlindnessTools} from './ColorBlindnessTools';

interface Props {
  getWebview: () => Electron.WebviewTag | null;
  device: Device;
  setScreenshotInProgress: (value: boolean) => void;
  onCaptured: () => void;
  onSimulationChange: (name: string | undefined) => void;
  openDevTools: () => void;
  toggleRuler: () => void;
  rulerActive: boolean;
  /** Controlled: the device's individual-rotation state lives in the store. */
  rotated: boolean;
  onRotate: (state: boolean) => void;
  onIndividualLayoutHandler: (device: Device) => void;
  isIndividualLayout: boolean;
  isDeviceRotationEnabled: boolean;
  designOverlay: DesignOverlayState | undefined;
  resolution: ViewResolution;
  /**
   * Placement per the design: grid pills float over the frame's top-left and
   * reveal on hover; the canvas pill sits centered below the device and only
   * shows for the selected frame (the Previewer's selection wrapper reveals it).
   */
  variant: 'grid' | 'canvas';
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

interface MoreItemProps {
  title: string;
  icon: string;
  /** Trailing check per the design; undefined renders no check at all. */
  checked?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/** Row inside the "More device tools" popover (216px panel per the design). */
const MoreItem = ({title, icon, checked, disabled = false, onClick}: MoreItemProps) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    className={cx(
      'flex w-full items-center gap-2 whitespace-nowrap rounded-[7px] px-[9px] py-[7px] text-[12.5px] text-fg hover:bg-hover focus:outline-none',
      {'cursor-not-allowed opacity-40': disabled}
    )}
  >
    <span className="pointer-events-none contents">
      <Icon icon={icon} fontSize={14} className="text-muted" />
      {title}
      {checked !== undefined ? (
        <Icon
          icon="ic:round-check"
          fontSize={14}
          className={cx('ml-auto text-accent', {'opacity-0': !checked})}
        />
      ) : null}
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
  rulerActive,
  rotated,
  onRotate,
  onIndividualLayoutHandler,
  isIndividualLayout,
  isDeviceRotationEnabled,
  designOverlay,
  resolution,
  variant,
}: Props) => {
  const dispatch = useDispatch();
  const [eventMirroringOff, setEventMirroringOff] = useState<boolean>(false);
  const overlayFileInputRef = useRef<HTMLInputElement>(null);

  const onOverlayFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still fires a change event.
    e.target.value = '';
    if (file === undefined || !file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      dispatch(setOverlayImage({resolution, image: reader.result as string, fileName: file.name}));
    };
    reader.readAsDataURL(file);
  };
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
    <div
      data-testid="device-pill"
      className={cx(
        // Hidden pills are also pointer-transparent: neighbouring devices sit
        // close enough that an invisible-but-clickable pill would swallow
        // clicks aimed at the device beside it (the design avoids this by not
        // rendering hidden pills at all).
        'pointer-events-none absolute z-30 flex items-center gap-[2px] rounded-[9px] border border-line bg-panel p-[3px] opacity-0 shadow-elevated transition-opacity duration-150 group-focus-within:pointer-events-auto group-focus-within:opacity-100',
        variant === 'grid'
          ? 'left-0 top-[-6px] max-w-[calc(100%-12px)] flex-wrap group-hover:pointer-events-auto group-hover:opacity-100'
          : 'left-1/2 top-full mt-[10px] -translate-x-1/2'
      )}
    >
      <PillButton title="Refresh this device" onClick={refreshView}>
        <Icon icon="ic:round-refresh" />
      </PillButton>
      <PillButton
        title={
          isDeviceRotationEnabled
            ? 'Rotate this device'
            : 'Rotation not available for non-mobile devices'
        }
        disabled={!isDeviceRotationEnabled}
        isActive={isDeviceRotationEnabled ? rotated : undefined}
        onClick={rotate}
      >
        <Icon icon="mdi:phone-rotate-landscape" />
      </PillButton>
      <PillButton title="Quick screenshot" isLoading={screenshotLoading} onClick={quickScreenshot}>
        <Icon icon="lucide:camera" />
      </PillButton>
      <PillButton title="Open devtools" onClick={openDevTools}>
        <Icon icon="ic:round-code" />
      </PillButton>
      <PillButton title="Scroll to top" onClick={scrollToTop}>
        <Icon icon="ic:baseline-arrow-upward" />
      </PillButton>
      <PillButton
        title="Focus this device"
        isActive={isIndividualLayout}
        onClick={() => onIndividualLayoutHandler(device)}
      >
        <Icon icon="ic:round-fullscreen" />
      </PillButton>
      <PillButton title="Show rulers" isActive={rulerActive} onClick={toggleRulers}>
        <Icon icon="tdesign:measurement-1" />
      </PillButton>
      <ColorBlindnessTools getWebview={getWebview} onSimulationChange={onSimulationChange} />
      <Popover
        triggerTitle="More device tools"
        anchor="bottom start"
        triggerClassName="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] text-[15px] text-muted transition-colors hover:bg-hover hover:text-fg data-[open]:bg-active focus:outline-none"
        className="w-[216px] p-[5px]"
        trigger={
          <span className="pointer-events-none contents">
            <Icon icon="carbon:overflow-menu-horizontal" />
          </span>
        }
      >
        {({close}) => (
          <>
            <MoreItem
              title="Full-page screenshot"
              icon="ic:outline-photo-camera"
              disabled={fullScreenshotLoading}
              onClick={() => {
                close();
                fullScreenshot();
              }}
            />
            <MoreItem
              title="Design overlay"
              icon="lucide:layers"
              checked={designOverlay?.enabled === true}
              onClick={() => dispatch(toggleDesignOverlay({resolution}))}
            />
            {designOverlay?.enabled === true ? (
              <div className="flex flex-col gap-[7px] pb-2 pl-[31px] pr-[9px] pt-[2px]">
                <div className="flex gap-1" role="group" aria-label="Overlay mode">
                  <button
                    type="button"
                    aria-pressed={overlayModeOf(designOverlay) === 'grid'}
                    onClick={() => dispatch(setOverlayMode({resolution, mode: 'grid'}))}
                    className={cx(
                      'h-[22px] rounded-md border px-[10px] text-[11px] focus:outline-none',
                      overlayModeOf(designOverlay) === 'grid'
                        ? 'border-overlay bg-overlay-soft text-overlay'
                        : 'border-line text-muted hover:bg-hover'
                    )}
                  >
                    <span className="pointer-events-none contents">Grid</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={overlayModeOf(designOverlay) === 'image'}
                    onClick={() => {
                      // No image yet, or re-picking while already in image
                      // mode: straight to the native file picker.
                      if (designOverlay.image === '' || overlayModeOf(designOverlay) === 'image') {
                        overlayFileInputRef.current?.click();
                        return;
                      }
                      dispatch(setOverlayMode({resolution, mode: 'image'}));
                    }}
                    className={cx(
                      'h-[22px] rounded-md border px-[10px] text-[11px] focus:outline-none',
                      overlayModeOf(designOverlay) === 'image'
                        ? 'border-overlay bg-overlay-soft text-overlay'
                        : 'border-line text-muted hover:bg-hover'
                    )}
                  >
                    <span className="pointer-events-none contents">Design image</span>
                  </button>
                </div>
                <div className="flex items-center gap-[7px]">
                  <input
                    type="range"
                    min={10}
                    max={100}
                    aria-label="Overlay opacity"
                    value={designOverlay.opacity}
                    onChange={(e) =>
                      dispatch(
                        setOverlayOpacity({resolution, opacity: parseInt(e.target.value, 10)})
                      )
                    }
                    className="h-[14px] min-w-0 flex-1 accent-overlay"
                  />
                  <span className="w-[30px] text-right font-mono text-[10px] text-muted">
                    {designOverlay.opacity}%
                  </span>
                </div>
              </div>
            ) : null}
            <MoreItem
              title="Event mirroring"
              icon="fluent:plug-disconnected-24-regular"
              checked={!eventMirroringOff}
              onClick={() => {
                close();
                toggleEventMirroring();
              }}
            />
          </>
        )}
      </Popover>
      {/* Outside the popover so it survives the panel closing mid-pick. */}
      <input
        ref={overlayFileInputRef}
        type="file"
        accept="image/*"
        aria-label="Design overlay image"
        className="hidden"
        onChange={onOverlayFilePicked}
      />
    </div>
  );
};

export default Toolbar;
