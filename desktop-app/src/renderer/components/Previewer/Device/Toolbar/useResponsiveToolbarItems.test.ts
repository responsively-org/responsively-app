import {calculateVisibleItemCount} from './useResponsiveToolbarItems';

describe('calculateVisibleItemCount', () => {
  it('returns all items when everything fits within the container', () => {
    expect(calculateVisibleItemCount(400, 10, 28, 4)).toBe(10);
  });

  it('returns all items when the container width exactly matches the required width', () => {
    // 5 items * 28 + 4 gaps * 4 = 140 + 16 = 156
    expect(calculateVisibleItemCount(156, 5, 28, 4)).toBe(5);
  });

  it('reserves room for the overflow trigger when not everything fits', () => {
    // 10 items don't fit in 200px, so some must move to the overflow trigger.
    const visibleCount = calculateVisibleItemCount(200, 10, 28, 4);
    expect(visibleCount).toBeLessThan(10);
    expect(visibleCount).toBeGreaterThan(0);
  });

  it('never returns more items than would fit alongside the overflow trigger', () => {
    const containerWidth = 200;
    const itemWidth = 28;
    const gap = 4;
    const visibleCount = calculateVisibleItemCount(containerWidth, 10, itemWidth, gap);

    const visibleWidth = visibleCount * itemWidth + Math.max(visibleCount - 1, 0) * gap;
    const withTriggerWidth = visibleWidth + gap + itemWidth;
    expect(withTriggerWidth).toBeLessThanOrEqual(containerWidth);
  });

  it('returns 0 when even a single item cannot fit alongside the overflow trigger', () => {
    expect(calculateVisibleItemCount(30, 10, 28, 4)).toBe(0);
  });

  it('falls back to returning all items when the container has not been measured yet', () => {
    expect(calculateVisibleItemCount(0, 6, 28, 4)).toBe(6);
  });

  it('falls back to returning all items when the item width is unknown', () => {
    expect(calculateVisibleItemCount(300, 6, 0, 4)).toBe(6);
  });

  it('returns 0 for an empty item list', () => {
    expect(calculateVisibleItemCount(300, 0, 28, 4)).toBe(0);
  });
});
