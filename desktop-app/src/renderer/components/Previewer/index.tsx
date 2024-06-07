import { useSelector } from 'react-redux';
import cx from 'classnames';
import { selectActiveSuite } from 'renderer/store/features/device-manager';
import { DOCK_POSITION, PREVIEW_LAYOUTS } from 'common/constants';
import {
  selectDockPosition,
  selectIsDevtoolsOpen,
} from 'renderer/store/features/devtools';
import { getDevicesMap, Device as IDevice } from 'common/deviceList';
import { useState } from 'react';
import { selectLayout } from 'renderer/store/features/renderer';
import Device from './Device';
import DevtoolsResizer from './DevtoolsResizer';
import IndividualLayoutToolbar from './IndividualLayoutToolBar';

const Previewer = () => {
  const activeSuite = useSelector(selectActiveSuite);
  const devices = activeSuite.devices.map((id) => getDevicesMap()[id]);
  const dockPosition = useSelector(selectDockPosition);
  const isDevtoolsOpen = useSelector(selectIsDevtoolsOpen);
  const layout = useSelector(selectLayout);
  const [individualDevice, setIndividualDevice] = useState<IDevice>(devices[0]);

  const isIndividualLayout = layout === PREVIEW_LAYOUTS.INDIVIDUAL;

  return (
    <div className="h-full">
      {isIndividualLayout && (
        <IndividualLayoutToolbar
          individualDevice={individualDevice}
          setIndividualDevice={setIndividualDevice}
          devices={devices}
        />
      )}
      <div
        className={cx('flex h-full', {
          'flex-col': dockPosition === DOCK_POSITION.BOTTOM,
          'flex-row': dockPosition === DOCK_POSITION.RIGHT,
          'justify-between': !isIndividualLayout,
          'justify-center': isIndividualLayout,
        })}
      >
        <div
          className={cx('flex h-full gap-4 overflow-auto p-4', {
            'flex-wrap': layout === PREVIEW_LAYOUTS.FLEX,
            'justify-center': isIndividualLayout,
          })}
        >
          {isIndividualLayout ? (
            <>
              <Device
                key={individualDevice.id}
                device={individualDevice}
                isPrimary
                setIndividualDevice={setIndividualDevice}
              />
            </>
          ) : (
            <>
              {devices.map((device, idx) => (
                <Device
                  key={device.id}
                  device={device}
                  isPrimary={idx === 0}
                  setIndividualDevice={setIndividualDevice}
                />
              ))}
            </>
          )}
        </div>
        {isDevtoolsOpen && dockPosition !== DOCK_POSITION.UNDOCKED ? (
          <DevtoolsResizer />
        ) : null}
      </div>
    </div>
  );
};

export default Previewer;
