export function getProgress(
  startTime: number | undefined,
  endTime: number | undefined,
  now: number | undefined,
) {
  if (!startTime || !endTime || !now) return 0;

  const length = endTime - startTime;
  const elapsed = endTime - now / 1000;

  return 100 - (elapsed * 100) / length;
}
