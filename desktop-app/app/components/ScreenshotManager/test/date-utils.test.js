// @flow
import DateUtils from '../date-utils';

describe('DateUtils', () => {
  let dateUtils;
  let date;
  beforeEach(() => {
    date = new Date();
    dateUtils = new DateUtils(date);
  });

  it('getTimeString: should return string representing time', () => {
    const time = date.toLocaleTimeString().replace(/:/g, '.');
    expect(dateUtils.getTimeString()).toBe(time);
  });

  it('getDateString: should return string representing date', () => {
    const time = date
      .toLocaleTimeString()
      .split('/')
      .reverse()
      .join('-');
    expect(dateUtils.getDateString()).toBe(time);
  });
});
