import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ManageSuitesTool } from './ManageSuitesTool';
import deviceManagerReducer, {
  addSuites,
  deleteAllSuites,
} from 'renderer/store/features/device-manager';
import { transformFile } from './utils';
import { ReactNode } from 'react';
import { JSX } from 'react/jsx-runtime';
import '@testing-library/jest-dom';
import { Channels } from 'common/constants';

jest.mock('renderer/store/features/device-manager', () => ({
  addSuites: jest.fn(() => ({ type: 'addSuites' })),
  deleteAllSuites: jest.fn(() => ({ type: 'deleteAllSuites' })),
}));

jest.mock('./utils', () => ({
  transformFile: jest.fn(),
}));

jest.mock('./helpers', () => ({
  onFileDownload: jest.fn(),
  setCustomDevices: jest.fn(),
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
      deviceManager: deviceManagerReducer,
    },
  });

  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('ManageSuitesTool', () => {
  let setCustomDevicesStateMock: jest.Mock<any, any>;

  beforeAll(() => {
    window.electron = {
      ipcRenderer: {
        sendMessage: function <T>(channel: Channels, ...args: T[]): void {
          throw new Error('Function not implemented.');
        },
        on: function <T>(
          channel: string,
          func: (...args: T[]) => void
        ): (() => void) | undefined {
          throw new Error('Function not implemented.');
        },
        once: function <T>(
          channel: string,
          func: (...args: T[]) => void
        ): void {
          throw new Error('Function not implemented.');
        },
        invoke: function <T, P>(channel: string, ...args: T[]): Promise<P> {
          throw new Error('Function not implemented.');
        },
        removeListener: function <T>(
          channel: string,
          func: (...args: T[]) => void
        ): void {
          throw new Error('Function not implemented.');
        },
        removeAllListeners: function (channel: string): void {
          throw new Error('Function not implemented.');
        },
      },
      store: {
        set: jest.fn(), // Mock the `set` function
        get: jest.fn(), // Mock the `get` function if needed in other parts of your tests
      },
    };

    global.IntersectionObserver = jest.fn(() => ({
      root: null,
      rootMargin: '',
      thresholds: [],
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      takeRecords: jest.fn(),
    }));
  });

  beforeEach(() => {
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

  it.only('dispatches deleteAllSuites and clears custom devices on reset confirmation', async () => {
    fireEvent.click(screen.getByTestId('reset-btn'));
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(deleteAllSuites).toHaveBeenCalled();
      expect(setCustomDevicesStateMock).toHaveBeenCalledWith([]);
    });
  });

  it('handles file upload and dispatches actions correctly', async () => {
    const file = new File(['test'], 'test.json', { type: 'application/json' });

    (transformFile as jest.Mock).mockResolvedValueOnce({
      customDevices: ['device1', 'device2'],
      suites: ['suite1', 'suite2'],
    });

    fireEvent.click(screen.getByTestId('download-btn'));

    const input = screen.getByLabelText('Upload File');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(setCustomDevicesStateMock).toHaveBeenCalled();
      expect(addSuites).toHaveBeenCalled();
      expect(screen.queryByText('Import your devices')).not.toBeInTheDocument();
    });
  });

  it('handles file upload error and shows error message', async () => {
    const file = new File(['test'], 'test.json', { type: 'application/json' });

    (transformFile as jest.Mock).mockRejectedValueOnce(new Error('Test Error'));

    fireEvent.click(screen.getByTestId('download-btn'));

    const input = screen.getByLabelText('Upload File');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });
  });
});
