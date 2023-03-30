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
import { defaultDevices, Device } from 'common/deviceList';

import Button from '../Button';
import DeviceLabel, { DND_TYPE } from './DeviceLabel';
import DeviceDetailsModal from './DeviceDetailsModal';

const filterDevices = (devices: Device[], filter: string) => {
  const sanitizedFilter = filter.trim().toLowerCase();

  return devices.filter((device: Device) =>
    `${device.name.toLowerCase()}${device.width}x${device.height}`.includes(
      sanitizedFilter
    )
  );
};

const DeviceManager = () => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | undefined>(
    undefined
  );
  const dispatch = useDispatch();
  const devices = useSelector(selectDevices);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredDevices, setFilteredDevices] =
    useState<Device[]>(defaultDevices);
  const [customDevices, setCustomDevices] = useState<Device[]>(
    window.electron.store.get('deviceManager.customDevices')
  );
  const [filteredCustomDevices, setFilteredCustomDevices] =
    useState<Device[]>(customDevices);

  useEffect(() => {
    setFilteredDevices(filterDevices(defaultDevices, searchText));
    setFilteredCustomDevices(filterDevices(customDevices, searchText));
  }, [customDevices, searchText]);

  const moveDevice = (device: Device, atIndex: number) => {
    const newDevices = devices.filter((d) => d.name !== device.name);
    newDevices.splice(atIndex, 0, device);
    dispatch(setDevices(newDevices));
  };

  const [, drop] = useDrop(() => ({ accept: DND_TYPE }));

  const saveCustomDevices = (newCustomDevices: Device[]) => {
    setCustomDevices(newCustomDevices);
    window.electron.store.set('deviceManager.customDevices', newCustomDevices);
    setFilteredCustomDevices(filterDevices(newCustomDevices, searchText));
  };

  const onAddDevice = async (device: Device, isNew: boolean) => {
    const newCustomDevices = isNew
      ? [...customDevices, device]
      : customDevices.map((d) => (d.name === device.name ? device : d));
    saveCustomDevices(newCustomDevices);
    dispatch(
      setDevices(devices.map((d) => (d.name === device.name ? device : d)))
    );
  };

  const onRemoveDevice = (device: Device) => {
    const newCustomDevices = customDevices.filter(
      (d) => d.name !== device.name
    );
    saveCustomDevices(newCustomDevices);
    dispatch(setDevices(devices.filter((d) => d.name !== device.name)));
  };

  const onShowDeviceDetails = (device: Device) => {
    setSelectedDevice(device);
    setIsDetailsModalOpen(true);
  };

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
                onShowDeviceDetails={onShowDeviceDetails}
              />
            );
          })}
        </div>
        <div className="my-4 flex items-center justify-end  ">
          <div className="flex w-fit items-center bg-white px-1 dark:bg-slate-900">
            <Icon icon="ic:outline-search" height={24} />
            <input
              className="w-60 rounded bg-inherit px-2 py-1 focus:outline-none"
              placeholder="Search ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-8 mb-6 flex justify-between">
          <div className="text-lg ">Predefined Devices</div>
        </div>
        <div className="ml-4 flex flex-row flex-wrap gap-4">
          {filteredDevices.map((device) => (
            <DeviceLabel
              device={device}
              key={device.name}
              onShowDeviceDetails={onShowDeviceDetails}
            />
          ))}
          {filteredDevices.length === 0 ? (
            <div className="m-10 flex w-full items-center justify-center">
              Sorry, no matching devices found.
              <Icon icon="mdi:emoticon-sad-outline" className="ml-1" />
            </div>
          ) : null}
        </div>
        <div className="mt-8 mb-6 flex justify-between">
          <div className="text-lg ">Custom Devices</div>
          <Button onClick={() => setIsDetailsModalOpen(true)} isActive>
            <Icon icon="ic:baseline-add" />
            Add Custom Device
          </Button>
        </div>
        <div className="ml-4 flex flex-row flex-wrap gap-4">
          {filteredCustomDevices.map((device) => (
            <DeviceLabel
              device={device}
              key={device.name}
              onShowDeviceDetails={onShowDeviceDetails}
            />
          ))}
          {customDevices.length === 0 ? (
            <div className="m-10 flex w-full items-center justify-center">
              No custom devices added yet!
            </div>
          ) : null}
          {customDevices.length > 0 && filteredCustomDevices.length === 0 ? (
            <div className="m-10 flex w-full items-center justify-center">
              Sorry, no matching devices found.
              <Icon icon="mdi:emoticon-sad-outline" className="ml-1" />
            </div>
          ) : null}
        </div>
      </div>
      <DeviceDetailsModal
        onAddDevice={onAddDevice}
        existingDevices={[...defaultDevices, ...customDevices]}
        isCustom
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setSelectedDevice(undefined);
          setIsDetailsModalOpen(false);
        }}
        device={selectedDevice}
        onRemoveDevice={onRemoveDevice}
      />
    </div>
  );
};

export default () => (
  <DndProvider backend={HTML5Backend}>
    <DeviceManager />
  </DndProvider>
);
