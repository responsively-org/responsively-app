// @flow
import chromeEmulatedDevices from './chromeEmulatedDevices';

type OS = 'iOS' | 'Android' | 'Windows Phone' | 'PC';

type DeviceType = 'phone' | 'tablet' | 'notebook';

type Capability = 'mobile' | 'touch';

export type Device = {
  id: number,
  added: boolean,
  width: number,
  height: number,
  name: string,
  useragent: string,
  capabilities: Array<Capability>,
  os: OS,
  type: DeviceType,
};

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
};

function getOS(device) {
  if (device.capabilities.indexOf('mobile') > -1) {
    const useragent = device['user-agent'];
    if (useragent.indexOf('like Mac OS X') > -1) {
      return 'iOS';
    }
    if (useragent.indexOf('Lumia') > -1) {
      return 'Windows Phone';
    }
    return 'Android';
  }
  return 'PC';
}

let idGen = 1;
export default chromeEmulatedDevices.extensions
  .sort((a, b) => a.order - b.order)
  .map(({order, device}) => {
    const dimension =
      device.type === 'notebook'
        ? device.screen.horizontal
        : device.screen.vertical;

    return {
      id: idGen++,
      name: device.title,
      width: dimension.width,
      height: dimension.height,
      useragent: device['user-agent'],
      capabilities: device.capabilities,
      added: device['show-by-default'],
      os: getOS(device),
      type: device.type,
    };
  });
