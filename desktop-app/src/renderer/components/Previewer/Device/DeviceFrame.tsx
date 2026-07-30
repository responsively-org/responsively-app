import {Icon} from '@iconify/react';
import cx from 'classnames';
import {Device as IDevice} from 'common/deviceList';
import {ReactNode} from 'react';
import Spinner from 'renderer/components/Spinner';
import type {DesignOverlayState, ViewResolution} from '../../../store/features/design-overlay';
import {Coordinates} from '../../../store/features/ruler';
import GuideGrid, {DefaultGuide} from '../Guides';
import ScaledFrame from '../ScaledFrame';
import DesignOverlay from './DesignOverlay';
import type {NavigationState} from './navigationMachine';

const RULER_GUTTER = 30;

/** Hardware bezel geometry per form factor (Hybrid Studio canvas design). */
const BEZELS: Record<string, {pad: string; radius: string; screenRadius: number}> = {
  phone: {pad: '16px 7px', radius: '26px', screenRadius: 9},
  tablet: {pad: '14px 12px', radius: '18px', screenRadius: 4},
  notebook: {pad: '10px 10px', radius: '12px 12px 3px 3px', screenRadius: 4},
};

interface Props {
  device: IDevice;
  width: number;
  height: number;
  zoomfactor: number;
  rulerActive: boolean;
  navigation: NavigationState;
  screenshotInProgress: boolean;
  coordinates: Coordinates;
  darkMode: boolean;
  defaultGuides: DefaultGuide[];
  designOverlay: DesignOverlayState | undefined;
  resolution: ViewResolution;
  isRestrictedMinimumDeviceSize: boolean;
  /** Canvas view options: hardware bezel + label visibility. */
  showBezel: boolean;
  showName: boolean;
  showDims: boolean;
  isRotated: boolean;
  /** Active vision simulation, shown as a badge next to the label. */
  simulationName: string | undefined;
  /** Brief capture feedback overlay. */
  flashing: boolean;
  initialSrc: string;
  /** Callback ref — never a ref object (see Device for why). */
  webviewRef: (element: Electron.WebviewTag | null) => void;
  toolbar: ReactNode;
}

/**
 * Presentational shell of one preview: header, toolbar, the scaled webview
 * frame with guides, and the loading/error/screenshot overlays. All behavior
 * lives in the Device orchestrator and its hooks.
 */
const DeviceFrame = ({
  device,
  width,
  height,
  zoomfactor,
  rulerActive,
  navigation,
  screenshotInProgress,
  coordinates,
  darkMode,
  defaultGuides,
  designOverlay,
  resolution,
  isRestrictedMinimumDeviceSize,
  showBezel,
  showName,
  showDims,
  isRotated,
  simulationName,
  flashing,
  initialSrc,
  webviewRef,
  toolbar,
}: Props) => {
  const scaledHeight = height * zoomfactor;
  const scaledWidth = width * zoomfactor;
  const rulerOffset = rulerActive ? RULER_GUTTER : 0;
  const bezel = showBezel ? (BEZELS[device.type] ?? BEZELS.notebook) : null;
  const isLaptop = device.type === 'notebook';

  return (
    <div
      className={cx('group h-fit', {
        'w-52': isRestrictedMinimumDeviceSize,
      })}
    >
      {/* The label row is also the canvas drag handle, so it stays in the
          tree even when name and dims are toggled off. */}
      <div
        className="flex min-h-[20px] items-baseline gap-2 pb-[2px]"
        data-device-label={device.name}
      >
        {showName ? <span className="text-[13px] font-bold">{device.name}</span> : null}
        {showDims ? (
          <span className="font-mono text-[11px] text-muted">
            {width} × {height}
          </span>
        ) : null}
        {simulationName !== undefined ? (
          <span
            data-testid="sim-badge"
            className="rounded-full bg-accent-soft px-2 py-[2px] text-[10.5px] capitalize text-accent"
          >
            {simulationName}
          </span>
        ) : null}
        <span className="flex-1" />
        {navigation.loading ? <Spinner spinnerHeight={20} /> : null}
      </div>
      {toolbar}
      <div className="flex gap-4">
        <div
          data-bezel={bezel !== null || undefined}
          className="relative"
          style={
            bezel !== null
              ? {
                  padding: bezel.pad,
                  borderRadius: bezel.radius,
                  background: 'linear-gradient(145deg,#3a3d45,#1b1d22)',
                  boxShadow: '0 10px 30px rgba(0,0,0,.35)',
                  width: 'fit-content',
                }
              : undefined
          }
        >
          {bezel !== null && !isLaptop && !isRotated ? (
            <div className="absolute left-1/2 top-[6px] h-1 w-[34px] -translate-x-1/2 rounded-full bg-[#4a4d55]" />
          ) : null}
          {bezel !== null && isLaptop ? (
            <div
              className="absolute -bottom-[9px] left-1/2 h-3 -translate-x-1/2 rounded-[2px_2px_12px_12px] shadow-[0_8px_16px_rgba(0,0,0,.3)]"
              style={{
                width: scaledWidth + 20 + 36,
                background: 'linear-gradient(180deg,#4a4d55,#26282e)',
              }}
            />
          ) : null}
          <ScaledFrame
            width={width}
            height={height}
            scale={zoomfactor}
            offset={rulerOffset}
            className="bg-white"
            style={bezel !== null ? {borderRadius: bezel.screenRadius} : undefined}
          >
            <GuideGrid
              scaledHeight={scaledHeight}
              scaledWidth={scaledWidth}
              height={height}
              width={width}
              coordinates={coordinates}
              zoomFactor={zoomfactor}
              night={darkMode}
              enabled={rulerActive}
              defaultGuides={defaultGuides}
            />
            <div className="bg-white">
              <webview
                id={device.name}
                src={initialSrc}
                style={{
                  height,
                  width,
                  display: 'inline-flex',
                  transform: `scale(${zoomfactor})`,
                  marginLeft: rulerActive ? `${RULER_GUTTER}px` : 0,
                  marginTop: rulerActive ? `${RULER_GUTTER}px` : 0,
                }}
                ref={webviewRef}
                className="origin-top-left"
                /* eslint-disable-next-line react/no-unknown-property */
                preload={`file://${window.responsively.webviewPreloadPath}`}
                data-scale-factor={zoomfactor}
                /* React drops boolean-valued unknown attributes entirely, so this
                 must be a string for the attribute to reach the DOM at all.
                 (@types/react declares it boolean, which react-dom never renders.) */
                /* eslint-disable-next-line react/no-unknown-property */
                allowpopups={'true' as unknown as boolean}
                /* eslint-disable-next-line react/no-unknown-property */
                useragent={device.userAgent}
              />
            </div>

            {designOverlay?.enabled &&
              designOverlay.image &&
              designOverlay.position === 'overlay' && (
                <DesignOverlay
                  resolution={resolution}
                  scaledWidth={scaledWidth}
                  scaledHeight={scaledHeight}
                  zoomFactor={zoomfactor}
                  coordinates={coordinates}
                  position={designOverlay.position}
                  rulerMargin={rulerOffset}
                  width={width}
                  height={height}
                />
              )}

            {screenshotInProgress ? (
              <div
                className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-slate-600 bg-opacity-95"
                style={{height: scaledHeight, width: scaledWidth}}
              >
                <Spinner spinnerHeight={30} />
              </div>
            ) : null}
            {flashing ? (
              <div
                data-testid="capture-flash"
                className="absolute left-0 top-0 z-10 flex items-center justify-center bg-[var(--flash)]"
                style={{height: scaledHeight, width: scaledWidth}}
              >
                <Icon icon="lucide:camera" fontSize={26} className="text-[#333]" />
              </div>
            ) : null}
            {navigation.error != null ? (
              <div
                className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-slate-600 bg-opacity-95"
                style={{height: scaledHeight, width: scaledWidth}}
              >
                <div className="text-center text-sm text-white">
                  <div className="text-base font-bold">ERROR: {navigation.error.code}</div>
                  <div className="text-sm">{navigation.error.description}</div>
                </div>
              </div>
            ) : null}
          </ScaledFrame>
        </div>

        {designOverlay?.enabled && designOverlay.image && designOverlay.position === 'side' && (
          <DesignOverlay
            resolution={resolution}
            scaledWidth={scaledWidth}
            scaledHeight={scaledHeight}
            zoomFactor={zoomfactor}
            coordinates={coordinates}
            position={designOverlay.position}
            rulerMargin={rulerOffset}
            width={width}
            height={height}
          />
        )}
      </div>
    </div>
  );
};

export default DeviceFrame;
