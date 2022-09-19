import { Device } from 'common/deviceList';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectDevices,
  setDevices,
} from 'renderer/store/features/device-manager';

interface Props {
  device: Device;
}

const DeviceLabel = ({ device }: Props) => {
  const dispatch = useDispatch();
  const devices = useSelector(selectDevices);
  return (
    <div className="flex">
      <input
        type="checkbox"
        checked={devices.find((d) => d.name === device.name) != null}
        onChange={(e) => {
          if (e.target.checked) {
            dispatch(setDevices([...devices, device]));
          } else {
            dispatch(setDevices(devices.filter((d) => d.name !== device.name)));
          }
        }}
      />

      <div className="ml-1">
        {device.name}
        <span className="ml-1 text-xs">
          {device.width}x{device.height}
        </span>
      </div>
    </div>
  );
};

export default DeviceLabel;
