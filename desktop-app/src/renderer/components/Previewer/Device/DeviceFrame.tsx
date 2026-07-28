import cx from 'classnames';
import {Device as IDevice} from 'common/deviceList';
import {ReactNode, Ref} from 'react';
import Spinner from 'renderer/components/Spinner';
import type {DesignOverlayState, ViewResolution} from '../../../store/features/design-overlay';
import {Coordinates} from '../../../store/features/ruler';
import GuideGrid, {DefaultGuide} from '../Guides';
import ScaledFrame from '../ScaledFrame';
import DesignOverlay from './DesignOverlay';
import type {NavigationState} from './navigationMachine';

const RULER_GUTTER = 30;

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
  initialSrc: string;
  webviewRef: Ref<Electron.WebviewTag>;
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
  initialSrc,
  webviewRef,
  toolbar,
}: Props) => {
  const scaledHeight = height * zoomfactor;
  const scaledWidth = width * zoomfactor;
  const rulerOffset = rulerActive ? RULER_GUTTER : 0;

  return (
    <div
      className={cx('h-fit', {
        'w-52': isRestrictedMinimumDeviceSize,
      })}
    >
      <div className="flex justify-between">
        <span>
          {device.name}
          <span className="ml-[2px] text-xs opacity-60">
            {width}x{height}
          </span>
        </span>
        {navigation.loading ? <Spinner spinnerHeight={24} /> : null}
      </div>
      {toolbar}
      <div className="flex gap-4">
        <ScaledFrame
          width={width}
          height={height}
          scale={zoomfactor}
          offset={rulerOffset}
          className="bg-white"
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
