import {Icon} from '@iconify/react';
import {PREVIEW_LAYOUTS, PreviewLayout} from 'common/constants';
import {getDevicesMap} from 'common/deviceList';
import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import useKeyboardShortcut, {
  SHORTCUT_CHANNEL,
} from 'renderer/components/KeyboardShortcutsManager/useKeyboardShortcut';
import Popover from 'renderer/components/Popover';
import Notifications from 'renderer/components/Notifications/Notifications';
import useLocalStorage from 'renderer/components/useLocalStorage/useLocalStorage';
import {selectActiveSuite} from 'renderer/store/features/device-manager';
import {
  canvasZoomIn,
  canvasZoomOut,
  selectCanvasZoom,
  selectLayout,
  selectNotifications,
  selectZoomFactor,
  setLayout,
  zoomIn,
  zoomOut,
} from 'renderer/store/features/renderer';
import {
  selectAnnouncements,
  selectDarkMode,
  setDarkMode,
  setPresenting,
  setWhatsNewSeen,
} from 'renderer/store/features/ui';

// Order, labels and icons per the Hybrid Studio design; FLEX is its "Grid".
const LAYOUTS: Array<{layout: PreviewLayout; label: string; icon: string}> = [
  {layout: PREVIEW_LAYOUTS.FLEX, label: 'Grid', icon: 'lucide:layout-dashboard'},
  {layout: PREVIEW_LAYOUTS.MASONRY, label: 'Masonry', icon: 'bx:bx-grid-alt'},
  {layout: PREVIEW_LAYOUTS.COLUMN, label: 'Column', icon: 'radix-icons:layout'},
  {layout: PREVIEW_LAYOUTS.INDIVIDUAL, label: 'Focus', icon: 'ic:round-fullscreen'},
  {layout: PREVIEW_LAYOUTS.CANVAS, label: 'Canvas', icon: 'lucide:frame'},
];

const StatusBar = () => {
  const dispatch = useDispatch();
  const layout = useSelector(selectLayout);
  const zoomfactor = useSelector(selectZoomFactor);
  const canvasZoom = useSelector(selectCanvasZoom);
  const isCanvas = layout === PREVIEW_LAYOUTS.CANVAS;
  const darkMode = useSelector(selectDarkMode);
  const notifications = useSelector(selectNotifications);
  const activeSuite = useSelector(selectActiveSuite);
  const announcements = useSelector(selectAnnouncements);
  const [hasNewNotifications, setHasNewNotifications] = useLocalStorage(
    'hasNewNotifications',
    true
  );
  // Unread until this release's notes have been seen (bell or launch card) and
  // any live notifications have been read.
  const appVersion = window.responsively.appVersion;
  const hasUnread =
    announcements.seenVersion !== appVersion ||
    ((notifications?.length ?? 0) > 0 && Boolean(hasNewNotifications));

  // In canvas mode the stepper drives the world zoom instead of device scale.
  const onZoomIn = useCallback(
    () => dispatch(isCanvas ? canvasZoomIn() : zoomIn()),
    [dispatch, isCanvas]
  );
  const onZoomOut = useCallback(
    () => dispatch(isCanvas ? canvasZoomOut() : zoomOut()),
    [dispatch, isCanvas]
  );
  const handleTheme = useCallback(() => dispatch(setDarkMode(!darkMode)), [dispatch, darkMode]);

  const toggleNextLayout = useCallback(() => {
    const layouts = Object.values(PREVIEW_LAYOUTS);
    const currentIndex = layouts.findIndex((l) => l === layout);
    dispatch(setLayout(layouts[(currentIndex + 1) % layouts.length]));
  }, [dispatch, layout]);

  useKeyboardShortcut(SHORTCUT_CHANNEL.ZOOM_IN, onZoomIn);
  useKeyboardShortcut(SHORTCUT_CHANNEL.ZOOM_OUT, onZoomOut);
  useKeyboardShortcut(SHORTCUT_CHANNEL.THEME, handleTheme);
  useKeyboardShortcut(SHORTCUT_CHANNEL.PREVIEW_LAYOUT, toggleNextLayout);

  const devicesMap = getDevicesMap();
  const deviceCount = activeSuite.devices.filter((id) => devicesMap[id] != null).length;

  return (
    <div
      data-testid="status-bar"
      className="flex h-[38px] flex-shrink-0 items-center gap-[14px] border-t border-line-soft bg-panel px-3"
    >
      <div className="flex items-center gap-[2px] rounded-lg border border-line p-[2px]">
        {LAYOUTS.map(({layout: value, label, icon}) => (
          <button
            key={value}
            type="button"
            title={`${label} layout`}
            data-testid={`layout-${value}`}
            aria-pressed={layout === value}
            onClick={() => dispatch(setLayout(value))}
            className={`flex h-6 items-center gap-[6px] rounded-md px-[10px] text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
              layout === value ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-hover'
            }`}
          >
            <span className="pointer-events-none contents">
              <Icon icon={icon} fontSize={13} />
              {label}
            </span>
          </button>
        ))}
      </div>

      <span className="truncate text-xs text-muted" data-testid="status-text">
        {deviceCount} {deviceCount === 1 ? 'device' : 'devices'} · {activeSuite.name}
      </span>

      <span className="flex-1" />

      {isCanvas ? (
        <>
          <button
            type="button"
            title="Present"
            data-testid="present-button"
            onClick={() => dispatch(setPresenting(true))}
            className="flex h-[26px] items-center gap-[7px] rounded-[7px] bg-accent px-3 text-xs font-bold text-on-accent transition-[filter] hover:brightness-110 focus:outline-none"
          >
            <span className="pointer-events-none contents">
              <Icon icon="lucide:play" fontSize={12} />
              Present
            </span>
          </button>
          <div className="h-5 w-px bg-line" />
        </>
      ) : null}

      <div className="flex items-center gap-[2px]">
        <button
          type="button"
          title="Zoom out"
          data-testid="zoom-out"
          onClick={onZoomOut}
          className="flex h-6 w-6 items-center justify-center rounded-md text-[15px] text-muted transition-colors hover:bg-hover hover:text-fg focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          <span className="pointer-events-none contents">
            <Icon icon="lucide:minus" />
          </span>
        </button>
        <span
          data-testid="zoom-level"
          className="w-11 text-center font-mono text-xs font-medium text-fg"
        >
          {Math.ceil((isCanvas ? canvasZoom : zoomfactor) * 100)}%
        </span>
        <button
          type="button"
          title="Zoom in"
          data-testid="zoom-in"
          onClick={onZoomIn}
          className="flex h-6 w-6 items-center justify-center rounded-md text-[15px] text-muted transition-colors hover:bg-hover hover:text-fg focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          <span className="pointer-events-none contents">
            <Icon icon="lucide:plus" />
          </span>
        </button>
      </div>

      <div className="h-5 w-px bg-line" />

      <Popover
        triggerTitle="Notifications"
        anchor="top end"
        triggerClassName="relative flex h-[26px] w-[26px] items-center justify-center rounded-md text-[15px] text-muted transition-colors hover:bg-hover hover:text-fg"
        className="w-[260px] p-[14px]"
        onOpenChange={(open) => {
          if (open) {
            setHasNewNotifications(false);
            if (announcements.seenVersion !== appVersion) {
              dispatch(setWhatsNewSeen(appVersion));
            }
          }
        }}
        trigger={
          <span className="pointer-events-none relative inline-flex">
            <Icon icon="carbon:notification" />
            {hasUnread ? (
              <span
                data-testid="bell-unread-dot"
                className="absolute right-[-2px] top-[-2px] h-[7px] w-[7px] rounded-full border-[1.5px] border-panel bg-accent"
              />
            ) : null}
          </span>
        }
      >
        <Notifications />
      </Popover>

      <button
        type="button"
        title="Toggle UI theme"
        data-testid="theme-toggle"
        onClick={handleTheme}
        className="flex h-[26px] w-[26px] items-center justify-center rounded-md text-[15px] text-muted transition-colors hover:bg-hover hover:text-fg focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        <span className="pointer-events-none contents">
          <Icon icon={darkMode ? 'carbon:moon' : 'carbon:sun'} />
        </span>
      </button>
    </div>
  );
};

export default StatusBar;
