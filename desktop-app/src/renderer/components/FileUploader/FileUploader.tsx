import { useEffect, useRef } from 'react';
import { useFileUpload } from './hooks';

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
    if (uploadedFile) {
      handleFileUpload(uploadedFile);
      resetUploadedFile();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [handleFileUpload, resetUploadedFile, uploadedFile]);

  return (
    <div className="flex flex-row flex-wrap" data-testid="file-uploader">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleUpload}
        multiple={multiple || false}
        accept={acceptedFileTypes || '*/*'}
        aria-label="Upload file"
        data-testid="fileUploader"
      />
    </div>
  );
};
