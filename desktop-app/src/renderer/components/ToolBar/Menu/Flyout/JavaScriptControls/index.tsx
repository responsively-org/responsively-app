import {useDispatch, useSelector} from 'react-redux';
import Toggle from 'renderer/components/Toggle';
import {selectActiveSuite} from 'renderer/store/features/device-manager';
import {
  selectJavaScriptDisabledByDeviceId,
  setDevicesJavaScriptDisabled,
} from 'renderer/store/features/javascript';

const JavaScriptControls = () => {
  const dispatch = useDispatch();
  const activeSuite = useSelector(selectActiveSuite);
  const disabledJavaScriptByDeviceId = useSelector(selectJavaScriptDisabledByDeviceId);
  const isEnabledForAllDevices = activeSuite.devices.every(
    (deviceId) => !disabledJavaScriptByDeviceId[deviceId]
  );

  return (
    <div className="flex flex-row items-center justify-start px-4">
      <span className="w-1/2">JavaScript (All Previews)</span>
      <div className="flex items-center gap-2 border-l px-4 dark:border-slate-400">
        <Toggle
          isOn={isEnabledForAllDevices}
          onChange={(value) => {
            dispatch(
              setDevicesJavaScriptDisabled({
                deviceIds: activeSuite.devices,
                disabled: !value.target.checked,
              })
            );
          }}
        />
      </div>
    </div>
  );
};

export default JavaScriptControls;
