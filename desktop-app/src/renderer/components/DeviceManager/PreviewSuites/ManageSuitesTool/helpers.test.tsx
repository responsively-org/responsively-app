import {Device} from 'common/deviceList';
import {fireEvent, render} from '@testing-library/react';
import Button from 'renderer/components/Button';
import {type Mock} from 'vitest';
import * as Helpers from './helpers';

const mockDefaultDevices = vi.hoisted(() => [
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
]);

vi.mock('common/deviceList', async (importOriginal) => {
  const actual = await importOriginal<typeof import('common/deviceList')>();
  return {
    ...actual,
    defaultDevices: mockDefaultDevices,
  };
});

describe('onFileDownload', () => {
  beforeAll(() => {
    global.URL.createObjectURL = vi.fn(() => 'mockedURL');
    global.URL.revokeObjectURL = vi.fn(); // Mocking revokeObjectURL too
  });

  afterEach(() => vi.clearAllMocks());

  it('should get customDevices and suites from the store and download the file', () => {
    const mockCustomDevices = [{name: 'Device1', width: 800, height: 600}];
    const mockSuites = [{name: 'Suite1'}];

    (window.electron.store.get as Mock).mockImplementation((key: string) => {
      if (key === 'deviceManager.customDevices') {
        return mockCustomDevices;
      }
      if (key === 'deviceManager.previewSuites') {
        return mockSuites;
      }
      return null;
    });

    Helpers.onFileDownload();

    expect(window.electron.store.get).toHaveBeenCalledWith('deviceManager.customDevices');
    expect(window.electron.store.get).toHaveBeenCalledWith('deviceManager.previewSuites');
    // Verify downloadFile was called by checking its side effects
    // (vi.spyOn can't intercept internal ESM calls)
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });
});

describe('downloadFile', () => {
  it('should create and download a JSON file', () => {
    const mockFileData = {key: 'value'};
    const mockedUrl = 'http://localhost/#';

    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockedUrl);
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');
    const spyOnDownloadFileFn = vi.spyOn(Helpers, 'downloadFile');

    const {getByTestId} = render(
      <div>
        <Button onClick={() => Helpers.downloadFile(mockFileData)} data-testid="mockDownloadBtn">
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

    const filteredDevices = Helpers.setCustomDevices(mockCustomDevices);

    expect(window.electron.store.set).not.toHaveBeenCalledWith('deviceManager.customDevices', [
      mockCustomDevices[1],
    ]);

    expect(filteredDevices).toEqual(mockCustomDevices);
  });
});
