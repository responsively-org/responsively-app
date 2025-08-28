import { defaultDevices, Device } from 'common/deviceList';

export const downloadFile = <T extends Record<string, unknown>>(
  fileData: T
) => {
  const jsonString = JSON.stringify(fileData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `responsively_backup_${new Date().toLocaleDateString()}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const setCustomDevices = (customDevices: Device[]) => {
  const importedCustomDevices = customDevices.filter(
    (item: Device) => !defaultDevices.includes(item)
  );

  window.electron.store.set(
    'deviceManager.customDevices',
    importedCustomDevices
  );

  return importedCustomDevices;
};

export const onFileDownload = () => {
  const fileData = {
    customDevices: window.electron.store.get('deviceManager.customDevices'),
    suites: window.electron.store.get('deviceManager.previewSuites'),
  };
  downloadFile(fileData);
};
