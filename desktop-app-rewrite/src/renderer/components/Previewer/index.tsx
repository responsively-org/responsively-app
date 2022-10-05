import { useSelector } from 'react-redux';
import { selectDevices } from 'renderer/store/features/device-manager';
import { selectIsDevtoolsOpen } from 'renderer/store/features/devtools';
import Device from './Device';
import DevtoolsResizer from './DevtoolsResizer';

const Previewer = () => {
  const devices = useSelector(selectDevices);
  const isDevtoolsOpen = useSelector(selectIsDevtoolsOpen);

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex gap-4 overflow-scroll p-4">
        {devices.map((device, idx) => {
          return (
            <Device key={device.name} device={device} isPrimary={idx === 0} />
          );
        })}
      </div>
      {isDevtoolsOpen ? <DevtoolsResizer /> : null}
    </div>
  );
};

export default Previewer;
