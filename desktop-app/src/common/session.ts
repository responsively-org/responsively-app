import { PREVIEW_LAYOUTS, PreviewLayout } from './constants';

export type DeviceRotationMap = Record<string, boolean>;

export interface SessionSnapshot {
  address: string;
  activeSuiteId: string;
  activeSuiteName: string;
  deviceIds: string[];
  layout: PreviewLayout;
  rotateAllDevices: boolean;
  perDeviceRotations: DeviceRotationMap;
  timestamp: number;
  shouldPrompt: boolean;
}

export const isPreviewLayout = (value: unknown): value is PreviewLayout => {
  return Object.values(PREVIEW_LAYOUTS).includes(value as PreviewLayout);
};
