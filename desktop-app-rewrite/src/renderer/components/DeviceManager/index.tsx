import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  selectDevices,
  setDevices,
} from 'renderer/store/features/device-manager';
import { APP_VIEWS, setAppView } from 'renderer/store/features/ui';
import defaultDevices, { Device } from 'common/deviceList';

import Button from '../Button';
import DeviceLabel, { DND_TYPE } from './DeviceLabel';

const DeviceManager = () => {
  const dispatch = useDispatch();
  const devices = useSelector(selectDevices);

  const moveDevice = (device: Device, atIndex: number) => {
    const newDevices = devices.filter((d) => d.name !== device.name);
    newDevices.splice(atIndex, 0, device);
    dispatch(setDevices(newDevices));
  };

  const [, drop] = useDrop(() => ({ accept: DND_TYPE }));

  return (
    <div className="mx-16 rounded-lg p-8">
      <div className="flex w-full text-3xl">
        <span className="w-full text-center">Device Manager</span>
        <Button onClick={() => dispatch(setAppView(APP_VIEWS.BROWSER))}>
          <Icon icon="ri:close-circle-line" />
        </Button>
      </div>
      <div>
        <div className="mb-4 text-lg">Devices In Preview</div>

        <div className="ml-4 flex flex-col gap-4" ref={drop}>
          {devices.map((device) => {
            return (
              <DeviceLabel
                key={device.name}
                device={device}
                moveDevice={moveDevice}
                enableDnd
              />
            );
          })}
        </div>
        <div className="mt-8 mb-4 text-lg ">Available Devices</div>
        <div className="ml-4 flex flex-row flex-wrap gap-4">
          {defaultDevices.map((device) => (
            <DeviceLabel device={device} key={device.name} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default () => (
  <DndProvider backend={HTML5Backend}>
    <DeviceManager />
  </DndProvider>
);
