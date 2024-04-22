import { Icon } from '@iconify/react';
import cx from 'classnames';
import { Device, getDevicesMap } from 'common/deviceList';
import { useDrop } from 'react-dnd';
import { useDispatch } from 'react-redux';
import Button from 'renderer/components/Button';
import {
  PreviewSuite,
  deleteSuite,
  setActiveSuite,
  setSuiteDevices,
} from 'renderer/store/features/device-manager';
import DeviceLabel, { DND_TYPE } from '../DeviceLabel';

interface Props {
  suite: PreviewSuite;
  isActive: boolean;
}

export const Suite = ({ suite: { id, name, devices }, isActive }: Props) => {
  const [, drop] = useDrop(() => ({ accept: DND_TYPE }));
  const dispatch = useDispatch();

  const moveDevice = (device: Device, atIndex: number) => {
    const newDevices = devices.filter((d) => d !== device.id);
    newDevices.splice(atIndex, 0, device.id);
    dispatch(setSuiteDevices({ suite: id, devices: newDevices }));
  };
  return (
    <div
      className={cx(
        'relative min-w-56 flex-shrink-0  rounded bg-white dark:bg-slate-900',
        {
          'border-2 border-slate-500 ': isActive,
        }
      )}
    >
      {!isActive ? (
        <div className="absolute flex h-full w-full items-center justify-center bg-gray-100 !bg-opacity-70 dark:bg-slate-800">
          <Button
            className="aspect-square w-16 rounded-full hover:!bg-slate-500"
            onClick={() => dispatch(setActiveSuite(id))}
          >
            <Icon icon="mdi:eye-settings-outline" fontSize={20} />
          </Button>
        </div>
      ) : null}
      <div className="flex flex-col gap-8 p-4 pb-8">
        <div className="flex justify-between">
          <p className="text-lg">{name}</p>
          {id !== 'default' ? (
            <Button onClick={() => dispatch(deleteSuite(id))}>
              <Icon icon="ic:twotone-delete" />
            </Button>
          ) : null}
        </div>
        <div className="flex flex-col gap-2" ref={drop}>
          {devices.map((deviceId) => (
            <DeviceLabel
              device={getDevicesMap()[deviceId]}
              onShowDeviceDetails={() => {}}
              hideSelectionControls={!isActive}
              disableSelectionControls={devices.length === 1}
              enableDnd={isActive}
              key={deviceId}
              moveDevice={moveDevice}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
