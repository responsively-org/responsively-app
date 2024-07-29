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
import { ManageSuitesTool } from './PreviewSuites/ManageSuitesTool/ManageSuitesTool';
import { Divider } from '../Divider';
import { AccordionItem, Accordion } from '../Accordion';

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
  const devices = activeSuite.devices?.map((id) => getDevicesMap()[id]);
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

  const onSaveDevice = async (device: Device, isNew: boolean) => {
    const newCustomDevices = isNew
      ? [...customDevices, device]
      : customDevices.map((d) => (d.id === device.id ? device : d));
    saveCustomDevices(newCustomDevices);
    if (isNew) {
      dispatch(
        setSuiteDevices({
          suite: activeSuite.id,
          devices: [...activeSuite.devices, device.id],
        })
      );
    }
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
      <div className="flex w-full justify-end text-3xl">
        <Button onClick={() => dispatch(setAppView(APP_VIEWS.BROWSER))}>
          <Icon icon="ic:round-close" fontSize={18} />
        </Button>
      </div>
      <div>
        <div className="flex items-center justify-end justify-between ">
          <h2 className="text-2xl font-bold">Device Manager</h2>
          <ManageSuitesTool setCustomDevicesState={setCustomDevices} />
        </div>
        <Divider />
        <Accordion>
          <AccordionItem title="MANAGE SUITES">
            <PreviewSuites />
          </AccordionItem>
        </Accordion>
        <Divider />
        <div className="my-4 flex items-start justify-end justify-between">
          <div className="flex w-fit flex-col items-start px-1">
            <h2 className="text-2xl font-bold">Manage Devices</h2>
          </div>
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
        <Accordion>
          <>
            <AccordionItem title="DEFAULT DEVICES">
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
            </AccordionItem>
            <AccordionItem title="CUSTOM DEVICES">
              <div className="ml-4 flex flex-row flex-wrap gap-4">
                {filteredCustomDevices.map((device) => (
                  <DeviceLabel
                    device={device}
                    key={device.id}
                    onShowDeviceDetails={onShowDeviceDetails}
                  />
                ))}
                {customDevices.length === 0 ? (
                  <div className="m-10 flex w-full flex-col items-center justify-center">
                    <span>No custom devices added yet!</span>
                    <Button
                      className="m-4 rounded-l"
                      onClick={() => setIsDetailsModalOpen(true)}
                      isActive
                    >
                      <Icon icon="ic:baseline-add" />
                      <span className="pr-2 pl-2">Add Custom Device</span>
                    </Button>
                  </div>
                ) : null}
                {customDevices.length > 0 &&
                filteredCustomDevices.length === 0 ? (
                  <div className="m-10 flex w-full items-center justify-center">
                    Sorry, no matching devices found.
                    <Icon icon="mdi:emoticon-sad-outline" className="ml-1" />
                  </div>
                ) : null}
                <Button
                  className={
                    customDevices.length < 1 || filteredCustomDevices.length < 1
                      ? 'hidden'
                      : 'rounded-l'
                  }
                  onClick={() => setIsDetailsModalOpen(true)}
                  isActive
                >
                  <Icon icon="ic:baseline-add" />
                  <span className="pr-2 pl-2">Add Custom Device</span>
                </Button>
              </div>
            </AccordionItem>
          </>
        </Accordion>
      </div>
      <DeviceDetailsModal
        onSaveDevice={onSaveDevice}
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
