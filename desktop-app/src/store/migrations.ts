import Store from 'electron-store';
import { randomUUID } from 'crypto';

import { defaultDevices, Device } from '../common/deviceList';

export const migrations = {
  '1.2.0': (store: Store) => {
    try {
      // eslint-disable-next-line no-console
      console.log('Migrating from 1.0.1', store.get('deviceManager'));
      const previousActiveDevices: string[] = store.get(
        'deviceManager.activeDevices'
      ) as string[];
      const previousCustomDevices: Device[] = store.get(
        'deviceManager.customDevices'
      ) as Device[];
      const newActiveDevices = previousActiveDevices
        .map((name) => {
          return defaultDevices.find((device) => device.name === name)?.id;
        })
        .filter(Boolean);

      const newCustomDevices: Device[] = previousCustomDevices.map((device) => {
        const newDevice = {
          ...device,
          id: randomUUID(),
        };
        return newDevice;
      });

      store.set('deviceManager.activeDevices', newActiveDevices);
      store.set('deviceManager.customDevices', newCustomDevices);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Migration failed', e);
      return;
    }
    // eslint-disable-next-line no-console
    console.log('Migration successful', store.get('deviceManager'));
  },
};
