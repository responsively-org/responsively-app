import {useSelector} from 'react-redux';
import cx from 'classnames';
import {selectActiveSuite} from 'renderer/store/features/device-manager';
import {DOCK_POSITION, PREVIEW_LAYOUTS} from 'common/constants';
import {selectDockPosition, selectIsDevtoolsOpen} from 'renderer/store/features/devtools';
import {getDevicesMap, Device as IDevice} from 'common/deviceList';
import {useState} from 'react';
import {selectLayout} from 'renderer/store/features/renderer';
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
  const isMasonryLayout = layout === PREVIEW_LAYOUTS.MASONRY;
  // The remembered individual device may have left the suite; fall back to
  // the first device instead of hiding every preview.
  const individualDeviceId = devices.some((d) => d.id === individualDevice?.id)
    ? individualDevice.id
    : devices[0]?.id;

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
        <div className="flex flex-grow overflow-hidden">
          <div className="w-full flex-grow overflow-y-auto" style={{height: '100%'}}>
            {/* One stable host for every layout: devices never unmount on a
                layout switch (a remount reloads the webview). Masonry is CSS
                multi-column (react-masonry-component is unmaintained and
                incompatible with React 19); INDIVIDUAL hides the others. */}
            <div
              className={cx(
                isMasonryLayout ? 'w-full p-2' : 'flex h-full gap-4 overflow-auto p-4',
                {
                  'flex-wrap': layout === PREVIEW_LAYOUTS.FLEX,
                  'justify-center': isIndividualLayout,
                }
              )}
              style={isMasonryLayout ? {columnWidth: 275, columnGap: 0} : undefined}
            >
              {devices.map((device, idx) => (
                <div
                  key={device.id}
                  className={cx({
                    'w-fit break-inside-avoid p-4': isMasonryLayout,
                    hidden: isIndividualLayout && device.id !== individualDeviceId,
                  })}
                >
                  <Device
                    device={device}
                    isPrimary={isIndividualLayout ? device.id === individualDeviceId : idx === 0}
                    setIndividualDevice={setIndividualDevice}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        {isDevtoolsOpen && dockPosition !== DOCK_POSITION.UNDOCKED ? <DevtoolsResizer /> : null}
      </div>
    </div>
  );
};

export default Previewer;
