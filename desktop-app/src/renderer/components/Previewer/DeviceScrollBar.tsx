import {useRef, useEffect, useState, RefObject, useCallback} from 'react';
import cx from 'classnames';
import {Icon} from '@iconify/react';
import {Device as IDevice} from 'common/deviceList';

interface Props {
  devices: IDevice[];
  scrollContainerRef: RefObject<HTMLDivElement>;
  isVertical?: boolean;
}

const MINI_MAX_H = 40;
const MINI_MAX_W = 64;
const VISIBLE_THRESHOLD = 0.3;

const getMiniDims = (device: IDevice) => {
  const r = device.width / device.height;
  if (r >= MINI_MAX_W / MINI_MAX_H) return {w: MINI_MAX_W, h: Math.round(MINI_MAX_W / r)};
  return {w: Math.round(MINI_MAX_H * r), h: MINI_MAX_H};
};

const DeviceScrollBar = ({devices, scrollContainerRef, isVertical = false}: Props) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set([0]));
  const carouselRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dragStart = useRef<{x: number; scrollLeft: number} | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return undefined;

    const els = Array.from(container.querySelectorAll('[data-device-id]'));
    if (!els.length) return undefined;

    const ratios = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratios.set(e.target, e.intersectionRatio));

        const visible = new Set<number>();
        els.forEach((el, i) => {
          if ((ratios.get(el) ?? 0) >= VISIBLE_THRESHOLD) visible.add(i);
        });
        if (visible.size === 0) {
          let maxR = -1;
          let idx = 0;
          els.forEach((el, i) => {
            const r = ratios.get(el) ?? 0;
            if (r > maxR) {
              maxR = r;
              idx = i;
            }
          });
          visible.add(idx);
        }
        setActiveIndices(visible);
      },
      {root: container, threshold: Array.from({length: 21}, (_, i) => i / 20)}
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [devices, scrollContainerRef]);

  useEffect(() => {
    if (!isOpen) return;
    const firstActive = Math.min(...Array.from(activeIndices));
    if (firstActive !== Infinity) {
      thumbRefs.current[firstActive]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeIndices, isOpen]);

  const scrollToDevice = (index: number) => {
    scrollContainerRef.current
      ?.querySelector(`[data-device-id="${devices[index].id}"]`)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: isVertical ? 'start' : 'nearest',
        inline: isVertical ? 'nearest' : 'start',
      });
  };

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;
      dragStart.current = {x: e.clientX, scrollLeft: container.scrollLeft};
      e.preventDefault();
    },
    [scrollContainerRef]
  );

  useEffect(() => {
    if (isVertical) return;
    const onMove = (e: MouseEvent) => {
      if (!dragStart.current) return;
      const container = scrollContainerRef.current;
      if (!container) return;
      const delta = e.clientX - dragStart.current.x;
      const max = container.scrollWidth - container.clientWidth;
      container.scrollLeft = Math.max(0, Math.min(max, dragStart.current.scrollLeft - delta));
    };
    const onUp = () => {
      dragStart.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [scrollContainerRef, isVertical]);

  if (devices.length <= 1) return null;

  return (
    <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-50 flex flex-col items-center">
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="pointer-events-auto flex items-center gap-2 rounded-t-2xl border border-b-0 border-slate-200 bg-white px-5 py-1.5 text-xs text-slate-500 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-colors hover:text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] dark:hover:text-slate-200"
      >
        <div className="flex flex-col gap-[3px]">
          <div className="h-[2px] w-4 rounded-full bg-current" />
          <div className="h-[2px] w-4 rounded-full bg-current" />
        </div>
        <span className="font-medium">{devices.length} devices</span>
        <Icon icon={isOpen ? 'mdi:chevron-down' : 'mdi:chevron-up'} height={14} />
      </button>

      <div
        className={cx(
          'pointer-events-auto w-full overflow-hidden border border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-slate-700 dark:bg-slate-900',
          'shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)]',
          isOpen ? 'max-h-36 opacity-100' : 'max-h-0 border-0 opacity-0'
        )}
      >
        <div
          ref={carouselRef}
          role="presentation"
          className="flex select-none gap-1 overflow-x-auto px-3 py-2 [&::-webkit-scrollbar]:hidden"
          style={{scrollbarWidth: 'none', cursor: isVertical ? 'default' : 'grab'}}
          onMouseDown={isVertical ? undefined : onDragStart}
        >
          {devices.map((device, idx) => {
            const {w, h} = getMiniDims(device);
            const isActive = activeIndices.has(idx);

            return (
              <button
                key={device.id}
                ref={(el) => {
                  thumbRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => scrollToDevice(idx)}
                className={cx(
                  'group flex flex-shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200 focus:outline-none',
                  isActive
                    ? 'bg-slate-300/50 dark:bg-slate-600/40'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                <div
                  className="flex items-end justify-center"
                  style={{height: MINI_MAX_H, width: MINI_MAX_W}}
                >
                  <div
                    style={{width: w, height: h}}
                    className={cx(
                      'rounded-sm border-2 transition-colors duration-200',
                      isActive
                        ? 'border-slate-400 bg-slate-300/20 dark:border-slate-500 dark:bg-slate-500/10'
                        : 'border-slate-300 group-hover:border-slate-400 dark:border-slate-600 dark:group-hover:border-slate-500'
                    )}
                  />
                </div>
                <span
                  className={cx(
                    'max-w-[72px] truncate text-[10px] font-medium transition-colors duration-200',
                    isActive
                      ? 'text-slate-800 dark:text-slate-100'
                      : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300'
                  )}
                >
                  {device.name}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-600">
                  {device.width}×{device.height}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DeviceScrollBar;
