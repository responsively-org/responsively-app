import { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useFileUpload } from './hooks';
import Button from '../Button';

export type FileUploaderProps = {
  handleFileUpload: (file: File) => void;
  multiple?: boolean;
  acceptedFileTypes?: string;
};

export const FileUploader = ({
  handleFileUpload,
  multiple,
  acceptedFileTypes,
}: FileUploaderProps) => {
  const { uploadedFile, handleUpload, resetUploadedFile } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (uploadedFile && handleFileUpload) {
      handleFileUpload(uploadedFile);
    }
  }, [handleFileUpload, uploadedFile]);

  const handleReset = () => {
    resetUploadedFile();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-row flex-wrap">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleUpload}
        multiple={multiple || false}
        accept={acceptedFileTypes || '*/*'}
        aria-label="Upload file"
        data-testid="fileUploader"
      />
      <Button
        onClick={handleReset}
        data-testid="fileRemover"
        aria-label="Remove file"
      >
        <Icon icon="mdi:delete" fontSize={18} />
      </Button>
    </div>
  );
};
