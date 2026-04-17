import {configureStore} from '@reduxjs/toolkit';
import {render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import javascriptReducer from 'renderer/store/features/javascript';
import Toolbar from './Toolbar';

vi.mock('use-sound', () => ({
  default: () => [vi.fn()],
}));

vi.mock('./ColorBlindnessTools', () => ({
  ColorBlindnessTools: () => null,
}));

vi.mock('./DesignOverlayControls', () => ({
  default: () => null,
}));

const createStore = () =>
  configureStore({
    reducer: {
      javascript: javascriptReducer,
    },
  });

const baseProps = {
  webview: null,
  device: {
    id: '10008',
    name: 'iPhone XR',
    width: 414,
    height: 896,
    userAgent: 'test-agent',
    type: 'phone',
    dpr: 2,
    isTouchCapable: true,
    isMobileCapable: true,
    capabilities: ['touch', 'mobile'],
  },
  setScreenshotInProgress: vi.fn(),
  openDevTools: vi.fn(),
  toggleRuler: vi.fn(),
  onRotate: vi.fn(),
  onIndividualLayoutHandler: vi.fn(),
  isIndividualLayout: false,
  isDeviceRotationEnabled: true,
};

describe('Device Toolbar', () => {
  it('disables screenshot buttons when javascript is disabled for the preview', () => {
    render(
      <Provider store={createStore()}>
        <Toolbar {...baseProps} isJavaScriptDisabled />
      </Provider>
    );

    const disabledButtons = screen.getAllByTitle(
      'Screenshots are unavailable while JavaScript is disabled for this preview'
    );

    expect(disabledButtons).toHaveLength(2);
    disabledButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
