import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '../..';

export interface JavaScriptState {
  disabledByDeviceId: Record<string, boolean>;
}

const initialState: JavaScriptState = {
  disabledByDeviceId: {},
};

export const javascriptSlice = createSlice({
  name: 'javascript',
  initialState,
  reducers: {
    setDeviceJavaScriptDisabled: (
      state,
      action: PayloadAction<{deviceId: string; disabled: boolean}>
    ) => {
      const {deviceId, disabled} = action.payload;

      if (disabled) {
        state.disabledByDeviceId[deviceId] = true;
        return;
      }

      delete state.disabledByDeviceId[deviceId];
    },
    setDevicesJavaScriptDisabled: (
      state,
      action: PayloadAction<{deviceIds: string[]; disabled: boolean}>
    ) => {
      const {deviceIds, disabled} = action.payload;

      deviceIds.forEach((deviceId) => {
        if (disabled) {
          state.disabledByDeviceId[deviceId] = true;
          return;
        }

        delete state.disabledByDeviceId[deviceId];
      });
    },
  },
});

export const {setDeviceJavaScriptDisabled, setDevicesJavaScriptDisabled} = javascriptSlice.actions;

export const selectJavaScriptDisabledByDeviceId = (state: RootState) =>
  state.javascript.disabledByDeviceId;

export default javascriptSlice.reducer;
