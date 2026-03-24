import javascriptReducer, {
  setDeviceJavaScriptDisabled,
  setDevicesJavaScriptDisabled,
  type JavaScriptState,
} from './index';

describe('javascriptSlice', () => {
  it('disables and re-enables javascript for a single device', () => {
    const initialState: JavaScriptState = {
      disabledByDeviceId: {},
    };

    const disabledState = javascriptReducer(
      initialState,
      setDeviceJavaScriptDisabled({deviceId: '10008', disabled: true})
    );

    expect(disabledState.disabledByDeviceId).toEqual({
      '10008': true,
    });

    const enabledState = javascriptReducer(
      disabledState,
      setDeviceJavaScriptDisabled({deviceId: '10008', disabled: false})
    );

    expect(enabledState.disabledByDeviceId).toEqual({});
  });

  it('toggles javascript for multiple devices at once', () => {
    const initialState: JavaScriptState = {
      disabledByDeviceId: {
        '10008': true,
      },
    };

    const disabledState = javascriptReducer(
      initialState,
      setDevicesJavaScriptDisabled({deviceIds: ['10008', '10013'], disabled: true})
    );

    expect(disabledState.disabledByDeviceId).toEqual({
      '10008': true,
      '10013': true,
    });

    const enabledState = javascriptReducer(
      disabledState,
      setDevicesJavaScriptDisabled({deviceIds: ['10008', '10013'], disabled: false})
    );

    expect(enabledState.disabledByDeviceId).toEqual({});
  });
});
