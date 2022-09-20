import { useSelector } from 'react-redux';
import { selectDevices } from 'renderer/store/features/device-manager';
import Device from './Device';

const Previewer = () => {
  const devices = useSelector(selectDevices);

  return (
    <div className="flex gap-4 p-4">
      {devices.map((device, idx) => {
        return (
          <Device key={device.name} device={device} isPrimary={idx === 0} />
        );
      })}
    </div>
  );
};

export default Previewer;
