// @flow

export type Data = {
  now: Date,
  devices: Array<any>,
  selectedDevices: {
    deviceChecks: any,
    isMergeImages: boolean,
  },
  delay: number,
};

export type WindowSizeAndScrollPosition = {
  previousScrollPosition: Coordinates,
  scrollHeight: number,
  scrollWidth: number,
  viewPortHeight: number,
  viewPortWidth: number,
};

export type Coordinates = {
  left: number,
  top: number,
};
