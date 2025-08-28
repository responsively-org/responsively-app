import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FileUploader, FileUploaderProps } from './FileUploader';
import { useFileUpload } from './hooks';

jest.mock('./hooks');

const mockHandleFileUpload = jest.fn();
const mockHandleUpload = jest.fn();
const mockResetUploadedFile = jest.fn();

describe('FileUploader', () => {
  beforeEach(() => {
    (useFileUpload as jest.Mock).mockReturnValue({
      uploadedFile: null,
      handleUpload: mockHandleUpload,
      resetUploadedFile: mockResetUploadedFile,
    });
  });

  const renderComponent = (props?: FileUploaderProps) =>
    render(
      <FileUploader
        handleFileUpload={props?.handleFileUpload || mockHandleFileUpload}
        multiple={props?.multiple || false}
        acceptedFileTypes={props?.acceptedFileTypes || '*/*'}
      />
    );

  it('renders the component', () => {
    const { getByTestId } = renderComponent();

    const fileInput = getByTestId('fileUploader');

    expect(fileInput).toBeInTheDocument();
  });

  it('calls handleUpload when file input changes', () => {
    const { getByTestId } = renderComponent();
    const fileInput = getByTestId('fileUploader');
    fireEvent.change(fileInput, {
      target: { files: [new File(['content'], 'file.txt')] },
    });
    expect(mockHandleUpload).toHaveBeenCalled();
  });

  it('calls handleFileUpload when uploadedFile is set', () => {
    const mockFile = new File(['content'], 'file.txt');
    (useFileUpload as jest.Mock).mockReturnValue({
      uploadedFile: mockFile,
      handleUpload: mockHandleUpload,
      resetUploadedFile: mockResetUploadedFile,
    });
    renderComponent();
    expect(mockHandleFileUpload).toHaveBeenCalledWith(mockFile);
  });

  it('sets the accept attribute correctly', () => {
    const { getByTestId } = renderComponent({
      acceptedFileTypes: 'application/json',
      handleFileUpload: mockHandleFileUpload,
    });
    const fileInput = getByTestId('fileUploader');
    expect(fileInput).toHaveAttribute('accept', 'application/json');
  });

  it('allows multiple file uploads when multiple prop is true', () => {
    const { getByTestId } = renderComponent({
      multiple: true,
      handleFileUpload: mockHandleFileUpload,
    });
    const fileInput = getByTestId('fileUploader');
    expect(fileInput).toHaveAttribute('multiple');
  });

  it('does not allow multiple file uploads when multiple prop is false', () => {
    const { getByTestId } = renderComponent({
      multiple: false,
      handleFileUpload: mockHandleFileUpload,
    });
    const fileInput = getByTestId('fileUploader');
    expect(fileInput).not.toHaveAttribute('multiple');
  });
});
