import {describe, it, expect, vi, beforeEach} from 'vitest';

// Mock the deviceList module so sanitizeSuites doesn't need the real device map
vi.mock('common/deviceList', () => ({
  getDevicesMap: vi.fn(() => ({
    '10008': {id: '10008', name: 'iPhone 12 Pro'},
    '10013': {id: '10013', name: 'iPad'},
    '10015': {id: '10015', name: 'MacBook Pro'},
  })),
}));

// Import after mocks are set up
import {sanitizeSuites} from './utils';

describe('sanitizeSuites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates default suite when stored suites are null', () => {
    window.electron.store.get = vi.fn(() => null);

    sanitizeSuites();

    expect(window.electron.store.set).toHaveBeenCalledWith(
      'deviceManager.previewSuites',
      [{id: 'default', name: 'Default', devices: ['10008', '10013', '10015']}],
    );
  });

  it('creates default suite when stored suites are empty', () => {
    window.electron.store.get = vi.fn(() => []);

    sanitizeSuites();

    expect(window.electron.store.set).toHaveBeenCalledWith(
      'deviceManager.previewSuites',
      [{id: 'default', name: 'Default', devices: ['10008', '10013', '10015']}],
    );
  });

  it('removes invalid device IDs from suites', () => {
    const suites = [
      {
        id: 'default',
        name: 'Default',
        devices: ['10008', '99999', '10013'],
      },
    ];
    window.electron.store.get = vi.fn(() => suites);

    sanitizeSuites();

    expect(window.electron.store.set).toHaveBeenCalledWith(
      'deviceManager.previewSuites',
      [{id: 'default', name: 'Default', devices: ['10008', '10013']}],
    );
  });

  it('does not write to store when all device IDs are valid', () => {
    const suites = [
      {
        id: 'default',
        name: 'Default',
        devices: ['10008', '10013', '10015'],
      },
    ];
    window.electron.store.get = vi.fn(() => suites);

    sanitizeSuites();

    expect(window.electron.store.set).not.toHaveBeenCalled();
  });

  it('handles multiple suites and only writes when dirty', () => {
    const suites = [
      {id: 'default', name: 'Default', devices: ['10008', '10013']},
      {id: 'mobile', name: 'Mobile', devices: ['10008', 'BAD_ID']},
    ];
    window.electron.store.get = vi.fn(() => suites);

    sanitizeSuites();

    expect(window.electron.store.set).toHaveBeenCalledWith(
      'deviceManager.previewSuites',
      [
        {id: 'default', name: 'Default', devices: ['10008', '10013']},
        {id: 'mobile', name: 'Mobile', devices: ['10008']},
      ],
    );
  });
});
