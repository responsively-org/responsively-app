import { Icon } from '@iconify/react';
import { Device } from 'common/deviceList';
import { useDrag, useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectDevices,
  setDevices,
} from 'renderer/store/features/device-manager';
import Button from '../Button';

export const DND_TYPE = 'Device';

interface Props {
  device: Device;
  enableDnd?: boolean;
  moveDevice?: (device: Device, atIndex: number) => void;
  onShowDeviceDetails: (device: Device) => void;
}

const DeviceLabel = ({
  device,
  moveDevice = () => {},
  enableDnd = false,
  onShowDeviceDetails,
}: Props) => {
  const dispatch = useDispatch();
  const devices = useSelector(selectDevices);

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

  return (
    <div
      className="flex w-fit items-center gap-2 rounded bg-slate-300 px-2 py-1 dark:bg-slate-600"
      ref={enableDnd ? (node) => drag(drop(node)) : null}
      style={{ opacity }}
    >
      {enableDnd ? <Icon icon="ic:baseline-drag-indicator" /> : null}
      <input
        type="checkbox"
        checked={devices.find((d) => d.name === device.name) != null}
        onChange={(e) => {
          if (e.target.checked) {
            dispatch(setDevices([...devices, device]));
          } else {
            dispatch(setDevices(devices.filter((d) => d.name !== device.name)));
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
