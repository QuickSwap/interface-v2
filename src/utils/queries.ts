import dayjs from 'dayjs';

export function useDeltaTimestamps(): [number, number, number, number] {
  const utcCurrentTime = dayjs();
  const t1 = utcCurrentTime
    .subtract(1, 'day')
    .startOf('minute')
    .unix();
  const t2 = utcCurrentTime
    .subtract(2, 'day')
    .startOf('minute')
    .unix();
  const tWeek = utcCurrentTime
    .subtract(1, 'week')
    .startOf('minute')
    .unix();
  const tMonth = utcCurrentTime
    .subtract(1, 'month')
    .startOf('minute')
    .unix();
  return [t1, t2, tWeek, tMonth];
}
