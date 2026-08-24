import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';

export function calculateVisibleItemCount(
  containerWidth: number,
  itemCount: number,
  itemWidth: number,
  gap: number
): number {
  if (containerWidth <= 0 || itemWidth <= 0 || itemCount <= 0) {
    return itemCount;
  }

  const totalWidth = itemCount * itemWidth + (itemCount - 1) * gap;
  if (totalWidth <= containerWidth) {
    return itemCount;
  }

  // Not everything fits, so reserve room for the overflow trigger (same size as a regular item).
  const budget = containerWidth - itemWidth - gap;

  let usedWidth = 0;
  let fitCount = 0;
  for (let i = 0; i < itemCount; i += 1) {
    const nextWidth = usedWidth + (i === 0 ? 0 : gap) + itemWidth;
    if (nextWidth > budget) {
      break;
    }
    usedWidth = nextWidth;
    fitCount += 1;
  }
  return fitCount;
}

/**
 * Measures the toolbar container and its first item to figure out how many
 * same-sized items fit before overflowing, re-measuring on container resize.
 */
export function useResponsiveToolbarItems(itemCount: number, gap: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(itemCount);

  const recalculate = useCallback(() => {
    const container = containerRef.current;
    const itemWidth = firstItemRef.current?.offsetWidth ?? 0;
    if (!container || itemWidth === 0) {
      return;
    }
    setVisibleCount(calculateVisibleItemCount(container.clientWidth, itemCount, itemWidth, gap));
  }, [itemCount, gap]);

  useLayoutEffect(() => {
    recalculate();
  }, [recalculate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }
    const observer = new ResizeObserver(() => recalculate());
    observer.observe(container);
    return () => observer.disconnect();
  }, [recalculate]);

  return {containerRef, firstItemRef, visibleCount};
}
