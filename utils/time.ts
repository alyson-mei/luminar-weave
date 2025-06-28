import { Season } from '../types';

export const daysInMonth = (year: number, month: number): number => {
  // month is 0-indexed (0 for January, 11 for December)
  return new Date(year, month + 1, 0).getDate();
};

export const daysInYear = (year: number): number => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
};

export const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0); // Day 0 of the year
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay); // Returns 1 for Jan 1st, up to 365/366
};

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const getSeasonInfo = (date: Date): { name: Season; progress: number } => {
  const month = date.getMonth(); // 0 (Jan) - 11 (Dec)
  const day = date.getDate(); // 1-31
  const year = date.getFullYear();
  const timeFraction = (date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() / 1000) / (24 * 3600);

  let currentSeason: Season;
  let daysIntoSeasonPeriod: number; // 1-based day count within the 3-month period
  let totalDaysInSeasonPeriod: number;

  if (month >= 2 && month <= 4) { // Spring: March (2), April (3), May (4)
    currentSeason = Season.SPRING;
    const marDays = daysInMonth(year, 2);
    const aprDays = daysInMonth(year, 3);
    const mayDays = daysInMonth(year, 4);
    totalDaysInSeasonPeriod = marDays + aprDays + mayDays;
    if (month === 2) daysIntoSeasonPeriod = day;
    else if (month === 3) daysIntoSeasonPeriod = marDays + day;
    else daysIntoSeasonPeriod = marDays + aprDays + day; // month === 4
  } else if (month >= 5 && month <= 7) { // Summer: June (5), July (6), August (7)
    currentSeason = Season.SUMMER;
    const junDays = daysInMonth(year, 5);
    const julDays = daysInMonth(year, 6);
    const augDays = daysInMonth(year, 7);
    totalDaysInSeasonPeriod = junDays + julDays + augDays;
    if (month === 5) daysIntoSeasonPeriod = day;
    else if (month === 6) daysIntoSeasonPeriod = junDays + day;
    else daysIntoSeasonPeriod = junDays + julDays + day; // month === 7
  } else if (month >= 8 && month <= 10) { // Autumn: September (8), October (9), November (10)
    currentSeason = Season.AUTUMN;
    const sepDays = daysInMonth(year, 8);
    const octDays = daysInMonth(year, 9);
    const novDays = daysInMonth(year, 10);
    totalDaysInSeasonPeriod = sepDays + octDays + novDays;
    if (month === 8) daysIntoSeasonPeriod = day;
    else if (month === 9) daysIntoSeasonPeriod = sepDays + day;
    else daysIntoSeasonPeriod = sepDays + octDays + day; // month === 10
  } else { // Winter: December (11), January (0), February (1)
    currentSeason = Season.WINTER;
    let decYear = year;
    let janYear = year;
    let febYear = year;

    if (month === 0 || month === 1) { // Current month is Jan or Feb
      decYear = year - 1; // December was last year
    } else { // Current month is Dec (month === 11)
      janYear = year + 1; // January is next year
      febYear = year + 1; // February is next year
    }
    
    const decDays = daysInMonth(decYear, 11);
    const janDays = daysInMonth(janYear, 0);
    const febDays = daysInMonth(febYear, 1);
    totalDaysInSeasonPeriod = decDays + janDays + febDays;

    if (month === 11) { // Current month is December
        daysIntoSeasonPeriod = day;
    } else if (month === 0) { // Current month is January
        daysIntoSeasonPeriod = decDays + day;
    } else { // Current month is February (month === 1)
        daysIntoSeasonPeriod = decDays + janDays + day;
    }
  }
  
  // daysIntoSeasonPeriod is 1-based. Progress calculation needs 0-based start.
  const progress = (daysIntoSeasonPeriod - 1 + timeFraction) / totalDaysInSeasonPeriod;
  return { name: currentSeason, progress: Math.min(1, Math.max(0, progress)) };
};

// Calculates ISO 8601 week number
export const getISOWeekOfYear = (date: Date): number => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7; // ISO day of week; 0 is Monday, 6 is Sunday
  target.setDate(target.getDate() - dayNr + 3); // Move to nearest Thursday: current date + 3 - dayNr
  const firstThursday = new Date(target.getFullYear(), 0, 4); // First Thursday of year

  // Calculate the difference in days to the first Thursday of the year
  // Add 1 to get the week number
  return 1 + Math.ceil((target.getTime() - firstThursday.getTime()) / 86400000 / 7);
};

// Gets the ordinal suffix for a day number
export const getDaySuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th'; // covers 11th, 12th, 13th
  switch (day % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
};

// Calculates the total number of ISO weeks in a given year (either 52 or 53)
export const getWeeksInYear = (year: number): number => {
  // The ISO week number of December 28th is always the last week number of that year.
  return getISOWeekOfYear(new Date(year, 11, 28)); // month is 0-indexed, so 11 is December
};

// Calculates the century for a given year
export const getCentury = (year: number): number => {
  return Math.ceil(year / 100);
};

// Converts an Arabic numeral to a Roman numeral
export const toRoman = (num: number): string => {
  if (num < 1 || num > 3999) { // Standard Roman numerals typically go up to 3999
    // Handle out-of-range numbers, or extend if necessary for your use case.
    // For centuries (e.g., 21, 22), this range is sufficient.
    return String(num); // Fallback to string representation if out of typical Roman range
  }

  const romanNumerals: { value: number; numeral: string }[] = [
    { value: 1000, numeral: 'M' },
    { value: 900, numeral: 'CM' },
    { value: 500, numeral: 'D' },
    { value: 400, numeral: 'CD' },
    { value: 100, numeral: 'C' },
    { value: 90, numeral: 'XC' },
    { value: 50, numeral: 'L' },
    { value: 40, numeral: 'XL' },
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' },
  ];

  let result = '';
  for (const { value, numeral } of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
};
