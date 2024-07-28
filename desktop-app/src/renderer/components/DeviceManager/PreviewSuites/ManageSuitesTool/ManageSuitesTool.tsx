import { Icon } from '@iconify/react';
import Button from 'renderer/components/Button';
import { useState } from 'react';
import { FileUploader } from 'renderer/components/FileUploader';
import Modal from 'renderer/components/Modal';
import { addSuites } from 'renderer/store/features/device-manager';
import { useDispatch } from 'react-redux';
import { defaultDevices, Device } from 'common/deviceList';
import { transformFile } from './utils';

export const ManageSuitesTool = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const dispatch = useDispatch();

  const onFileUpload = (fileUploaded: File) =>
    transformFile(fileUploaded)
      .then((fileTransformed) => {
        const { customDevices, suites } = fileTransformed;

        if (suites) {
          dispatch(addSuites(suites));
        }

        if (customDevices) {
          const importedCustomDevices = customDevices.filter(
            (item: Device) => !defaultDevices.includes(item)
          );

          window.electron.store.set(
            'deviceManager.customDevices',
            importedCustomDevices
          );
        }

        setOpen(false);

        return null;
      })
      .catch(() => setError(true));

  const onFileUploadReset = () => {
    setError(false);
    setOpen(false);
  };

  return (
    <>
      <div className="space-between flex flex-row">
        <Button
          className="aspect-square w-12 rounded-full hover:!bg-slate-500"
          onClick={() => setOpen(true)}
        >
          <Icon
            icon="mdi:folder-upload"
            fontSize={18}
            onClick={() => setOpen(true)}
          />
        </Button>
        <Button
          className="aspect-square w-12 rounded-full hover:!bg-slate-500"
          onClick={() => setOpen(true)}
        >
          <Icon
            icon="mdi:folder-download"
            fontSize={18}
            onClick={() => setOpen(true)}
          />
        </Button>
      </div>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Import your devices"
      >
        <>
          <FileUploader
            acceptedFileTypes="application/json"
            multiple={false}
            handleFileUpload={onFileUpload}
          />
          <div className="text-align align-items-center flex flex-row flex-nowrap text-orange-500">
            <Icon icon="mdi:alert" />
            <p className="pl-2">Importing will replace all current settings.</p>
          </div>
          {error && (
            <div className="absolute top-0 left-0 flex h-full w-full flex-col flex-wrap items-center justify-center bg-slate-600 bg-opacity-95">
              <div className="text-center text-sm text-white">
                <p>There has been an error, please try again.</p>
              </div>
              <Button onClick={onFileUploadReset} className="p-2">
                Close
              </Button>
            </div>
          )}
        </>
      </Modal>
    </>
  );
};
