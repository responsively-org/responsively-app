import {useDispatch, useSelector} from 'react-redux';
import cx from 'classnames';
import {Icon} from '@iconify/react';
import {
  resetCanvasPositions,
  selectActiveSuite,
  setCanvasPosition,
} from 'renderer/store/features/device-manager';
import {selectIsPresenting, setPresenting} from 'renderer/store/features/ui';
import {DOCK_POSITION, PREVIEW_LAYOUTS} from 'common/constants';
import {selectDockPosition, selectIsDevtoolsOpen} from 'renderer/store/features/devtools';
import {getDevicesMap, Device as IDevice} from 'common/deviceList';
import {useEffect, useMemo, useRef, useState} from 'react';
import Popover from 'renderer/components/Popover';
import {
  clampCanvasZoom,
  selectCanvasOptions,
  selectCanvasZoom,
  selectLayout,
  selectZoomFactor,
  setCanvasZoom,
  toggleCanvasOption,
  zoomIn,
  zoomOut,
  type CanvasOptions,
} from 'renderer/store/features/renderer';
import Device from './Device';
import {PREVIEW_PINCH_EVENT, type PinchDetail} from './pinch';
import DevtoolsResizer from './DevtoolsResizer';
import IndividualLayoutToolbar from './IndividualLayoutToolBar';

interface CanvasPosition {
  x: number;
  y: number;
}

const CANVAS_GAP = 60;
/** Present mode: hide the exit pill when the mouse has been still this long. */
const EXIT_PILL_IDLE_MS = 1500;
/** Accumulated pinch delta per zoomIn/zoomOut step in the grid layouts. */
const PINCH_STEP = 50;
/**
 * Per-event delta cap: trackpad pinches stream small deltas (~1–10) but a
 * ctrl+scroll mouse tick reports 100+, which uncapped would jump the whole
 * canvas zoom range in one notch.
 */
const PINCH_MAX_DELTA = 32;
const CANVAS_ORIGIN = 40;
const CANVAS_ROW_WIDTH = 2600;

/** Simple row-flow arrangement in world coordinates. */
const arrangeDevices = (devices: IDevice[], deviceScale: number): CanvasPosition[] => {
  let x = CANVAS_ORIGIN;
  let y = CANVAS_ORIGIN;
  let rowHeight = 0;
  return devices.map((device) => {
    const width = device.width * deviceScale;
    const height = device.height * deviceScale;
    if (x > CANVAS_ORIGIN && x + width > CANVAS_ROW_WIDTH) {
      x = CANVAS_ORIGIN;
      y += rowHeight + CANVAS_GAP;
      rowHeight = 0;
    }
    const position = {x, y};
    x += width + CANVAS_GAP;
    rowHeight = Math.max(rowHeight, height);
    return position;
  });
};

const Previewer = () => {
  const dispatch = useDispatch();
  const activeSuite = useSelector(selectActiveSuite);
  const devices = activeSuite.devices.map((id) => getDevicesMap()[id]);
  const dockPosition = useSelector(selectDockPosition);
  const isDevtoolsOpen = useSelector(selectIsDevtoolsOpen);
  const layout = useSelector(selectLayout);
  const canvasZoom = useSelector(selectCanvasZoom);
  const deviceScale = useSelector(selectZoomFactor);
  const isPresenting = useSelector(selectIsPresenting);
  const canvasOptions = useSelector(selectCanvasOptions);
  const presenting = isPresenting && layout === PREVIEW_LAYOUTS.CANVAS;
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [exitPillHidden, setExitPillHidden] = useState<boolean>(false);
  const exitPillRef = useRef<HTMLButtonElement>(null);
  const [individualDevice, setIndividualDevice] = useState<IDevice>(devices[0]);
  const isIndividualLayout = layout === PREVIEW_LAYOUTS.INDIVIDUAL;
  const isMasonryLayout = layout === PREVIEW_LAYOUTS.MASONRY;
  const isCanvasLayout = layout === PREVIEW_LAYOUTS.CANVAS;
  // The remembered individual device may have left the suite; fall back to
  // the first device instead of hiding every preview.
  const individualDeviceId = devices.some((d) => d.id === individualDevice?.id)
    ? individualDevice.id
    : devices[0]?.id;

  // Pan lives in local state (plus a ref for the drag handlers): during a
  // gesture it changes every frame, and only the world transform consumes it —
  // routing that through Redux would re-render far more than needed.
  const [canvasPan, setCanvasPan] = useState<CanvasPosition>({x: 0, y: 0});
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    base: CanvasPosition;
    /** Set when dragging one device frame rather than panning the world. */
    deviceId: string | null;
  } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  // Live position of the frame being dragged; committed to the store on drop.
  const [dragOverride, setDragOverride] = useState<{id: string; position: CanvasPosition} | null>(
    null
  );

  // Pinch zoom (trackpad pinch = ctrl+wheel). Canvas zooms smoothly toward
  // the focal point; the other layouts step through zoomSteps once enough
  // delta accumulates. The zoom ref is updated eagerly so events that arrive
  // between a dispatch and the next render compound from the right value.
  const canvasZoomRef = useRef<number>(canvasZoom);
  canvasZoomRef.current = canvasZoom;
  const pinchAccRef = useRef<number>(0);
  const applyPinch = (rawDeltaY: number, focalX: number, focalY: number) => {
    const deltaY = Math.max(-PINCH_MAX_DELTA, Math.min(PINCH_MAX_DELTA, rawDeltaY));
    if (isCanvasLayout) {
      const stage = stageRef.current;
      if (stage === null) {
        return;
      }
      const oldZoom = canvasZoomRef.current;
      const newZoom = clampCanvasZoom(oldZoom * Math.exp(-deltaY * 0.01));
      if (newZoom === oldZoom) {
        return;
      }
      canvasZoomRef.current = newZoom;
      const rect = stage.getBoundingClientRect();
      const localX = focalX - rect.left;
      const localY = focalY - rect.top;
      // Keep the world point under the cursor fixed while the scale changes.
      setCanvasPan((pan) => ({
        x: localX - ((localX - pan.x) / oldZoom) * newZoom,
        y: localY - ((localY - pan.y) / oldZoom) * newZoom,
      }));
      dispatch(setCanvasZoom(newZoom));
    } else {
      pinchAccRef.current += deltaY;
      while (pinchAccRef.current <= -PINCH_STEP) {
        dispatch(zoomIn());
        pinchAccRef.current += PINCH_STEP;
      }
      while (pinchAccRef.current >= PINCH_STEP) {
        dispatch(zoomOut());
        pinchAccRef.current -= PINCH_STEP;
      }
    }
  };
  const applyPinchRef = useRef(applyPinch);
  applyPinchRef.current = applyPinch;

  // Pinches over a webview reach us via the guest preload → Device → this
  // window event, already mapped to host coordinates.
  useEffect(() => {
    const onPinch = (e: Event) => {
      const {deltaY, x, y} = (e as CustomEvent<PinchDetail>).detail;
      applyPinchRef.current(deltaY, x, y);
    };
    window.addEventListener(PREVIEW_PINCH_EVENT, onPinch);
    return () => window.removeEventListener(PREVIEW_PINCH_EVENT, onPinch);
  }, []);

  const deviceIdsKey = activeSuite.devices.join(',');
  const arranged = useMemo(
    () => (isCanvasLayout ? arrangeDevices(devices, deviceScale) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isCanvasLayout, deviceScale, deviceIdsKey]
  );
  const positionFor = (device: IDevice, idx: number): CanvasPosition => {
    if (dragOverride?.id === device.id) {
      return dragOverride.position;
    }
    return (
      activeSuite.canvasPositions?.[device.id] ??
      arranged[idx] ?? {x: CANVAS_ORIGIN, y: CANVAS_ORIGIN}
    );
  };

  // The exit pill gets out of the way when the mouse is still (screenshots
  // shouldn't have chrome in them) and returns on any movement.
  useEffect(() => {
    if (!presenting) {
      setExitPillHidden(false);
      return undefined;
    }
    let timer: ReturnType<typeof setTimeout> | null = null;
    const arm = () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        // Never hide it under a hovering cursor.
        if (exitPillRef.current?.matches(':hover')) {
          arm();
          return;
        }
        setExitPillHidden(true);
      }, EXIT_PILL_IDLE_MS);
    };
    const onMouseMove = () => {
      setExitPillHidden(false);
      arm();
    };
    document.addEventListener('mousemove', onMouseMove);
    arm();
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [presenting]);

  // Present mode exits on Escape.
  useEffect(() => {
    if (!presenting) {
      return undefined;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(setPresenting(false));
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [presenting, dispatch]);

  // Wheel must preventDefault (trackpad pinch arrives as ctrl+wheel), which
  // React's passive listeners can't — attach natively. Every layout zooms on
  // pinch; plain wheel pans the canvas and scrolls the grids natively.
  useEffect(() => {
    const stage = stageRef.current;
    if (stage === null) {
      return undefined;
    }
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        applyPinchRef.current(e.deltaY, e.clientX, e.clientY);
        return;
      }
      if (!isCanvasLayout) {
        return;
      }
      e.preventDefault();
      setCanvasPan((pan) => ({x: pan.x - e.deltaX, y: pan.y - e.deltaY}));
    };
    stage.addEventListener('wheel', onWheel, {passive: false});
    return () => stage.removeEventListener('wheel', onWheel);
  }, [isCanvasLayout]);

  const onStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Portaled popover panels bubble through the React tree even though they
    // live under <body>: if the real DOM target isn't inside the stage, this
    // event is not ours. And pointer capture retargets the whole stream,
    // which would swallow the click on any control rendered over the stage.
    if (!stageRef.current?.contains(target)) {
      return;
    }
    if (target.closest('[data-canvas-controls]') !== null) {
      return;
    }
    const item = target.closest('[data-canvas-item]');
    if (item !== null) {
      // Drag a device frame by its label; anything else on the device
      // (toolbar, webview) belongs to the device itself.
      if (target.closest('[data-device-label]') === null) {
        return;
      }
      const deviceId = item.getAttribute('data-canvas-item')!;
      setSelectedDeviceId(deviceId);
      const idx = devices.findIndex((d) => d.id === deviceId);
      dragState.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        base: positionFor(devices[idx], idx),
        deviceId,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }
    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      base: canvasPan,
      deviceId: null,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (drag === null || drag.pointerId !== e.pointerId) {
      return;
    }
    if (drag.deviceId !== null) {
      // Pointer deltas are screen pixels; the world is scaled by canvasZoom.
      setDragOverride({
        id: drag.deviceId,
        position: {
          x: drag.base.x + (e.clientX - drag.startX) / canvasZoom,
          y: drag.base.y + (e.clientY - drag.startY) / canvasZoom,
        },
      });
      return;
    }
    setCanvasPan({
      x: drag.base.x + (e.clientX - drag.startX),
      y: drag.base.y + (e.clientY - drag.startY),
    });
  };

  const onStagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (drag === null || drag.pointerId !== e.pointerId) {
      return;
    }
    if (drag.deviceId !== null && dragOverride !== null) {
      dispatch(
        setCanvasPosition({
          suite: activeSuite.id,
          device: drag.deviceId,
          position: dragOverride.position,
        })
      );
      setDragOverride(null);
    }
    dragState.current = null;
  };

  return (
    <div className="h-full">
      {isIndividualLayout && (
        <IndividualLayoutToolbar
          individualDevice={individualDevice}
          setIndividualDevice={setIndividualDevice}
          devices={devices}
        />
      )}
      <div
        className={cx('flex h-full', {
          'flex-col': dockPosition === DOCK_POSITION.BOTTOM,
          'flex-row': dockPosition === DOCK_POSITION.RIGHT,
          'justify-between': !isIndividualLayout,
          'justify-center': isIndividualLayout,
        })}
      >
        <div className="flex grow overflow-hidden">
          <div
            ref={stageRef}
            data-testid={isCanvasLayout ? 'canvas-stage' : undefined}
            className={cx(
              'w-full grow',
              isCanvasLayout
                ? 'canvas-dots relative cursor-grab touch-none overflow-hidden select-none active:cursor-grabbing'
                : 'overflow-y-auto'
            )}
            style={{height: '100%'}}
            onPointerDown={isCanvasLayout ? onStagePointerDown : undefined}
            onPointerMove={isCanvasLayout ? onStagePointerMove : undefined}
            onPointerUp={isCanvasLayout ? onStagePointerUp : undefined}
          >
            {presenting ? (
              <button
                ref={exitPillRef}
                type="button"
                data-canvas-controls
                data-testid="exit-present"
                onClick={() => dispatch(setPresenting(false))}
                className={cx(
                  'absolute bottom-[18px] left-1/2 z-20 flex h-[34px] -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-panel px-4 text-[12.5px] font-bold text-fg shadow-elevated transition-opacity duration-300 focus:outline-none',
                  exitPillHidden ? 'pointer-events-none opacity-0' : 'opacity-90 hover:opacity-100'
                )}
              >
                <span className="pointer-events-none contents">
                  <Icon icon="ic:round-close" fontSize={15} />
                  Exit presentation
                </span>
              </button>
            ) : null}
            {isCanvasLayout && !presenting ? (
              <>
                <div className="pointer-events-none absolute bottom-[14px] left-4 z-10 font-mono text-[11px] text-muted">
                  canvas mode · drag to pan · drag labels to move devices · click a label to select
                </div>
                <div
                  data-canvas-controls
                  className="absolute right-4 bottom-[14px] z-10 flex items-center gap-[2px] rounded-full border border-line bg-panel p-1 shadow-elevated"
                >
                  <Popover
                    triggerTitle="View options"
                    anchor="top end"
                    triggerClassName="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[15px] text-muted transition-colors hover:bg-hover hover:text-fg"
                    className="w-[186px] p-[5px]"
                    trigger={
                      <span className="pointer-events-none contents">
                        <Icon icon="carbon:overflow-menu-horizontal" />
                      </span>
                    }
                  >
                    <div className="px-[9px] pt-[7px] pb-[3px] text-[10px] font-bold tracking-[0.07em] text-muted">
                      SHOW ON CANVAS
                    </div>
                    {(
                      [
                        {key: 'showBezels', label: 'Device frames'},
                        {key: 'showNames', label: 'Device names'},
                        {key: 'showDims', label: 'Resolutions'},
                      ] as Array<{key: keyof CanvasOptions; label: string}>
                    ).map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        aria-pressed={canvasOptions[item.key]}
                        onClick={() => dispatch(toggleCanvasOption(item.key))}
                        className="flex w-full items-center gap-2 rounded-[7px] px-[9px] py-[7px] text-[12.5px] text-fg hover:bg-hover focus:outline-none"
                      >
                        <span className="pointer-events-none contents">
                          <Icon
                            icon="ic:round-check"
                            fontSize={14}
                            className={cx('text-accent', {'opacity-0': !canvasOptions[item.key]})}
                          />
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </Popover>
                  <div className="mx-[3px] h-4 w-px bg-line" />
                  <button
                    type="button"
                    title="Auto-arrange"
                    onClick={() => {
                      dispatch(resetCanvasPositions(activeSuite.id));
                      setCanvasPan({x: 0, y: 0});
                    }}
                    className="h-[26px] rounded-full px-[10px] text-[11.5px] text-muted transition-colors hover:bg-hover hover:text-fg focus:outline-none"
                  >
                    Arrange
                  </button>
                  <button
                    type="button"
                    title="Reset view"
                    onClick={() => {
                      setCanvasPan({x: 0, y: 0});
                      dispatch(setCanvasZoom(0.9));
                    }}
                    className="h-[26px] rounded-full px-[10px] text-[11.5px] text-muted transition-colors hover:bg-hover hover:text-fg focus:outline-none"
                  >
                    Reset
                  </button>
                </div>
              </>
            ) : null}
            {/* One stable host for every layout: devices never unmount on a
                layout switch (a remount reloads the webview). Masonry is CSS
                multi-column (react-masonry-component is unmaintained and
                incompatible with React 19); INDIVIDUAL hides the others;
                CANVAS turns this same element into the transformed world. */}
            <div
              data-testid={isCanvasLayout ? 'canvas-world' : undefined}
              className={cx({
                'w-full p-2': isMasonryLayout,
                'flex h-full gap-4 overflow-auto p-4': !isMasonryLayout && !isCanvasLayout,
                'flex-wrap': layout === PREVIEW_LAYOUTS.FLEX,
                'justify-center': isIndividualLayout,
                'relative h-0 w-0': isCanvasLayout,
              })}
              style={
                isCanvasLayout
                  ? {
                      transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasZoom})`,
                      transformOrigin: '0 0',
                    }
                  : isMasonryLayout
                    ? {columnWidth: 275, columnGap: 0}
                    : undefined
              }
            >
              {devices.map((device, idx) => (
                <div
                  key={device.id}
                  data-canvas-item={isCanvasLayout ? device.id : undefined}
                  className={cx({
                    'w-fit break-inside-avoid p-4': isMasonryLayout,
                    hidden: isIndividualLayout && device.id !== individualDeviceId,
                    'absolute w-max': isCanvasLayout,
                    // Selection (canvas): accent label + screen ring, and the
                    // device pill stays visible without hover.
                    '**:data-device-label:text-accent **:data-scaled-frame:ring-1 **:data-scaled-frame:ring-accent **:data-[testid=device-pill]:pointer-events-auto **:data-[testid=device-pill]:opacity-100':
                      isCanvasLayout && device.id === selectedDeviceId,
                  })}
                  style={
                    isCanvasLayout
                      ? {left: positionFor(device, idx).x, top: positionFor(device, idx).y}
                      : undefined
                  }
                >
                  <Device
                    device={device}
                    isPrimary={isIndividualLayout ? device.id === individualDeviceId : idx === 0}
                    setIndividualDevice={setIndividualDevice}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        {isDevtoolsOpen && dockPosition !== DOCK_POSITION.UNDOCKED ? <DevtoolsResizer /> : null}
      </div>
    </div>
  );
};

export default Previewer;
