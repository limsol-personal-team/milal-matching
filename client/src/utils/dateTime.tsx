export const convertToDateTimeISO = (dateString : string) => {

  let d = new Date(dateString);
  let isoString = d.toISOString();
  let timezoneOffsetMinutes = d.getTimezoneOffset();
  let offsetHours = Math.floor(Math.abs(timezoneOffsetMinutes) / 60);
  let offsetMinutes = Math.abs(timezoneOffsetMinutes) % 60;
  let offsetSign = timezoneOffsetMinutes >= 0 ? '-' : '+';
  let offsetString = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;

  return isoString.slice(0, -5) + offsetString;

}