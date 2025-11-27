export interface VisualBaselineMeta {
  deviceId: string;
  deviceName: string;
  address: string;
  filePath: string;
  width: number;
  height: number;
  createdAt: number;
}

export interface VisualDiffRequest {
  webContentsId: number;
  deviceId: string;
  deviceName: string;
  address: string;
}

export interface VisualDiffResultPayload {
  deviceId: string;
  deviceName: string;
  address: string;
  createdAt: number;
  baselineDataUrl: string;
  currentDataUrl: string;
  diffDataUrl: string;
  mismatchPercentage: number;
}

export const VISUAL_DIFF_CHANNELS = {
  CAPTURE_BASELINE: 'visualDiff:captureBaseline',
  COMPARE_WITH_BASELINE: 'visualDiff:compareWithBaseline',
} as const;

export const createBaselineKey = (deviceId: string, address: string) =>
  `${deviceId}::${address}`;
