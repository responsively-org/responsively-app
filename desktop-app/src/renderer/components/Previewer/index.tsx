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
import {
  selectCanvasZoom,
  selectLayout,
  selectZoomFactor,
  setCanvasZoom,
} from 'renderer/store/features/renderer';
import Device from './Device';
import DevtoolsResizer from './DevtoolsResizer';
import IndividualLayoutToolbar from './IndividualLayoutToolBar';

interface CanvasPosition {
  x: number;
  y: number;
}

const CANVAS_GAP = 60;
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
  const presenting = isPresenting && layout === PREVIEW_LAYOUTS.CANVAS;
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

  // Wheel must preventDefault (trackpad pinch also arrives as ctrl+wheel),
  // which React's passive listeners can't — attach natively.
  useEffect(() => {
    const stage = stageRef.current;
    if (!isCanvasLayout || stage === null) {
      return undefined;
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCanvasPan((pan) => ({x: pan.x - e.deltaX, y: pan.y - e.deltaY}));
    };
    stage.addEventListener('wheel', onWheel, {passive: false});
    return () => stage.removeEventListener('wheel', onWheel);
  }, [isCanvasLayout]);

  const onStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Pointer capture retargets the whole stream, which would swallow the
    // click on any control rendered over the stage.
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
        <div className="flex flex-grow overflow-hidden">
          <div
            ref={stageRef}
            data-testid={isCanvasLayout ? 'canvas-stage' : undefined}
            className={cx(
              'w-full flex-grow',
              isCanvasLayout
                ? 'canvas-dots relative cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing'
                : 'overflow-y-auto'
            )}
            style={{height: '100%'}}
            onPointerDown={isCanvasLayout ? onStagePointerDown : undefined}
            onPointerMove={isCanvasLayout ? onStagePointerMove : undefined}
            onPointerUp={isCanvasLayout ? onStagePointerUp : undefined}
          >
            {presenting ? (
              <button
                type="button"
                data-canvas-controls
                data-testid="exit-present"
                onClick={() => dispatch(setPresenting(false))}
                className="absolute bottom-[18px] left-1/2 z-20 flex h-[34px] -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-panel px-4 text-[12.5px] font-bold text-fg opacity-90 shadow-elevated transition-opacity hover:opacity-100 focus:outline-none"
              >
                <span className="pointer-events-none contents">
                  <Icon icon="ic:round-close" fontSize={15} />
                  Exit presentation
                </span>
              </button>
            ) : null}
            {isCanvasLayout && !presenting ? (
              <div
                data-canvas-controls
                className="absolute right-3 top-3 z-10 flex items-center gap-[2px] rounded-full border border-line bg-panel p-[3px] shadow-elevated"
              >
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
