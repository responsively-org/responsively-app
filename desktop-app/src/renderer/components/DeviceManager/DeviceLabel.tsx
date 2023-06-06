import { Icon } from '@iconify/react';
import cx from 'classnames';
import { useDrag, useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';

import { Device, getDevicesMap } from 'common/deviceList';
import {
  selectActiveSuite,
  setSuiteDevices,
} from 'renderer/store/features/device-manager';
import Button from '../Button';

export const DND_TYPE = 'Device';

interface Props {
  device: Device;
  enableDnd?: boolean;
  moveDevice?: (device: Device, atIndex: number) => void;
  onShowDeviceDetails: (device: Device) => void;
  hideSelectionControls?: boolean;
  disableSelectionControls?: boolean;
}

const DeviceLabel = ({
  device,
  moveDevice = () => {},
  enableDnd = false,
  onShowDeviceDetails,
  hideSelectionControls = false,
  disableSelectionControls = false,
}: Props) => {
  const dispatch = useDispatch();
  const activeSuite = useSelector(selectActiveSuite);
  const devices = activeSuite.devices.map((id) => getDevicesMap()[id]);
  const originalIndex = devices.indexOf(device);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DND_TYPE,
      item: device,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (draggedDevice, monitor) => {
        const didDrop = monitor.didDrop();
        if (!didDrop) {
          moveDevice(draggedDevice, originalIndex);
        }
      },
    }),
    [device.name, originalIndex, moveDevice]
  );

  const [, drop] = useDrop(
    () => ({
      accept: DND_TYPE,
      hover(draggedDevice: Device) {
        if (draggedDevice.name !== device.name) {
          moveDevice(draggedDevice, devices.indexOf(device));
        }
      },
    }),
    [moveDevice]
  );

  const opacity = isDragging ? 0 : 1;
  const isChecked = devices.find((d) => d.name === device.name) != null;

  return (
    <div
      className="flex w-fit items-center gap-2 rounded bg-slate-300 px-2 py-1 dark:bg-slate-600"
      ref={enableDnd ? (node) => drag(drop(node)) : null}
      style={{ opacity }}
    >
      {enableDnd ? <Icon icon="ic:baseline-drag-indicator" /> : null}
      <input
        className={cx({
          'pointer-events-none opacity-0': hideSelectionControls,
        })}
        type="checkbox"
        disabled={disableSelectionControls}
        title={
          // eslint-disable-next-line no-nested-ternary
          disableSelectionControls
            ? 'Cannot make the suite empty add another device to remove this one'
            : isChecked
            ? 'Click to remove the device'
            : 'Click to add the device'
        }
        checked={isChecked}
        onChange={(e) => {
          if (e.target.checked) {
            dispatch(
              setSuiteDevices({
                suite: activeSuite.id,
                devices: [...activeSuite.devices, device.id],
              })
            );
          } else {
            dispatch(
              setSuiteDevices({
                suite: activeSuite.id,
                devices: activeSuite.devices.filter((d) => d !== device.id),
              })
            );
          }
        }}
      />

      <div className="ml-1">
        {device.name}
        <span className="ml-1 text-xs">
          {device.width}x{device.height}
        </span>
      </div>
      <Button onClick={() => onShowDeviceDetails(device)}>
        <Icon
          icon={device.isCustom ? 'ic:baseline-edit' : 'ic:baseline-info'}
        />
      </Button>
    </div>
  );
};

export default DeviceLabel;
