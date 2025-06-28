
import React, { useState, useEffect, useCallback } from 'react';
import CircleDiagram from './components/CircleDiagram';
import { TimeData, Season } from './types';
import { daysInMonth, daysInYear, getDayOfYear, getSeasonInfo, WEEKDAYS, MONTH_NAMES, getISOWeekOfYear, getDaySuffix, getWeeksInYear, getCentury, toRoman } from './utils/time';

const App: React.FC = () => {
  const [currentTimeData, setCurrentTimeData] = useState<TimeData | null>(null);

  const calculateTimeData = useCallback((): TimeData => {
    const now = new Date();
    const ms = now.getMilliseconds();
    const s = now.getSeconds();
    const m = now.getMinutes();
    const h = now.getHours(); // 0-23
    const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
    const dayOfMonth = now.getDate(); // 1-31
    const month = now.getMonth(); // 0 (Jan) - 11 (Dec)
    const year = now.getFullYear();

    const millisecondProgress = ms / 1000;
    const secondsProgress = (s + ms / 1000) / 60; // Progress within a minute
    const minutesProgress = (m * 60 + s + ms / 1000) / 3600; // Progress within an hour
    const hoursProgress = (h * 3600 + m * 60 + s + ms / 1000) / (24 * 3600); // Progress within a day
    
    const timeFractionOfDay = (h * 3600 + m * 60 + s + ms / 1000) / (24 * 3600);
    const dayOfWeekProgress = (dayOfWeek + timeFractionOfDay) / 7; // Progress within a week

    const currentDaysInMonth = daysInMonth(year, month);
    const dayOfMonthProgress = (dayOfMonth - 1 + timeFractionOfDay) / currentDaysInMonth; // Progress within a month
    
    // Progress through the year, segmented by month (for "Year" dial).
    const monthProgressForYearDial = (month + ( (dayOfMonth -1 + timeFractionOfDay) / currentDaysInMonth) ) / 12;

    const seasonInfo = getSeasonInfo(now); // Progress within the current season

    const currentDaysInYear = daysInYear(year);
    const currentDayOfYear = getDayOfYear(now); // 1-based
    const yearProgressByDay = (currentDayOfYear - 1 + timeFractionOfDay) / currentDaysInYear; // True daily progress within a year

    const currentWeekOfYear = getISOWeekOfYear(now);
    const currentCentury = getCentury(year);
    // Year index within the current century (0-99). E.g., 2000 is 99th year of 20th C, 2001 is 0th year of 21st C.
    const yearInCenturyIndex = (year - 1) % 100;
    const centuryProgress = (yearInCenturyIndex + yearProgressByDay) / 100;


    return {
      millisecondProgress,
      secondsProgress,      // For "Minute" dial
      minutesProgress,      // For "Hour" dial
      hoursProgress,        // For "Day" dial
      dayOfWeekProgress,    // For "Week" dial
      dayOfMonthProgress,   // For "Month" dial
      monthProgress: monthProgressForYearDial, // For "Year" dial (annual progress by month)
      seasonProgress: seasonInfo.progress,   // For "Season" dial
      yearProgress: yearProgressByDay,       // True daily year progress
      centuryProgress,      // For "Century" dial

      currentSeconds: s,
      currentMinutes: m,
      currentHours: h,
      currentDayOfWeek: WEEKDAYS[dayOfWeek],
      currentDayOfMonth: dayOfMonth,
      currentMonth: MONTH_NAMES[month],
      currentMonthIndex: month,
      currentSeason: seasonInfo.name,
      currentYear: year,
      currentCentury: currentCentury,
      milliseconds: ms,
      currentWeekOfYear,
    };
  }, []);

  useEffect(() => {
    setCurrentTimeData(calculateTimeData()); // Initial calculation
    const intervalId = setInterval(() => {
      setCurrentTimeData(calculateTimeData());
    }, 10); // Update every 10ms (100 times per second)

    return () => clearInterval(intervalId);
  }, [calculateTimeData]);

  if (!currentTimeData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-3xl font-light" style={{ backgroundColor: 'rgba(6, 8, 24, 0.8)' /* Fallback initial loading bg */}}>
        Initializing Luminar Weave...
      </div>
    );
  }

  const {
    millisecondProgress, secondsProgress, minutesProgress, hoursProgress, dayOfWeekProgress, dayOfMonthProgress,
    monthProgress, // This is for the "Year" dial (annual progress by month)
    seasonProgress, centuryProgress,
    currentSeconds, currentMinutes, currentHours, currentDayOfWeek, currentDayOfMonth,
    currentMonth, currentMonthIndex, currentSeason, currentYear, currentCentury, milliseconds, currentWeekOfYear
  } = currentTimeData;

  const colorPalette = {
    second: "text-pink-400/100",
    minute: "text-pink-300/100",
    hour:   "text-rose-200/100",
    day:    "text-purple-300/100",
    week:   "text-sky-300/100",
    month:  "text-indigo-300/100",
    season: "text-violet-500/100",
    year:   "text-slate-300/100",
    century: "text-slate-400/100", 
    defaultTrack: "text-gray-700/40" // Semi-transparent track
  };
  
  const diagramSize = 160; 
  const diagramStrokeWidth = 10;

  const dateForFooter = new Date(currentYear, currentMonthIndex, currentDayOfMonth, currentHours, currentMinutes, currentSeconds, milliseconds);
  const timeStringWithOptions = dateForFooter.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  const firstMillisecondDigit = String(milliseconds).padStart(3, '0').charAt(0);

  const timePartsRegex = /(\d{1,2}:\d{2}:\d{2})\s(AM|PM)/i;
  const match = timeStringWithOptions.match(timePartsRegex);
  let liveTimeString;
  if (match && match.length === 3) {
      liveTimeString = `${match[1]}.${firstMillisecondDigit} ${match[2]}`;
  } else {
      liveTimeString = `${timeStringWithOptions}.${firstMillisecondDigit}`;
  }


  return (
    <div className="min-h-screen text-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 selection:bg-sky-600 selection:text-white relative z-10">
      <header className="mb-8 sm:mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400">
          Luminar Weave
        </h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">Witness the stellar dance, and find your echo in infinity.</p>
      </header>
      
      <main className="w-full max-w-5xl xl:max-w-6xl">
        <div className="grid grid-cols-3 gap-4">
          {/* Row 1 */}
          <CircleDiagram
            size={diagramSize} strokeWidth={diagramStrokeWidth}
            label="Second"
            progress={millisecondProgress}
            valueDisplay={`${currentSeconds} / 60`}
            colorClass={colorPalette.second} bgColorClass={colorPalette.defaultTrack}
            progressDisplayPrecision={0}
          />
          <CircleDiagram
            size={diagramSize} strokeWidth={diagramStrokeWidth}
            label="Minute"
            progress={secondsProgress}
            valueDisplay={`${currentMinutes} / 60`}
            colorClass={colorPalette.minute} bgColorClass={colorPalette.defaultTrack}
            progressDisplayPrecision={1}
          />
          <CircleDiagram
            size={diagramSize} strokeWidth={diagramStrokeWidth}
            label="Hour"
            progress={minutesProgress}
            valueDisplay={`${currentHours} / 24`}
            colorClass={colorPalette.hour} bgColorClass={colorPalette.defaultTrack}
            progressDisplayPrecision={2} 
          />
          
          {/* Row 2 */}
          <CircleDiagram
            size={diagramSize} strokeWidth={diagramStrokeWidth}
            label="Day"
            progress={hoursProgress}
            valueDisplay={`${currentDayOfMonth} / ${daysInMonth(currentYear, currentMonthIndex)}`}
            colorClass={colorPalette.day} bgColorClass={colorPalette.defaultTrack}
            progressDisplayPrecision={3} 
          />
          <CircleDiagram
            size={diagramSize} strokeWidth={diagramStrokeWidth}
            label="Week"
            progress={dayOfWeekProgress}
            valueDisplay={`${currentWeekOfYear} / ${getWeeksInYear(currentYear)}`}
            colorClass={colorPalette.week} bgColorClass={colorPalette.defaultTrack}
            progressDisplayPrecision={4}
          />
          <CircleDiagram
            size={diagramSize} strokeWidth={diagramStrokeWidth}
            label="Month"
            progress={dayOfMonthProgress}
            valueDisplay={currentMonth}
            colorClass={colorPalette.month} bgColorClass={colorPalette.defaultTrack}
            progressDisplayPrecision={4}
          />

          {/* Row 3 */}
          <CircleDiagram
            size={diagramSize} strokeWidth={diagramStrokeWidth}
            label="Season"
            progress={seasonProgress}
            valueDisplay={currentSeason}
            colorClass={colorPalette.season} bgColorClass={colorPalette.defaultTrack}
            progressDisplayPrecision={5}
          />
          <CircleDiagram
            size={diagramSize} strokeWidth={diagramStrokeWidth}
            label="Year"
            progress={monthProgress} 
            valueDisplay={String(currentYear)}
            colorClass={colorPalette.year} bgColorClass={colorPalette.defaultTrack}
            progressDisplayPrecision={5}
          />
          <CircleDiagram
            size={diagramSize} strokeWidth={diagramStrokeWidth}
            label="Century"
            progress={centuryProgress}
            valueDisplay={toRoman(currentCentury)}
            colorClass={colorPalette.century} bgColorClass={colorPalette.defaultTrack}
            progressDisplayPrecision={6}
          />
        </div>
      </main>
       
      <footer className="mt-8 sm:mt-12 text-center text-gray-500 text-xs sm:text-sm space-y-2">
        <p>Live Time: {liveTimeString}</p>
        <p>Powered by Gemini, woven with cosmic vibes.</p>
        <p>Alyson Mei, {currentYear}</p>
      </footer>
      
    </div>
  );
};

export default App;
