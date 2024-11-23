// ISO Format with offset: 2024-11-17T14:30:00+05:30
export const convertToDateTimeISO = (dateObject : Date) => {

  let isoString = dateObject.toISOString();
  let timezoneOffsetMinutes = dateObject.getTimezoneOffset();
  let offsetHours = Math.floor(Math.abs(timezoneOffsetMinutes) / 60);
  let offsetMinutes = Math.abs(timezoneOffsetMinutes) % 60;
  let offsetSign = timezoneOffsetMinutes >= 0 ? '-' : '+';
  let offsetString = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
  return isoString.slice(0, -5) + offsetString;

}

// ISO Format with offset: 2024-11-17T14:30:00+05:30
export const getCurrentDateTimeISO = (dateOnly? : boolean) => {

  const date = new Date();
  if (dateOnly) {
    const year = date.getFullYear().toString(); // Get last two digits of the year
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0'); // Pad single digits with leading zero
    return `${year}-${month}-${day}`;
  } else {
    return convertToDateTimeISO(date);
  }
}