
import React, { useId } from 'react';

interface CircleDiagramProps {
  progress: number; // 0 to 1
  label: string;
  valueDisplay?: string; // e.g., "30s", "12h", "Monday" - This prop is optional
  size?: number;
  strokeWidth?: number;
  colorClass?: string; // Tailwind CSS class for the progress arc color, e.g., "text-blue-500"
  bgColorClass?: string; // Tailwind CSS class for the background track color, e.g., "text-gray-200"
  progressDisplayPrecision?: number; // Number of decimal places for the percentage display
}

const CircleDiagram: React.FC<CircleDiagramProps> = ({
  progress,
  label,
  valueDisplay, 
  size = 160, 
  strokeWidth = 10, 
  colorClass = 'text-sky-500', 
  bgColorClass = 'text-gray-700', 
  progressDisplayPrecision = 2, // Default to 2 decimal places
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Ensure progress is clamped between 0 and 1 to avoid visual glitches
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const offset = circumference * (1 - clampedProgress);
  const percentage = (clampedProgress * 100).toFixed(progressDisplayPrecision);

  const uniqueIdPart = useId();
  // Ensure ID is valid for XML by removing/replacing restricted characters like ':'
  const gradientId = `progress-gradient-${uniqueIdPart.replace(/:/g, '_')}`;


  return (
    <div className="flex flex-col items-center justify-start p-2 text-center w-full">
      <div className="relative w-full" style={{ paddingTop: '100%' /* Aspect ratio 1:1 for the SVG container */ }}>
        <svg 
          // Apply colorClass here to set currentColor for the SVG context
          className={`absolute top-0 left-0 w-full h-full -rotate-90 ${colorClass}`} 
          viewBox={`0 0 ${size} ${size}`} // Keep viewBox square based on size prop
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {/* Start with full opacity of currentColor (respecting Tailwind opacity like /90) */}
              <stop offset="5%" stopColor="currentColor" stopOpacity="1" />
              {/* Fade to a less opaque version of currentColor */}
              <stop offset="95%" stopColor="currentColor" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            className={bgColorClass} // Uses its own color via bgColorClass
            stroke="currentColor"    // currentColor here is from bgColorClass
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress arc */}
          <circle
            // Color is now applied via the gradient linked by stroke
            stroke={`url(#${gradientId})`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round" // Makes the end of the arc rounded
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Percentage Text */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            // Inherits color from the SVG's className (colorClass). Font styles applied directly.
            className="text-2xl font-semibold" 
            fill="currentColor" 
            transform={`rotate(90 ${size / 2} ${size / 2})`} // Counter-rotate to make text upright
          >
            {percentage}%
          </text>
        </svg>
      </div>
      {/* Display valueDisplay (dynamic) and label (static) below the circle */}
      <div className="mt-2 text-center" style={{ minHeight: '3.5rem' }}> {/* Adjusted min-height for two lines */}
        {valueDisplay && (
          <div className="text-base sm:text-lg font-medium text-gray-200 leading-tight">{valueDisplay}</div>
        )}
        <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider mt-1">{label}</div>
      </div>
    </div>
  );
};

export default React.memo(CircleDiagram);
