import {PREVIEW_LAYOUTS} from 'common/constants';
import {Device as IDevice} from 'common/deviceList';
import {CONTEXT_MENUS} from 'main/webview-context-menu/common';
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  selectIndividualRotations,
  setIndividualRotation,
} from 'renderer/store/features/device-manager';
import {
  selectAddress,
  selectCanvasOptions,
  selectLayout,
  selectRotate,
  selectZoomFactor,
  setLayout,
} from 'renderer/store/features/renderer';
import type {RootState} from '../../../store';
import {selectDesignOverlay, type ViewResolution} from '../../../store/features/design-overlay';
import {
  Coordinates,
  selectRuler,
  selectRulerEnabled,
  setRuler,
} from '../../../store/features/ruler';
import {selectDarkMode, selectIsPresenting} from '../../../store/features/ui';
import useKeyboardShortcut, {
  SHORTCUT_CHANNEL,
} from '../../KeyboardShortcutsManager/useKeyboardShortcut';
import {DefaultGuide} from '../Guides';
import {emitPinch} from '../pinch';
import DeviceFrame from './DeviceFrame';
import Toolbar from './Toolbar';
import useDeviceNavigation from './useDeviceNavigation';
import useDevtoolsBridge from './useDevtoolsBridge';
import useWebviewLifecycle from './useWebviewLifecycle';

interface Props {
  device: IDevice;
  isPrimary: boolean;
  setIndividualDevice: (device: IDevice) => void;
}

const Device = ({isPrimary, device, setIndividualDevice}: Props) => {
  const [screenshotInProgress, setScreenshotInProgress] = useState<boolean>(false);
  const address = useSelector(selectAddress);
  const zoomfactor = useSelector(selectZoomFactor);
  const rotateDevices = useSelector(selectRotate);
  const individualRotations = useSelector(selectIndividualRotations);
  const layout = useSelector(selectLayout);
  const canvasOptions = useSelector(selectCanvasOptions);
  const isPresenting = useSelector(selectIsPresenting);
  const dispatch = useDispatch();
  const [activeSimulation, setActiveSimulation] = useState<string | undefined>(undefined);
  const [flashing, setFlashing] = useState<boolean>(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCaptured = useCallback(() => {
    if (flashTimer.current !== null) {
      clearTimeout(flashTimer.current);
    }
    setFlashing(true);
    flashTimer.current = setTimeout(() => setFlashing(false), 400);
  }, []);
  const darkMode = useSelector(selectDarkMode);
  const ref = useRef<Electron.WebviewTag>(null);
  const initialAddress = useRef<string>(address);

  // The <webview> element and any ref object holding it are deliberately kept
  // out of child props: React's dev-mode render logging walks prop objects and
  // reads `$$typeof` off everything it finds, and the element exposes an own
  // `contentWindow` — a cross-origin Window for any remote page, which throws
  // a SecurityError on property access. Functions are never walked.
  const setWebviewRef = useCallback((element: Electron.WebviewTag | null) => {
    ref.current = element;
  }, []);
  const getWebview = useCallback(() => ref.current, []);

  const {webviewReady} = useWebviewLifecycle(ref, {isMobileCapable: device.isMobileCapable});
  const navigation = useDeviceNavigation({ref, isPrimary, webviewReady, address});
  const {openDevTools, inspectElement} = useDevtoolsBridge({ref, webviewReady, zoomfactor});

  const isIndividualLayout = layout === PREVIEW_LAYOUTS.INDIVIDUAL;
  const isCanvasLayout = layout === PREVIEW_LAYOUTS.CANVAS;
  const singleRotated = individualRotations[device.id] ?? false;

  let {height, width} = device;

  // Check if device rotation is enabled (only mobile-capable devices can be rotated)
  const isDeviceRotationEnabled = device.isMobileCapable && (rotateDevices || singleRotated);

  // Apply rotation: both global and individual rotation only affect mobile-capable devices
  if (isDeviceRotationEnabled) {
    const temp = width;
    width = height;
    height = temp;
  }

  const resolution: ViewResolution = `${width}x${height}`;
  const designOverlay = useSelector((state: RootState) => selectDesignOverlay(state)(resolution));
  // Select values, not the curried selector functions: a fresh closure from
  // useSelector re-renders every Device on every dispatch.
  const rulerActive = useSelector((state: RootState) => selectRulerEnabled(state)(resolution));
  const ruler = useSelector((state: RootState) => selectRuler(state)(resolution));

  const [coordinates, setCoordinates] = useState<Coordinates>({
    deltaX: 0,
    deltaY: 0,
    scrollX: 0,
    scrollY: 0,
    innerWidth: width * 2,
    innerHeight: height * 2,
  });

  const toggleRuler = useCallback(() => {
    if (!ref.current) {
      return;
    }
    if (ruler) {
      dispatch(
        setRuler({
          resolution,
          rulerState: {
            isRulerEnabled: !ruler.isRulerEnabled,
            rulerCoordinates: ruler.rulerCoordinates,
          },
        })
      );
    } else {
      dispatch(
        setRuler({
          resolution,
          rulerState: {
            isRulerEnabled: true,
            rulerCoordinates: coordinates,
          },
        })
      );
    }
  }, [dispatch, ruler, coordinates, resolution]);

  useKeyboardShortcut(SHORTCUT_CHANNEL.TOGGLE_RULERS, toggleRuler);

  const onRotateHandler = (state: boolean) =>
    dispatch(setIndividualRotation({id: device.id, rotated: state}));

  const onIndividualLayoutHandler = (selectedDevice: IDevice) => {
    if (!isIndividualLayout) {
      dispatch(setLayout(PREVIEW_LAYOUTS.INDIVIDUAL));
      setIndividualDevice(selectedDevice);
    } else {
      dispatch(setLayout(PREVIEW_LAYOUTS.COLUMN));
    }
  };

  // Guest → host messages: mirrored scroll coordinates and context-menu
  // commands.
  useEffect(() => {
    const webview = ref.current;
    if (!webview) {
      return undefined;
    }
    const ipcMessageHandler = (e: Electron.IpcMessageEvent) => {
      if (e.channel === 'pass-scroll-data') {
        setCoordinates({
          deltaX: e.args[0].coordinates.x,
          deltaY: e.args[0].coordinates.y,
          scrollX: e.args[0].coordinates.scrollX,
          scrollY: e.args[0].coordinates.scrollY,
          innerHeight: e.args[0].innerHeight,
          innerWidth: e.args[0].innerWidth,
        });
      }
      if (e.channel === 'pass-pinch-data') {
        // Map the guest-viewport focal point into host coordinates: the
        // bounding rect carries every ancestor transform, offsetWidth is the
        // untransformed layout size (= the guest viewport).
        const {deltaY, x, y} = e.args[0];
        const rect = webview.getBoundingClientRect();
        emitPinch({
          deltaY,
          x: rect.left + (x / webview.offsetWidth) * rect.width,
          y: rect.top + (y / webview.offsetHeight) * rect.height,
        });
      }
      if (e.channel === 'context-menu-command') {
        const {command, arg} = e.args[0];
        switch (command) {
          case CONTEXT_MENUS.OPEN_CONSOLE.id:
            openDevTools();
            break;
          case CONTEXT_MENUS.INSPECT_ELEMENT.id: {
            const {
              contextMenuMeta: {x, y},
            } = arg;
            inspectElement(x, y);
            break;
          }
          default:
            console.log('Unhandled context menu command', command);
        }
      }
    };
    webview.addEventListener('ipc-message', ipcMessageHandler);
    return () => {
      webview.removeEventListener('ipc-message', ipcMessageHandler);
    };
  }, [ref, openDevTools, inspectElement]);

  // Read once per resolution, not on every render: the store read is a
  // synchronous IPC call and a fresh array identity defeats GuideGrid's memos.
  const defaultGuides = useMemo<DefaultGuide[]>(
    () =>
      window.electron.store
        .get('userPreferences.guides')
        .flatMap((x: unknown) => x as DefaultGuide[])
        .filter((x: DefaultGuide) => x.resolution === `${width}x${height}`),
    [width, height]
  );

  const isRestrictedMinimumDeviceSize =
    device.width < 400 && zoomfactor < 0.6 && !isDeviceRotationEnabled;

  return (
    <DeviceFrame
      device={device}
      width={width}
      height={height}
      zoomfactor={zoomfactor}
      rulerActive={rulerActive}
      navigation={navigation}
      screenshotInProgress={screenshotInProgress}
      coordinates={coordinates}
      darkMode={darkMode}
      defaultGuides={defaultGuides}
      designOverlay={designOverlay}
      resolution={resolution}
      isRestrictedMinimumDeviceSize={isRestrictedMinimumDeviceSize}
      showBezel={isCanvasLayout && canvasOptions.showBezels}
      showName={!isCanvasLayout || canvasOptions.showNames}
      showDims={!isCanvasLayout || canvasOptions.showDims}
      isRotated={isDeviceRotationEnabled}
      simulationName={activeSimulation}
      flashing={flashing}
      initialSrc={initialAddress.current}
      webviewRef={setWebviewRef}
      // Present mode is pure content — no per-device pills.
      toolbar={
        isPresenting && isCanvasLayout ? null : (
          <Toolbar
            getWebview={getWebview}
            device={device}
            setScreenshotInProgress={setScreenshotInProgress}
            onCaptured={onCaptured}
            onSimulationChange={setActiveSimulation}
            openDevTools={openDevTools}
            toggleRuler={toggleRuler}
            rotated={singleRotated}
            onRotate={onRotateHandler}
            onIndividualLayoutHandler={onIndividualLayoutHandler}
            isIndividualLayout={isIndividualLayout}
            isDeviceRotationEnabled={isDeviceRotationEnabled}
            rulerActive={rulerActive}
            designOverlay={designOverlay}
            resolution={resolution}
            variant={isCanvasLayout ? 'canvas' : 'grid'}
          />
        )
      }
    />
  );
};

// Previews re-render on webview scroll events (mirrored coordinates); memo
// keeps sibling devices and parent-driven renders from cascading into every
// frame.
export default memo(Device);
