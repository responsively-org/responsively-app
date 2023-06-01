import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  selectActiveSuite,
  setDevices,
  setSuiteDevices,
} from 'renderer/store/features/device-manager';
import { APP_VIEWS, setAppView } from 'renderer/store/features/ui';
import { defaultDevices, Device, getDevicesMap } from 'common/deviceList';

import Button from '../Button';
import DeviceLabel from './DeviceLabel';
import DeviceDetailsModal from './DeviceDetailsModal';
import { PreviewSuites } from './PreviewSuites';

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
  const activeSuite = useSelector(selectActiveSuite);
  const devices = activeSuite.devices.map((id) => getDevicesMap()[id]);
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

  const saveCustomDevices = (newCustomDevices: Device[]) => {
    setCustomDevices(newCustomDevices);
    window.electron.store.set('deviceManager.customDevices', newCustomDevices);
    setFilteredCustomDevices(filterDevices(newCustomDevices, searchText));
  };

  const onAddDevice = async (device: Device, isNew: boolean) => {
    const newCustomDevices = isNew
      ? [...customDevices, device]
      : customDevices.map((d) => (d.id === device.id ? device : d));
    saveCustomDevices(newCustomDevices);
    dispatch(
      setSuiteDevices({
        suite: activeSuite.id,
        devices: [...activeSuite.devices, device.id],
      })
    );
  };

  const onRemoveDevice = (device: Device) => {
    const newCustomDevices = customDevices.filter((d) => d.id !== device.id);
    saveCustomDevices(newCustomDevices);
    dispatch(
      setSuiteDevices({
        suite: activeSuite.id,
        devices: activeSuite.devices.filter((d) => d !== device.id),
      })
    );
  };

  const onShowDeviceDetails = (device: Device) => {
    setSelectedDevice(device);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="mx-auto flex w-4/5 flex-col gap-4 rounded-lg p-8">
      <div className="flex w-full text-3xl">
        <span className="w-full text-left">Device Manager</span>
        <Button onClick={() => dispatch(setAppView(APP_VIEWS.BROWSER))}>
          <Icon icon="ic:round-close" />
        </Button>
      </div>
      <div className="">
        <PreviewSuites />
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
              key={device.id}
              onShowDeviceDetails={onShowDeviceDetails}
              disableSelectionControls={
                devices.find((d) => d.id === device.id) != null &&
                devices.length === 1
              }
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
              key={device.id}
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
