import { useState } from 'react';

export const useFileUpload = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files || event?.target?.files?.length) {
      setUploadedFile(event.target.files[0]);
    }
  };

  const resetUploadedFile = () => {
    setUploadedFile(null);
  };

  return {
    uploadedFile,
    handleUpload,
    resetUploadedFile,
  };
};
