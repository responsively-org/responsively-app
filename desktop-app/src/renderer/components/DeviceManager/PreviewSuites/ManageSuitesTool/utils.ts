import type {Device} from 'common/deviceList';
import type {PreviewSuite} from 'renderer/store/features/device-manager';
export const transformFile = (
  file: File
): Promise<{customDevices?: Device[]; suites?: PreviewSuite[]}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const jsonContent = JSON.parse(reader.result as string);
        resolve(jsonContent);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsText(file);
  });
};
