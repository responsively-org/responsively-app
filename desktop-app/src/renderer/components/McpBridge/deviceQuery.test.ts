import {describe, expect, it} from 'vitest';
import type {Device} from 'common/deviceList';
import {resolveDeviceQuery} from './deviceQuery';

const device = (id: string, name: string): Device => ({
  id,
  name,
  width: 390,
  height: 844,
  userAgent: 'ua',
  type: 'phone',
  dpr: 3,
  isTouchCapable: true,
  isMobileCapable: true,
  capabilities: ['touch', 'mobile'],
});

const devicesMap = {
  '10008': device('10008', 'iPhone 12 Pro'),
  '10015': device('10015', 'iPhone SE'),
};

describe('resolveDeviceQuery', () => {
  it('resolves by id first', () => {
    expect(resolveDeviceQuery(devicesMap, '10008')?.name).toBe('iPhone 12 Pro');
  });

  it('resolves by exact name, case-insensitively', () => {
    expect(resolveDeviceQuery(devicesMap, 'iPhone 12 Pro')?.id).toBe('10008');
    expect(resolveDeviceQuery(devicesMap, 'iphone se')?.id).toBe('10015');
    expect(resolveDeviceQuery(devicesMap, '  iPhone SE  ')?.id).toBe('10015');
  });

  it('returns undefined for partial or unknown queries', () => {
    expect(resolveDeviceQuery(devicesMap, 'iPhone')).toBeUndefined();
    expect(resolveDeviceQuery(devicesMap, '99999')).toBeUndefined();
  });
});
