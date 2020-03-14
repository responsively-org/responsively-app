// @flow
import chromeEmulatedDevices from './chromeEmulatedDevices';

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

type OSType = OS.ios | OS.android | OS.windowsPhone | OS.pc;

type DeviceType = DEVICE_TYPE.phone | DEVICE_TYPE.tablet | DEVICE_TYPE.desktop;

type Capability = CAPABILITIES.mobile | CAPABILITIES.touch;

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

let idGen = 1;
export default chromeEmulatedDevices.extensions
    .sort((a, b) => a.order - b.order)
    .map(({order, device}) => {
        const dimension =
            device.type === DEVICE_TYPE.desktop
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
