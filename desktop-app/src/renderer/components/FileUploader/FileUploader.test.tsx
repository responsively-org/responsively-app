import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FileUploader } from './FileUploader';
import useFileUpload from './hooks/useFileUpload';

jest.mock('./hooks/useFileUpload');

const mockHandleFileUpload = jest.fn();
const mockHandleUpload = jest.fn();
const mockResetUploadedFile = jest.fn();

describe('FileUploader', () => {
  beforeEach(() => {
    useFileUpload.mockReturnValue({
      uploadedFile: null,
      handleUpload: mockHandleUpload,
      resetUploadedFile: mockResetUploadedFile,
    });
  });

  it('renders the component', () => {
    render(<FileUploader handleFileUpload={mockHandleFileUpload} />);
    expect(screen.getByText('Upload a File')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Remove file/i })
    ).toBeInTheDocument();
  });

  it('calls handleUpload when file input changes', () => {
    render(<FileUploader handleFileUpload={mockHandleFileUpload} />);
    const fileInput = screen.getByRole('textbox');
    fireEvent.change(fileInput, {
      target: { files: [new File(['content'], 'file.txt')] },
    });
    expect(mockHandleUpload).toHaveBeenCalled();
  });

  it('calls resetUploadedFile when remove button is clicked', () => {
    render(<FileUploader handleFileUpload={mockHandleFileUpload} />);
    const removeButton = screen.getByRole('button', { name: /Remove file/i });
    fireEvent.click(removeButton);
    expect(mockResetUploadedFile).toHaveBeenCalled();
  });

  it('calls handleFileUpload when uploadedFile is set', () => {
    const mockFile = new File(['content'], 'file.txt');
    useFileUpload.mockReturnValue({
      uploadedFile: mockFile,
      handleUpload: mockHandleUpload,
      resetUploadedFile: mockResetUploadedFile,
    });
    render(<FileUploader handleFileUpload={mockHandleFileUpload} />);
    expect(mockHandleFileUpload).toHaveBeenCalledWith(mockFile);
  });
});
