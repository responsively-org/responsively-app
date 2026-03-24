import {configureStore} from '@reduxjs/toolkit';
import {fireEvent, render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import javascriptReducer from 'renderer/store/features/javascript';
import JavaScriptControls from './index';

const activeSuite = {
  id: 'default',
  name: 'Default',
  devices: ['10008', '10013'],
};

vi.mock('renderer/store/features/device-manager', () => ({
  selectActiveSuite: () => activeSuite,
}));

const createStore = () =>
  configureStore({
    reducer: {
      javascript: javascriptReducer,
    },
  });

describe('JavaScriptControls', () => {
  it('disables javascript for all active previews from the global menu', () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <JavaScriptControls />
      </Provider>
    );

    fireEvent.click(screen.getByRole('checkbox'));

    expect(store.getState().javascript.disabledByDeviceId).toEqual({
      '10008': true,
      '10013': true,
    });
  });
});
