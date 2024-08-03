import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Device } from 'common/deviceList';
import { Provider, useDispatch } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import {
  addSuites,
  deleteAllSuites,
} from 'renderer/store/features/device-manager';
import { ReactNode } from 'react';
import { transformFile } from './utils';
import { ManageSuitesTool } from './ManageSuitesTool';

jest.mock('renderer/store/features/device-manager', () => ({
  addSuites: jest.fn(() => ({ type: 'addSuites' })),
  deleteAllSuites: jest.fn(() => ({ type: 'deleteAllSuites' })),
  default: jest.fn((state = {}) => state), // Mock the reducer as a function
}));

jest.mock('./utils', () => ({
  transformFile: jest.fn(),
}));

jest.mock('renderer/components/FileUploader', () => ({
  FileUploader: ({
    handleFileUpload,
  }: {
    handleFileUpload: (file: File) => void;
  }) => (
    <button
      type="button"
      data-testid="mock-file-uploader"
      onClick={() =>
        handleFileUpload(
          new File(['{}'], 'test.json', { type: 'application/json' })
        )
      }
    >
      Mock File Uploader
    </button>
  ),
}));

jest.mock('./helpers', () => ({
  onFileDownload: jest.fn(),
  setCustomDevices: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

const renderWithRedux = (
  component:
    | string
    | number
    | boolean
    | Iterable<ReactNode>
    | JSX.Element
    | null
    | undefined
) => {
  const store = configureStore({
    reducer: {
      deviceManager: jest.requireMock('renderer/store/features/device-manager')
        .default,
    },
  });

  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('ManageSuitesTool', () => {
  let setCustomDevicesStateMock: jest.Mock<() => void, Device[]>;
  const dispatchMock = jest.fn();

  beforeEach(() => {
    (useDispatch as jest.Mock).mockReturnValue(dispatchMock);

    setCustomDevicesStateMock = jest.fn();

    renderWithRedux(
      <ManageSuitesTool setCustomDevicesState={setCustomDevicesStateMock} />
    );
  });

  it('renders the component correctly', () => {
    expect(screen.getByTestId('download-btn')).toBeInTheDocument();
    expect(screen.getByTestId('upload-btn')).toBeInTheDocument();
    expect(screen.getByTestId('reset-btn')).toBeInTheDocument();
  });

  it('opens the modal when download button is clicked', () => {
    fireEvent.click(screen.getByTestId('download-btn'));
    expect(screen.getByText('Import your devices')).toBeInTheDocument();
  });

  it('opens the reset confirmation dialog when reset button is clicked', () => {
    fireEvent.click(screen.getByTestId('reset-btn'));
    expect(
      screen.getByText('Do you want to reset all settings?')
    ).toBeInTheDocument();
  });

  it('closes the reset confirmation dialog when the close button is clicked', () => {
    fireEvent.click(screen.getByTestId('reset-btn'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(
      screen.queryByText('Do you want to reset all settings?')
    ).not.toBeInTheDocument();
  });

  it('dispatches deleteAllSuites and clears custom devices on reset confirmation', async () => {
    fireEvent.click(screen.getByTestId('reset-btn'));
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(deleteAllSuites).toHaveBeenCalled();
      expect(setCustomDevicesStateMock).toHaveBeenCalledWith([]);
    });
  });

  it('handles successful file upload and processes custom devices and suites', async () => {
    const mockSuites = [
      { id: '1', name: 'first suite', devices: [] },
      { id: '2', name: 'second suite', devices: [] },
    ];

    (transformFile as jest.Mock).mockResolvedValue({
      customDevices: ['device1', 'device2'],
      suites: mockSuites,
    });

    fireEvent.click(screen.getByTestId('download-btn'));
    fireEvent.click(screen.getByTestId('mock-file-uploader'));

    await waitFor(() => {
      expect(transformFile).toHaveBeenCalledWith(expect.any(File));
      expect(dispatchMock).toHaveBeenCalledWith(addSuites(mockSuites));
    });
  });

  it('handles error in file upload', async () => {
    (transformFile as jest.Mock).mockRejectedValue(
      new Error('File upload failed')
    );

    fireEvent.click(screen.getByTestId('download-btn'));

    fireEvent.click(screen.getByTestId('mock-file-uploader'));

    await waitFor(() => {
      expect(transformFile).toHaveBeenCalledWith(expect.any(File));
      expect(
        screen.getByText('There has been an error, please try again.')
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Close'));

    expect(
      screen.queryByText('There has been an error, please try again.')
    ).not.toBeInTheDocument();
  });
});
