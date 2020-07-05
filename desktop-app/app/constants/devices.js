// @flow
import settings from 'electron-settings';
import chromeEmulatedDevices from './chromeEmulatedDevices';
import {ACTIVE_DEVICES, CUSTOM_DEVICES} from './settingKeys';

export const OS: {[key: string]: OS} = {
  ios: 'iOS',
  android: 'Android',
  windowsPhone: 'Windows Phone',
  pc: 'PC',
};

export const DEVICE_TYPE: {[key: string]: DeviceType} = {
  phone: 'phone',
  tablet: 'tablet',
  desktop: 'notebook',
};

export const CAPABILITIES: {[key: string]: Capability} = {
  mobile: 'mobile',
  touch: 'touch',
  responsive: 'responsive',
};

export const SOURCE: {[key: string]: Source} = {
  chrome: 'chrome',
  custom: 'custom',
};

type OSType = OS.ios | OS.android | OS.windowsPhone | OS.pc;

type DeviceType = DEVICE_TYPE.phone | DEVICE_TYPE.tablet | DEVICE_TYPE.desktop;

type Capability = CAPABILITIES.mobile | CAPABILITIES.touch;

type Source = SOURCE.chrome | SOURCE.custom;

const chromeVersion = process.versions.chrome || '83.0.4103.106';

export type Device = {
  id: number,
  added: boolean,
  width: number,
  height: number,
  name: string,
  useragent: string,
  capabilities: Array<Capability>,
  os: OSType,
  type: DeviceType,
  source: Source,
  isMuted: boolean,
};

function getOS(device) {
  if (device.capabilities.indexOf('mobile') > -1) {
    const useragent = device['user-agent'];
    if (useragent.indexOf('like Mac OS X') > -1) {
      return OS.ios;
    }
    if (useragent.indexOf('Lumia') > -1) {
      return OS.windowsPhone;
    }
    return OS.android;
  }
  return OS.pc;
}

function getUserAgent(device) {
  let deviceUserAgent = device['user-agent'];
  if (deviceUserAgent && deviceUserAgent.includes('Chrome/%s')) {
    deviceUserAgent = deviceUserAgent.replace('%s', chromeVersion);
  }
  return deviceUserAgent;
}

export default function getAllDevices() {
  const chromeDefaultDevices = chromeEmulatedDevices.extensions
    .sort((a, b) => a.order - b.order)
    .map(({id, order, device}) => {
      const dimension =
        device.type === DEVICE_TYPE.desktop
          ? device.screen.horizontal
          : device.screen.vertical;

      return {
        id,
        name: device.title,
        width: dimension.width,
        height: dimension.height,
        useragent: getUserAgent(device),
        capabilities: device.capabilities,
        added: device['show-by-default'],
        os: getOS(device),
        type: device.type,
        source: SOURCE.chrome,
      };
    });

  const userCustomDevices = settings.get(CUSTOM_DEVICES) || [];

  return [...userCustomDevices, ...chromeDefaultDevices];
}
