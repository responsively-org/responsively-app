import { Icon } from '@iconify/react';
import Button from 'renderer/components/Button';
import { useState } from 'react';
import { FileUploader } from 'renderer/components/FileUploader';
import Modal from 'renderer/components/Modal';
import { addSuites } from 'renderer/store/features/device-manager';
import { useDispatch } from 'react-redux';
import { transformFile } from './utils';
import { onFileDownload, setCustomDevices } from './helpers';
import { ManageSuitesToolError } from './ManageSuitesToolError';

export const ManageSuitesTool = ({ setCustomDevicesState }: any) => {
  const [open, setOpen] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const dispatch = useDispatch();

  const onFileUpload = (fileUploaded: File) =>
    transformFile(fileUploaded)
      .then((fileTransformed) => {
        const { customDevices, suites } = fileTransformed;

        if (customDevices) {
          const newCustomDevices = setCustomDevices(customDevices);
          setCustomDevicesState(newCustomDevices);
        }

        if (suites) {
          dispatch(addSuites(suites));
        }

        setOpen(false);

        return null;
      })
      .catch(() => setError(true));

  const onErrorClose = () => {
    setError(false);
    setOpen(false);
  };

  return (
    <>
      <div className="flex flex-row content-end justify-end">
        <Button
          data-testid="upload-btn"
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
          data-testid="download-btn"
          className="aspect-square w-12 rounded-full hover:!bg-slate-500"
          onClick={onFileDownload}
        >
          <Icon
            icon="mdi:folder-download"
            fontSize={18}
            onClick={onFileDownload}
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
          {error && <ManageSuitesToolError onClose={onErrorClose} />}
        </>
      </Modal>
    </>
  );
};
