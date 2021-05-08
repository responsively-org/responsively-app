// @flow

export type Data = {
  now: Date,
  devices: Array<any>,
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
