import {RootState} from 'renderer/store';
import {configureStore} from '@reduxjs/toolkit';
import designOverlayReducer, {
  setDesignOverlay,
  removeDesignOverlay,
  selectDesignOverlay,
  selectDesignOverlayEnabled,
  type DesignOverlayState,
} from './index';

const mockStore = {
  get: jest.fn(),
  set: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (window.electron.store.get as jest.Mock) = mockStore.get;
  (window.electron.store.set as jest.Mock) = mockStore.set;
  mockStore.get.mockReturnValue({});
});

describe('designOverlaySlice', () => {
  const createStore = () =>
    configureStore({
      reducer: {
        designOverlay: designOverlayReducer,
      },
    });

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
      mockStore.get.mockReturnValue({
        [resolution]: mockOverlayState,
      });

      store.dispatch(removeDesignOverlay({resolution}));

      expect(mockStore.set).toHaveBeenCalledWith('userPreferences.designOverlays', {});
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
});
