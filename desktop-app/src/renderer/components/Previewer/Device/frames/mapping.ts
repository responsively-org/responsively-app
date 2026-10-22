import type {FrameId} from './manifest';

/**
 * Device id (common/deviceList) → frame id. Devices absent here have no real
 * frame and fall back to the generic CSS bezel.
 */
export const DEVICE_FRAME_IDS: Readonly<Partial<Record<string, FrameId>>> = {
  // Apple. The grouped 5/SE and 6/7/8 presets have matching grouped artwork
  // in the Chrome DevTools source catalog.
  '10001': 'iphone-4',
  '10002': 'iphone-5',
  // This 375×667 preset is the later SE, not the 320×568 first generation.
  '10003': 'iphone-se-2',
  '10004': 'iphone-6',
  '10005': 'iphone-6-plus',
  '10006': 'iphone-x',
  '10007': 'iphone-xr',
  '10008': 'iphone-12-pro',
  '10013': 'ipad',
  // The source is based on "Apple MacBook Pro SVG"; other laptop models
  // retain their generic bezel rather than borrowing a MacBook body.
  '10015': 'laptop',
  '10016': 'iphone-14',
  '10018': 'iphone-14-pro',
  '10019': 'iphone-15',
  '10020': 'iphone-15-plus',
  '10021': 'iphone-15-pro',
  '10022': 'iphone-16',
  '10023': 'iphone-16-plus',
  '10024': 'iphone-16-pro',
  '10025': 'iphone-17',
  '10026': 'iphone-17-pro',
  '10027': 'iphone-17-pro-max',
  // The device catalog calls the iPhone Air "iPhone 17 Air".
  '10028': 'iphone-air',
  '10029': 'iphone-15-pro-max',
  '10030': 'iphone-16-pro-max',

  // Google. The Nexus 7 preset uses the 2013 model's 600×960 CSS viewport.
  '20001': 'nexus-4',
  '20002': 'nexus-5',
  '20003': 'nexus-5x',
  '20004': 'nexus-6',
  '20005': 'nexus-6p',
  '20006': 'nexus-7',
  '20007': 'nexus-10',
  '20008': 'pixel-2',
  '20009': 'pixel-2-xl',
  '20010': 'pixel-3',
  '20011': 'pixel-3-xl',
  '20012': 'pixel-4',
  '20013': 'pixel-5',
  '20014': 'nest-hub-max',
  '20015': 'nest-hub',
  '20016': 'pixel-7',
  '20017': 'pixel-7a',
  '20018': 'pixel-7-pro',
  '20019': 'pixel-8',
  '20020': 'pixel-8-pro',
  '20021': 'pixel-8a',
  '20023': 'pixel-tablet',
  '20031': 'pixel-9',
  '20032': 'pixel-9-pro',
  '20034': 'pixel-9a',
  '20035': 'pixel-10',
  '20036': 'pixel-10-pro',

  '50007': 'moto-g4',
};
