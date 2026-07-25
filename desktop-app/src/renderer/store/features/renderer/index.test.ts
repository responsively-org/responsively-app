import {describe, expect, it} from 'vitest';
import {PREVIEW_LAYOUTS} from 'common/constants';
import reducer, {
  setAddress,
  setIsCapturingScreenshot,
  setIsInspecting,
  setLayout,
  setNotifications,
  setPageTitle,
  setRotate,
  zoomIn,
  zoomOut,
  RendererState,
} from './index';

const baseState = (): RendererState => reducer(undefined, {type: '@@INIT'});

describe('renderer slice', () => {
  it('has pure defaults', () => {
    const state = baseState();
    expect(state.address).toBe('');
    expect(state.zoomFactor).toBe(1);
    expect(state.individualZoomFactor).toBe(1);
    expect(state.layout).toBe(PREVIEW_LAYOUTS.FLEX);
  });

  it('setAddress updates the address', () => {
    const state = reducer(undefined, setAddress('https://other.com/'));
    expect(state.address).toBe('https://other.com/');
  });

  it('zoomIn advances the shared zoom', () => {
    const state = reducer(undefined, zoomIn());
    expect(state.zoomFactor).toBe(1.1);
    expect(state.individualZoomFactor).toBe(1);
  });

  it('zoomIn targets the individual zoom in INDIVIDUAL layout', () => {
    const individual = reducer(undefined, setLayout(PREVIEW_LAYOUTS.INDIVIDUAL));
    const state = reducer(individual, zoomIn());
    expect(state.individualZoomFactor).toBe(1.1);
    expect(state.zoomFactor).toBe(1);
  });

  it('zoomOut at the lowest step does not underflow', () => {
    let state = baseState();
    for (let i = 0; i < 20; i += 1) {
      state = reducer(state, zoomOut());
    }
    expect(state.zoomFactor).toBe(0.25);
  });

  it('setLayout updates the layout', () => {
    const state = reducer(undefined, setLayout(PREVIEW_LAYOUTS.COLUMN));
    expect(state.layout).toBe(PREVIEW_LAYOUTS.COLUMN);
  });

  it('setNotifications appends only unseen notification ids', () => {
    const first = reducer(undefined, setNotifications({id: 'n1', text: 'hello'}));
    const second = reducer(first, setNotifications({id: 'n1', text: 'hello again'}));
    expect(second.notifications).toHaveLength(1);
    expect(second.notifications?.[0].text).toBe('hello');
  });

  it('covers the simple flags', () => {
    let state = reducer(undefined, setRotate(true));
    state = reducer(state, setIsInspecting(true));
    state = reducer(state, setIsCapturingScreenshot(true));
    state = reducer(state, setPageTitle('Title'));
    expect(state.rotate).toBe(true);
    expect(state.isInspecting).toBe(true);
    expect(state.isCapturingScreenshot).toBe(true);
    expect(state.pageTitle).toBe('Title');
  });
});
