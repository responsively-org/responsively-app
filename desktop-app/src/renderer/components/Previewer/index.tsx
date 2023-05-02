import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import { selectActiveSuite } from 'renderer/store/features/device-manager';
import { DOCK_POSITION, PREVIEW_LAYOUTS } from 'common/constants';
import {
  selectDockPosition,
  selectIsDevtoolsOpen,
} from 'renderer/store/features/devtools';
import { selectLayout, setRotate } from 'renderer/store/features/renderer';
import { getDevicesMap } from 'common/deviceList';
import Device from './Device';
import DevtoolsResizer from './DevtoolsResizer';
import { useEffect } from 'react';

const Previewer = () => {
  const activeSuite = useSelector(selectActiveSuite);
  const devices = activeSuite.devices.map((id) => getDevicesMap()[id]);
  const dockPosition = useSelector(selectDockPosition);
  const isDevtoolsOpen = useSelector(selectIsDevtoolsOpen);
  const layout = useSelector(selectLayout);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setRotate(devices.reduce((acc, device) => ({ ...acc, [device.name]: { inSingle: false, rotate: false } }), {})));
  }, []);

  return (
    <div className="h-full">
      <div
        className={cx('flex h-full justify-between', {
          'flex-col': dockPosition === DOCK_POSITION.BOTTOM,
          'flex-row': dockPosition === DOCK_POSITION.RIGHT,
        })}
      >
        <div
          className={cx('flex h-full gap-4 overflow-auto p-4', {
            'flex-wrap': layout === PREVIEW_LAYOUTS.FLEX,
          })}
        >
          {devices.map((device, idx) => {
            return (
              <Device
                id={device.name}
                key={device.name}
                device={device}
                isPrimary={idx === 0}
              />
            );
          })}
        </div>
        {isDevtoolsOpen && dockPosition !== DOCK_POSITION.UNDOCKED ? (
          <DevtoolsResizer />
        ) : null}
      </div>
    </div>
  );
};

export default Previewer;
