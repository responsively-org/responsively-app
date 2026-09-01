import {RootState, createAppStore} from 'renderer/store';
import {type Mock} from 'vitest';
import reducer, {
  overlayModeOf,
  setDesignOverlay,
  setOverlayImage,
  setOverlayMode,
  setOverlayOpacity,
  toggleDesignOverlay,
  removeDesignOverlay,
  selectDesignOverlay,
  selectDesignOverlayEnabled,
  type DesignOverlayState,
} from './index';

const mockStore = {
  get: vi.fn(),
  set: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  (window.electron.store.get as Mock) = mockStore.get;
  (window.electron.store.set as Mock) = mockStore.set;
  mockStore.get.mockReturnValue({});
});

describe('designOverlaySlice', () => {
  // The app store factory includes the persistence listener middleware, so
  // these tests cover the real persistence path.
  const createStore = () => createAppStore();

  const mockOverlayState: DesignOverlayState = {
    image:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    opacity: 50,
    position: 'overlay',
    enabled: true,
  };

  const resolution = '390x844';

  describe('setDesignOverlay', () => {
    it('should add a new overlay to the state', () => {
      const store = createStore();
      store.dispatch(
        setDesignOverlay({
          resolution,
          overlayState: mockOverlayState,
        })
      );

      const state = store.getState();
      expect(state.designOverlay[resolution]).toEqual(mockOverlayState);
    });

    it('should persist overlay to electron store', () => {
      const store = createStore();
      store.dispatch(
        setDesignOverlay({
          resolution,
          overlayState: mockOverlayState,
        })
      );

      expect(mockStore.set).toHaveBeenCalledWith(
        'userPreferences.designOverlays',
        expect.objectContaining({
          [resolution]: mockOverlayState,
        })
      );
    });

    it('should update existing overlay', () => {
      const store = createStore();
      const updatedState = {...mockOverlayState, opacity: 75};

      store.dispatch(
        setDesignOverlay({
          resolution,
          overlayState: mockOverlayState,
        })
      );

      store.dispatch(
        setDesignOverlay({
          resolution,
          overlayState: updatedState,
        })
      );

      const state = store.getState();
      expect(state.designOverlay[resolution].opacity).toBe(75);
    });
  });

  describe('removeDesignOverlay', () => {
    it('should remove overlay from state', () => {
      const store = createStore();
      store.dispatch(
        setDesignOverlay({
          resolution,
          overlayState: mockOverlayState,
        })
      );

      store.dispatch(removeDesignOverlay({resolution}));

      const state = store.getState();
      expect(state.designOverlay[resolution]).toBeUndefined();
    });

    it('should remove overlay from electron store', () => {
      const store = createStore();
      store.dispatch(setDesignOverlay({resolution, overlayState: mockOverlayState}));

      store.dispatch(removeDesignOverlay({resolution}));

      expect(mockStore.set).toHaveBeenLastCalledWith('userPreferences.designOverlays', {});
    });
  });

  describe('selectDesignOverlay', () => {
    it('should return overlay for existing resolution', () => {
      const store = createStore();
      store.dispatch(
        setDesignOverlay({
          resolution,
          overlayState: mockOverlayState,
        })
      );

      const state = store.getState() as RootState;
      const selector = selectDesignOverlay(state);
      const overlay = selector(resolution);

      expect(overlay).toEqual(mockOverlayState);
    });

    it('should return undefined for non-existent resolution', () => {
      const store = createStore();
      const state = store.getState() as RootState;
      const selector = selectDesignOverlay(state);
      const overlay = selector('999x999');

      expect(overlay).toBeUndefined();
    });
  });

  describe('selectDesignOverlayEnabled', () => {
    it('should return true when overlay is enabled', () => {
      const store = createStore();
      store.dispatch(
        setDesignOverlay({
          resolution,
          overlayState: mockOverlayState,
        })
      );

      const state = store.getState() as RootState;
      const selector = selectDesignOverlayEnabled(state);
      const enabled = selector(resolution);

      expect(enabled).toBe(true);
    });

    it('should return false when overlay is disabled', () => {
      const store = createStore();
      store.dispatch(
        setDesignOverlay({
          resolution,
          overlayState: {...mockOverlayState, enabled: false},
        })
      );

      const state = store.getState() as RootState;
      const selector = selectDesignOverlayEnabled(state);
      const enabled = selector(resolution);

      expect(enabled).toBe(false);
    });

    it('should return false when overlay does not exist', () => {
      const store = createStore();
      const state = store.getState() as RootState;
      const selector = selectDesignOverlayEnabled(state);
      const enabled = selector('999x999');

      expect(enabled).toBe(false);
    });
  });

  it('toggleDesignOverlay starts a grid overlay and flips enabled after', () => {
    let state = reducer(undefined, toggleDesignOverlay({resolution: '390x844'}));
    expect(state['390x844']).toEqual({
      image: '',
      opacity: 50,
      position: 'overlay',
      enabled: true,
      mode: 'grid',
    });

    state = reducer(state, toggleDesignOverlay({resolution: '390x844'}));
    expect(state['390x844'].enabled).toBe(false);
  });

  it('setOverlayMode and setOverlayOpacity update an existing overlay only', () => {
    let state = reducer(undefined, setOverlayMode({resolution: 'ghost', mode: 'image'}));
    expect(state).toEqual({});

    state = reducer(state, toggleDesignOverlay({resolution: '390x844'}));
    state = reducer(state, setOverlayMode({resolution: '390x844', mode: 'image'}));
    state = reducer(state, setOverlayOpacity({resolution: '390x844', opacity: 80}));
    expect(state['390x844'].mode).toBe('image');
    expect(state['390x844'].opacity).toBe(80);
  });

  it('overlayModeOf treats legacy image overlays as image mode', () => {
    expect(
      overlayModeOf({
        image: 'data:image/png;base64,x',
        opacity: 50,
        position: 'overlay',
        enabled: true,
      })
    ).toBe('image');
    expect(overlayModeOf({image: '', opacity: 50, position: 'overlay', enabled: true})).toBe(
      'grid'
    );
    expect(
      overlayModeOf({
        image: 'data:image/png;base64,x',
        opacity: 50,
        position: 'overlay',
        enabled: true,
        mode: 'grid',
      })
    ).toBe('grid');
  });

  it('setOverlayImage stores the image and switches to image mode', () => {
    // Fresh resolution: creates an enabled image overlay.
    let state = reducer(
      undefined,
      setOverlayImage({resolution: '390x844', image: 'data:image/png;base64,a', fileName: 'a.png'})
    );
    expect(state['390x844']).toEqual({
      image: 'data:image/png;base64,a',
      fileName: 'a.png',
      opacity: 50,
      position: 'overlay',
      enabled: true,
      mode: 'image',
    });

    // Existing grid overlay: keeps opacity, swaps image + mode.
    state = reducer(state, toggleDesignOverlay({resolution: '800x600'}));
    state = reducer(state, setOverlayOpacity({resolution: '800x600', opacity: 70}));
    state = reducer(
      state,
      setOverlayImage({resolution: '800x600', image: 'data:image/png;base64,b', fileName: 'b.png'})
    );
    expect(state['800x600'].mode).toBe('image');
    expect(state['800x600'].image).toBe('data:image/png;base64,b');
    expect(state['800x600'].opacity).toBe(70);
    expect(state['800x600'].enabled).toBe(true);
  });
});
