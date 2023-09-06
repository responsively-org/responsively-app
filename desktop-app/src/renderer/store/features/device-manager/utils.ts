import { getDevicesMap } from 'common/deviceList';
import type { PreviewSuites } from '.';

export const sanitizeSuites = () => {
  const existingSuites: PreviewSuites = window.electron.store.get(
    'deviceManager.previewSuites'
  );
  if (existingSuites == null || existingSuites.length === 0) {
    window.electron.store.set('deviceManager.previewSuites', [
      {
        id: 'default',
        name: 'Default',
        devices: ['10008', '10013', '10015'],
      },
    ]);

    return;
  }

  let dirty = false;

  existingSuites.forEach((suite) => {
    const availableDevices = suite.devices.filter(
      (id) => getDevicesMap()[id] != null
    );
    if (availableDevices.length !== suite.devices.length) {
      suite.devices = availableDevices;
      dirty = true;
    }
  });

  if (dirty) {
    window.electron.store.set('deviceManager.previewSuites', existingSuites);
  }
};
