const METRIC_DATE_TIMES = [
  [31536000, 'year'],
  [2592000, 'month'],
  [86400, 'day'],
  [3600, 'hour'],
  [60, 'minute']
];

export class SinceValueConverter {
  toView(value) {
    const seconds = Math.floor((+ new Date() - Date.parse(value)) / 1000);

    const { time, epoch } = this.getTimeSince(seconds);

    return `${time} ${epoch + (time === 1 ? '' : 's')} ago`;
  }
  getTimeSince(seconds, index = 0) {
    const metricDateTime = METRIC_DATE_TIMES[index];
    if (!metricDateTime) {
      return { time: seconds, epoch: 'second' };
    }
    const interval = Math.floor(seconds / metricDateTime[0]);

    return interval > 1 ? { time: interval, epoch: metricDateTime[1] } : this.getTimeSince(seconds, ++index);
  }
}
