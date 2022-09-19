import { useSelector } from 'react-redux';
import { selectDevices } from 'renderer/store/features/device-manager';
import Device from './Device';

const Previewer = () => {
  const devices = useSelector(selectDevices);

  return (
    <div className="flex gap-4 p-4">
      {devices.map(({ height, width, name }, idx) => {
        return (
          <Device
            key={`${height}-${width}`}
            height={height}
            width={width}
            isPrimary={idx === 0}
            name={name}
          />
        );
      })}
    </div>
  );
};

export default Previewer;
