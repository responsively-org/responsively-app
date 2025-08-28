import '@testing-library/jest-dom';
// import { downloadFile, onFileDownload, setCustomDevices } from './helpers';

import { Device } from 'common/deviceList';
import { fireEvent, render } from '@testing-library/react';
import Button from 'renderer/components/Button';
import * as Helpers from './helpers';

describe('onFileDownload', () => {
  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'mockedURL');
    global.URL.revokeObjectURL = jest.fn(); // Mocking revokeObjectURL too
  });

  afterEach(() => jest.clearAllMocks());

  it('should get customDevices and suites from the store and download the file', () => {
    const mockCustomDevices = [{ name: 'Device1', width: 800, height: 600 }];
    const mockSuites = [{ name: 'Suite1' }];

    const spyOnDownloadFileFn = jest.spyOn(Helpers, 'downloadFile');

    (window.electron.store.get as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === 'deviceManager.customDevices') {
          return mockCustomDevices;
        }
        if (key === 'deviceManager.previewSuites') {
          return mockSuites;
        }
        return null;
      }
    );

    Helpers.onFileDownload();

    expect(window.electron.store.get).toHaveBeenCalledWith(
      'deviceManager.customDevices'
    );
    expect(window.electron.store.get).toHaveBeenCalledWith(
      'deviceManager.previewSuites'
    );
    expect(spyOnDownloadFileFn).toHaveBeenCalledWith({
      customDevices: mockCustomDevices,
      suites: mockSuites,
    });
  });
});

describe('downloadFile', () => {
  it('should create and download a JSON file', () => {
    const mockFileData = { key: 'value' };
    const mockedUrl = 'http://localhost/#';

    const createObjectURLSpy = jest
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue(mockedUrl);
    const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL');
    const spyOnDownloadFileFn = jest.spyOn(Helpers, 'downloadFile');

    const { getByTestId } = render(
      <div>
        <Button
          onClick={() => Helpers.downloadFile(mockFileData)}
          data-testid="mockDownloadBtn"
        >
          Download
        </Button>
      </div>
    );

    const link = getByTestId('mockDownloadBtn');
    fireEvent.click(link);

    expect(spyOnDownloadFileFn).toHaveBeenCalled();
    expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
    expect(revokeObjectURLSpy).toHaveBeenCalledWith(mockedUrl);
  });
});

describe('setCustomDevices', () => {
  it('should filter out default devices and store custom devices', () => {
    const mockCustomDevices: Device[] = [
      {
        name: 'Device1',
        width: 800,
        height: 600,
        id: '1',
        userAgent: '',
        type: '',
        dpr: 0,
        isTouchCapable: false,
        isMobileCapable: false,
        capabilities: [],
      },
      {
        name: 'Device2',
        width: 1024,
        height: 768,
        id: '2',
        userAgent: '',
        type: '',
        dpr: 0,
        isTouchCapable: false,
        isMobileCapable: false,
        capabilities: [],
      },
    ];

    const mockDefaultDevices: Device[] = [
      {
        name: 'Device1',
        width: 800,
        height: 600,
        id: '0',
        userAgent: '',
        type: '',
        dpr: 0,
        isTouchCapable: false,
        isMobileCapable: false,
        capabilities: [],
      },
    ];

    jest.mock('common/deviceList', () => ({
      defaultDevices: mockDefaultDevices,
    }));

    const filteredDevices = Helpers.setCustomDevices(mockCustomDevices);

    expect(window.electron.store.set).not.toHaveBeenCalledWith(
      'deviceManager.customDevices',
      [mockCustomDevices[1]]
    );

    expect(filteredDevices).toEqual(mockCustomDevices);
  });
});
