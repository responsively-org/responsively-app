import {getDevicesMap} from 'common/deviceList';
import type {PreviewSuites} from '.';

/**
 * Drops device ids that no longer exist in the catalog (e.g. removed custom
 * devices). Pure — the caller decides whether to persist the result.
 */
export const sanitizeSuites = (
  suites: PreviewSuites | null | undefined
): {suites: PreviewSuites | null; dirty: boolean} => {
  if (suites == null || suites.length === 0) {
    return {suites: null, dirty: true};
  }

  let dirty = false;
  const devicesMap = getDevicesMap();
  const sanitized = suites.map((suite) => {
    const availableDevices = suite.devices.filter((id) => devicesMap[id] != null);
    if (availableDevices.length !== suite.devices.length) {
      dirty = true;
      return {...suite, devices: availableDevices};
    }
    return suite;
  });

  return {suites: sanitized, dirty};
};
