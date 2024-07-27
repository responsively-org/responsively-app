import { useEffect } from 'react';
import { Icon } from '@iconify/react';
import useFileUpload from './useFileUpload';
import Button from '../Button';

export const FileUploader = ({
  handleFileUpload,
}: {
  handleFileUpload?: (file: File) => void;
}) => {
  const { uploadedFile, handleUpload, resetUploadedFile } = useFileUpload();

  useEffect(() => {
    if (uploadedFile && handleFileUpload) {
      handleFileUpload(uploadedFile);
    }
  }, [handleFileUpload, uploadedFile]);

  return (
    <div className="flex flex-col">
      <h2>Upload a File</h2>
      <input type="file" onChange={handleUpload} multiple={false} />
      <Button onClick={resetUploadedFile}>
        <Icon icon="mdi:delete" fontSize={8} />
        Remove file
      </Button>
    </div>
  );
};
