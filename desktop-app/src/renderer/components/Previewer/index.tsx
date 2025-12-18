import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import { selectActiveSuite } from 'renderer/store/features/device-manager';
import { DOCK_POSITION, PREVIEW_LAYOUTS } from 'common/constants';
import {
  selectDockPosition,
  selectIsDevtoolsOpen,
} from 'renderer/store/features/devtools';
import { getDevicesMap, Device as IDevice } from 'common/deviceList';
import { useEffect, useMemo, useState } from 'react';
import { selectLayout } from 'renderer/store/features/renderer';
import Masonry from 'react-masonry-component';
import { syncDeviceRotations } from 'renderer/store/features/device-orientation';
import Device from './Device';
import DevtoolsResizer from './DevtoolsResizer';
import IndividualLayoutToolbar from './IndividualLayoutToolBar';

interface MasonryProps {
  options?: {
    transitionDuration: number;
    itemSelector?: string;
    gutter?: number;
    fitWidth?: boolean;
    horizontalOrder?: boolean;
  };
  className?: string;
  elementType?: string;
  children: React.ReactNode;
}

const TypedMasonry = Masonry as React.ComponentType<MasonryProps>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TypedMasonry: React.FC<MasonryProps> = Masonry as any;

const Previewer = () => {
  const dispatch = useDispatch();
  const activeSuite = useSelector(selectActiveSuite);
  const activeDeviceIds = activeSuite.devices;
  const devices = useMemo(
    () => activeDeviceIds.map((id) => getDevicesMap()[id]),
    [activeDeviceIds]
  );
  const dockPosition = useSelector(selectDockPosition);
  const isDevtoolsOpen = useSelector(selectIsDevtoolsOpen);
  const layout = useSelector(selectLayout);
  const [individualDevice, setIndividualDevice] = useState<IDevice>(devices[0]);
  const isIndividualLayout = layout === PREVIEW_LAYOUTS.INDIVIDUAL;
  const isMasonryLayout = layout === PREVIEW_LAYOUTS.MASONRY; // New state for Masonry layout

  useEffect(() => {
    dispatch(syncDeviceRotations(activeDeviceIds));
  }, [dispatch, activeDeviceIds]);

  const masonryOptions = {
    columnWidth: 275,
    gutter: 0,
    fitWidth: true,
    transitionDuration: 0,
  };

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
          className="flex flex flex-grow flex-col"
          style={{ minHeight: 0, overflow: 'hidden' }}
        >
          <div
            className="flex w-full flex-grow flex-col"
            style={{
              height: '100%',
              minHeight: 0,
              overflow: 'hidden',
              paddingBottom: '40px' /* 스크롤바 높이만큼 공간 확보 */,
              boxSizing: 'border-box',
            }}
          >
            {isMasonryLayout ? (
              <div
                className="flex-1 overflow-y-auto overflow-x-hidden"
                style={{ minHeight: 0 }}
              >
                <TypedMasonry
                  options={masonryOptions}
                  className="w-full gap-4 p-2"
                >
                  {devices.map((device) => (
                    <div key={device.id} className="device-item p-4">
                      <Device
                        device={device}
                        isPrimary={device.id === devices[0].id}
                        setIndividualDevice={setIndividualDevice}
                      />
                    </div>
                  ))}
                </TypedMasonry>
              </div>
            ) : (
              <div
                className={cx('horizontal-scrollbar flex flex-1 gap-4', {
                  'flex-wrap': layout === PREVIEW_LAYOUTS.FLEX,
                  'justify-center': isIndividualLayout,
                })}
                style={{
                  overflowX:
                    layout === PREVIEW_LAYOUTS.FLEX ? 'visible' : 'scroll',
                  overflowY: 'auto',
                  padding: '16px',
                  boxSizing: 'border-box',
                  minHeight: 0,
                  height: '100%',
                  maxHeight: '100%',
                  display: 'flex',
                  position: 'relative',
                }}
              >
                {isIndividualLayout ? (
                  <Device
                    key={individualDevice.id}
                    device={individualDevice}
                    isPrimary
                    setIndividualDevice={setIndividualDevice}
                  />
                ) : (
                  devices.map((device, idx) => (
                    <Device
                      key={device.id}
                      device={device}
                      isPrimary={idx === 0}
                      setIndividualDevice={setIndividualDevice}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        {isDevtoolsOpen && dockPosition !== DOCK_POSITION.UNDOCKED ? (
          <DevtoolsResizer />
        ) : null}
      </div>
    </div>
  );
};

export default Previewer;
