import { useSelector } from 'react-redux';
import cx from 'classnames';
import { selectDevices } from 'renderer/store/features/device-manager';
import { DOCK_POSITION } from 'common/constants';
import {
  selectDockPosition,
  selectIsDevtoolsOpen,
} from 'renderer/store/features/devtools';
import Device from './Device';
import DevtoolsResizer from './DevtoolsResizer';

const Previewer = () => {
  const devices = useSelector(selectDevices);
  const dockPosition = useSelector(selectDockPosition);
  const isDevtoolsOpen = useSelector(selectIsDevtoolsOpen);

  return (
    <div
      className={cx('flex h-full justify-between', {
        'flex-col': dockPosition === DOCK_POSITION.BOTTOM,
        'flex-row': dockPosition === DOCK_POSITION.RIGHT,
      })}
    >
      <div className="flex gap-4 overflow-scroll p-4">
        {devices.map((device, idx) => {
          return (
            <Device key={device.name} device={device} isPrimary={idx === 0} />
          );
        })}
      </div>
      {isDevtoolsOpen && dockPosition !== DOCK_POSITION.UNDOCKED ? (
        <DevtoolsResizer />
      ) : null}
    </div>
  );
};

export default Previewer;
