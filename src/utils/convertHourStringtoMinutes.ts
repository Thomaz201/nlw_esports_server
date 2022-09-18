// 15:00 -> 900

export function convertHourStringToMinutes(hourString: string) {
  const [hours, minutes] = hourString.split(':').map(Number);

  const minuterAmount = (hours * 60) + minutes;

  return minuterAmount;
}