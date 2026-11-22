// These channels stay between one preview guest and its owning renderer.
export const EVENT_MIRRORING_CHANNELS = {
  READY: 'event-mirroring-ready',
  SET: 'set-event-mirroring',
  APPLIED: 'event-mirroring-applied',
} as const;

export interface EventMirroringRequest {
  requestId: number;
  enabled: boolean;
}

export interface EventMirroringResponse extends EventMirroringRequest {
  error?: string;
}
