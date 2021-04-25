class DateUtils {
  date: Date;

  constructor(date: Date) {
    this.date = date;
  }

  getTimeString(): string {
    return this.date.toLocaleTimeString().replace(/:/g, '.');
  }

  getDateString(): string {
    return this.date
      .toLocaleDateString()
      .split('/')
      .reverse()
      .join('-');
  }
}

export default DateUtils;
