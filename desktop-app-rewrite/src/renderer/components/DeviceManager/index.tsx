import { useEffect, useState } from 'react';
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
  const [searchText, setSearchText] = useState<string>('');
  const [filteredDevices, setFilteredDevices] = useState<Device[]>(devices);

  useEffect(() => {
    setFilteredDevices(
      defaultDevices.filter((device) =>
        `${device.name.toLowerCase()}${device.width}x${device.height}`.includes(
          searchText
        )
      )
    );
  }, [devices, searchText]);

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
          <Icon icon="ic:round-close" />
        </Button>
      </div>
      <div className="mx-auto w-4/5">
        <div className="mb-6 text-lg">Devices In Preview</div>
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
        <div className="mt-8 mb-6 flex justify-between">
          <div className="text-lg ">Available Devices</div>
          <div className="flex w-fit items-center rounded bg-white px-1 dark:bg-slate-900">
            <Icon icon="ic:outline-search" height={24} />
            <input
              className="w-60 rounded bg-inherit px-2 py-1 focus:outline-none"
              placeholder="Search.."
              value={searchText}
              onChange={(e) =>
                setSearchText(e.target.value.trim().toLowerCase())
              }
            />
          </div>
        </div>
        <div className="ml-4 flex flex-row flex-wrap gap-4">
          {filteredDevices.map((device) => (
            <DeviceLabel device={device} key={device.name} />
          ))}
          {filteredDevices.length === 0 ? (
            <div className="m-10 flex w-full items-center justify-center">
              Sorry, no matching devices found.
              <Icon icon="mdi:emoticon-sad-outline" className="ml-1" />
            </div>
          ) : null}
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
