import Store from 'electron-store';
import { randomUUID } from 'crypto';

import { defaultDevices, Device } from '../common/deviceList';

const defaultActiveDevices = ['10008', '10013', '10015'];

export const migrations = {
  '1.2.0': (store: Store) => {
    try {
      // eslint-disable-next-line no-console
      console.log('Migrating for 1.2.0', store.get('deviceManager'));

      // Migrate custom devices
      const previousCustomDevices: Device[] = store.get(
        'deviceManager.customDevices'
      ) as Device[];
      const newCustomDevices: Device[] = previousCustomDevices.map((device) => {
        const newDevice = {
          ...device,
          id: randomUUID(),
        };
        return newDevice;
      });
      store.set('deviceManager.customDevices', newCustomDevices);

      // Migrate active devices to suites
      const previousActiveDevices: string[] = store.get(
        'deviceManager.activeDevices'
      ) as string[];

      const newActiveDevices: string[] = previousActiveDevices
        .map((name) => {
          return defaultDevices.find((device) => device.name === name)?.id;
        })
        .filter(Boolean) as string[];

      console.log('newActiveDevices', newActiveDevices);

      if (
        newActiveDevices.length === 3 &&
        newActiveDevices.every((id) => defaultActiveDevices.includes(id))
      ) {
        // default devices so no need to migrate
        console.log('No need to migrate');
        return;
      }

      store.set('deviceManager.previewSuites', [
        {
          id: 'default',
          name: 'Default',
          devices: newActiveDevices,
        },
      ]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Migration failed', e);
      return;
    }
    // eslint-disable-next-line no-console
    console.log('Migration successful', store.get('deviceManager'));
  },
};
