import { act, renderHook } from '@testing-library/react';
import { useFileUpload } from './useFileUpload';

describe('useFileUpload', () => {
  it('should initialize with null uploadedFile', () => {
    const { result } = renderHook(() => useFileUpload());

    expect(result.current.uploadedFile).toBeNull();
  });

  it('should set uploadedFile when handleUpload is called with a file', () => {
    const { result } = renderHook(() => useFileUpload());
    const mockFile = new File(['dummy content'], 'example.png', {
      type: 'image/png',
    });

    act(() => {
      result.current.handleUpload({
        target: {
          files: [mockFile],
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.uploadedFile).toEqual(mockFile);
  });

  it('should reset uploadedFile when resetUploadedFile is called', () => {
    const { result } = renderHook(() => useFileUpload());
    const mockFile = new File(['dummy content'], 'example.png', {
      type: 'image/png',
    });

    act(() => {
      result.current.handleUpload({
        target: {
          files: [mockFile],
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.uploadedFile).toEqual(mockFile);

    act(() => {
      result.current.resetUploadedFile();
    });

    expect(result.current.uploadedFile).toBeNull();
  });
});
