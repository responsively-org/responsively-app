// @flow
import chromeEmulatedDevices from './chromeEmulatedDevices';

export type Device = {
  id: number,
  added: boolean,
  width: number,
  height: number,
  name: string,
  useragent: string,
  capabilities: Array<string>,
};
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
    };
  });
