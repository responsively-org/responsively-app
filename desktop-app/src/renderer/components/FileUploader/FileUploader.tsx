import {useEffect, useRef, useState} from 'react';
import {useFileUpload} from './hooks';

export type FileUploaderProps = {
  handleFileUpload: (file: File) => void;
  multiple?: boolean;
  acceptedFileTypes?: string;
  showFileName?: boolean;
  initialFileName?: string;
};

export const FileUploader = ({
  handleFileUpload,
  multiple,
  acceptedFileTypes,
  showFileName = false,
  initialFileName,
}: FileUploaderProps) => {
  const {uploadedFile, handleUpload, resetUploadedFile} = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayFileName, setDisplayFileName] = useState<string | null>(null);

  useEffect(() => {
    if (uploadedFile) {
      handleFileUpload(uploadedFile);
      resetUploadedFile();
      if (!showFileName && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [handleFileUpload, resetUploadedFile, uploadedFile, showFileName]);

  useEffect(() => {
    if (initialFileName !== undefined) {
      setDisplayFileName(initialFileName || null);
    }
  }, [initialFileName]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getFileName = () => {
    if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
      return fileInputRef.current.files[0].name;
    }
    return displayFileName;
  };

  const fileName = showFileName ? getFileName() : null;

  if (showFileName) {
    return (
      <div className="flex flex-col gap-2" data-testid="file-uploader">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleButtonClick}
            className="rounded border border-slate-400 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Choose File
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {fileName || 'No file chosen'}
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleUpload}
          multiple={multiple || false}
          accept={acceptedFileTypes || '*/*'}
          aria-label="Upload file"
          data-testid="fileUploader"
          className="hidden"
        />
      </div>
    );
  }

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
