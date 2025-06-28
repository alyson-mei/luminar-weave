
export enum Season {
  WINTER = 'Winter',
  SPRING = 'Spring',
  SUMMER = 'Summer',
  AUTUMN = 'Autumn',
}

export interface TimeData {
  millisecondProgress: number; // Progress of milliseconds within the current second (0 to 1)
  secondsProgress: number; // Progress of seconds within the current minute (0 to 1)
  minutesProgress: number; // Progress of minutes within the current hour (0 to 1)
  hoursProgress: number;   // Progress of hours within the current day (0 to 1)
  dayOfWeekProgress: number;
  dayOfMonthProgress: number;
  monthProgress: number; // Progress of months within the current year (0 to 1) - used for "Year" dial
  seasonProgress: number;
  yearProgress: number; // Progress of days within the current year (0 to 1) - true daily year progress
  centuryProgress: number; // Progress within the current century

  currentSeconds: number;
  currentMinutes: number;
  currentHours: number;
  currentDayOfWeek: string;
  currentDayOfMonth: number;
  currentMonth: string; // Month name
  currentMonthIndex: number; // 0-11 for Date constructor
  currentSeason: Season;
  currentYear: number;
  currentCentury: number; // e.g., 21 for 21st century
  milliseconds: number;
  currentWeekOfYear: number; // Added for week display
}