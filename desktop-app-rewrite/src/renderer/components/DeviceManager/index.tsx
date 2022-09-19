import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { selectDevices } from 'renderer/store/features/device-manager';
import { APP_VIEWS, setAppView } from 'renderer/store/features/ui';
import defaultDevices from 'common/deviceList';

import Button from '../Button';
import DeviceLabel from './DeviceLabel';

const DeviceManager = () => {
  const dispatch = useDispatch();
  const devices = useSelector(selectDevices);

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
        <div className="ml-4 flex flex-col gap-4">
          {devices.map((device) => {
            return (
              <div
                key={device.name}
                className="flex w-fit items-center gap-2 rounded bg-slate-300 px-2 dark:bg-slate-600"
              >
                <Icon icon="ic:baseline-drag-indicator" />
                <DeviceLabel device={device} />
              </div>
            );
          })}
        </div>
        <div className="mt-8 mb-4 text-lg ">Available Devices</div>
        <div className="ml-4 flex flex-row flex-wrap gap-4">
          {defaultDevices.map((device) => (
            <div
              className="flex w-fit items-center gap-2 rounded bg-slate-300 px-2 dark:bg-slate-600"
              key={device.name}
            >
              <DeviceLabel device={device} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeviceManager;
