export type NetworkProfile =
  | 'online'
  | 'slow-3g'
  | 'fast-3g'
  | 'regular-4g'
  | 'fast-4g'
  | 'offline';

export interface NetworkProfileConfig {
  label: string;
  downloadThroughput: number; // bytes per second
  uploadThroughput: number; // bytes per second
  latency: number; // milliseconds
  offline: boolean;
}

export const networkProfiles: Record<NetworkProfile, NetworkProfileConfig> = {
  online: {
    label: 'Online',
    downloadThroughput: -1, // -1 means no throttling
    uploadThroughput: -1,
    latency: 0,
    offline: false,
  },
  'slow-3g': {
    label: 'Slow 3G',
    downloadThroughput: 400 * 1024, // 400 Kbps = 400 * 1024 bytes/sec
    uploadThroughput: 400 * 1024, // 400 Kbps
    latency: 2000, // 2000ms
    offline: false,
  },
  'fast-3g': {
    label: 'Fast 3G',
    downloadThroughput: 1.6 * 1024 * 1024, // 1.6 Mbps
    uploadThroughput: 750 * 1024, // 750 Kbps
    latency: 562, // 562ms
    offline: false,
  },
  'regular-4g': {
    label: 'Regular 4G',
    downloadThroughput: 4 * 1024 * 1024, // 4 Mbps
    uploadThroughput: 3 * 1024 * 1024, // 3 Mbps
    latency: 20, // 20ms
    offline: false,
  },
  'fast-4g': {
    label: 'Fast 4G',
    downloadThroughput: 9 * 1024 * 1024, // 9 Mbps
    uploadThroughput: 9 * 1024 * 1024, // 9 Mbps
    latency: 0, // 0ms
    offline: false,
  },
  offline: {
    label: 'Offline',
    downloadThroughput: -1,
    uploadThroughput: -1,
    latency: 0,
    offline: true,
  },
};
