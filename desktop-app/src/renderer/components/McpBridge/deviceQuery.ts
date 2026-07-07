import type {Device} from 'common/deviceList';

/**
 * Resolves an MCP device query (device id, or exact name case-insensitively)
 * against the devices map.
 */
export const resolveDeviceQuery = (
  devicesMap: {[key: string]: Device},
  query: string
): Device | undefined => {
  if (devicesMap[query] !== undefined) {
    return devicesMap[query];
  }
  const lowerQuery = query.trim().toLowerCase();
  return Object.values(devicesMap).find((device) => device.name.toLowerCase() === lowerQuery);
};
