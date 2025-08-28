import Store from 'electron-store';
import { randomUUID } from 'crypto';

import { PreviewSuites } from '../renderer/store/features/device-manager';

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
          devices:
            newActiveDevices.length > 0
              ? newActiveDevices
              : defaultActiveDevices,
        },
      ]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Migration failed', e);
      store.set('deviceManager.previewSuites', [
        {
          id: 'default',
          name: 'Default',
          devices: defaultActiveDevices,
        },
      ]);
      return;
    }
    // eslint-disable-next-line no-console
    console.log('Migration successful', store.get('deviceManager'));
  },
  '1.2.1': (store: Store) => {
    const suites = store.get('deviceManager.previewSuites') as
      | PreviewSuites
      | undefined;
    if (suites == null || suites.length > 0) {
      return;
    }
    store.set('deviceManager.previewSuites', [
      {
        id: 'default',
        name: 'Default',
        devices: defaultActiveDevices,
      },
    ]);
  },
  '1.14.0': (store: Store) => {
    // Migrate dpi to dpr in custom devices
    try {
      const previousCustomDevices: any[] = store.get(
        'deviceManager.customDevices'
      ) as any[];
      const newCustomDevices: Device[] = previousCustomDevices.map((device) => {
        const newDevice = {
          ...device,
          dpr: device.dpi !== undefined ? device.dpi : device.dpr,
        };
        delete newDevice.dpi;
        return newDevice as Device;
      });
      store.set('deviceManager.customDevices', newCustomDevices);
      console.log(
        'Migration for 1.14.0 successful',
        store.get('deviceManager.customDevices')
      );
    } catch (e) {
      console.log('Migration for 1.14.0 failed', e);
    }
  },
};
