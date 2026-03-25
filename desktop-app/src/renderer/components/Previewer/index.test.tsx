import {configureStore} from '@reduxjs/toolkit';
import {act, render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import javascriptReducer, {setDeviceJavaScriptDisabled} from 'renderer/store/features/javascript';
import Previewer from './index';

const activeSuite = {
  id: 'default',
  name: 'Default',
  devices: ['10008'],
};

const mountSpy = vi.hoisted(() => vi.fn());
const unmountSpy = vi.hoisted(() => vi.fn());

vi.mock('common/deviceList', () => ({
  getDevicesMap: () => ({
    '10008': {
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
  }),
}));

vi.mock('./Device', async () => {
  const React = await vi.importActual<typeof import('react')>('react');
  const MockDevice = ({
    device,
    isJavaScriptDisabled,
  }: {
    device: {id: string};
    isJavaScriptDisabled: boolean;
  }) => {
    React.useEffect(() => {
      mountSpy(device.id);

      return () => {
        unmountSpy(device.id);
      };
    }, [device.id]);

    return (
      <div
        data-testid={`device-${device.id}`}
        data-javascript-disabled={String(isJavaScriptDisabled)}
      />
    );
  };

  return {
    default: MockDevice,
  };
});

vi.mock('renderer/store/features/device-manager', () => ({
  selectActiveSuite: () => activeSuite,
}));

vi.mock('renderer/store/features/devtools', () => ({
  selectDockPosition: () => 'RIGHT',
  selectIsDevtoolsOpen: () => false,
}));

vi.mock('renderer/store/features/renderer', async () => {
  const actual = await vi.importActual<typeof import('renderer/store/features/renderer')>(
    'renderer/store/features/renderer'
  );

  return {
    ...actual,
    selectLayout: () => 'COLUMN',
  };
});

vi.mock('./DevtoolsResizer', () => ({
  default: () => null,
}));

vi.mock('./IndividualLayoutToolBar', () => ({
  default: () => null,
}));

const createStore = () =>
  configureStore({
    reducer: {
      javascript: javascriptReducer,
    },
  });

describe('Previewer', () => {
  beforeEach(() => {
    mountSpy.mockClear();
    unmountSpy.mockClear();
  });

  it('keeps the Device mounted when toggling javascript for the same preview', async () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <Previewer />
      </Provider>
    );

    expect(mountSpy).toHaveBeenCalledTimes(1);
    expect(unmountSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId('device-10008')).toHaveAttribute('data-javascript-disabled', 'false');

    await act(async () => {
      store.dispatch(setDeviceJavaScriptDisabled({deviceId: '10008', disabled: true}));
    });

    expect(mountSpy).toHaveBeenCalledTimes(1);
    expect(unmountSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId('device-10008')).toHaveAttribute('data-javascript-disabled', 'true');
  });
});
