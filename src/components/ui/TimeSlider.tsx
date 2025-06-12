// TimeSlider Component

import React, { FC, useState, useEffect, useRef } from "react";

export interface TimeSliderProps {
  startTime: string;
  endTime: string;
  value: [string, string];
  onChange: (value: [string, string]) => void;
  step?: number; // in minutes
  markers?: { time: string; label?: string }[];
  label?: string;
}

const TimeSlider: FC<TimeSliderProps> = ({
  startTime,
  endTime,
  value,
  onChange,
  step = 15,
  markers = [],
  label,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<{
    isStartHandle: boolean;
  } | null>(null);
  const [startValue, endValue] = value;

  // Helpers: time string ↔ minutes since midnight
  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (mins: number): string => {
    const h = Math.floor(mins / 60)
      .toString()
      .padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const totalMinutes = endMinutes - startMinutes;

  // Convert a time string to a percentage [0–100]
  const getPosition = (t: string): number =>
    ((timeToMinutes(t) - startMinutes) / totalMinutes) * 100;

  const startPos = getPosition(startValue);
  const endPos = getPosition(endValue);

  // Drag handlers
  const handleMouseDown =
    (isStartHandle: boolean) => (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging({ isStartHandle });

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const rawPos = (moveEvent.clientX - rect.left) / rect.width;
        const clampedPos = Math.max(0, Math.min(1, rawPos));
        const rawMins =
          Math.round((clampedPos * totalMinutes + startMinutes) / step) * step;
        const newMins = Math.max(startMinutes, Math.min(endMinutes, rawMins));
        const newTime = minutesToTime(newMins);

        if (isStartHandle) {
          // Don't cross end handle
          if (newMins < timeToMinutes(endValue)) {
            onChange([newTime, endValue]);
          }
        } else {
          // Don't cross start handle
          if (newMins > timeToMinutes(startValue)) {
            onChange([startValue, newTime]);
          }
        }
      };

      const handleMouseUp = () => {
        setIsDragging(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

  // Build time markers every 2 steps by default
  const timeMarkers: { time: string; position: number }[] = [];
  for (let m = startMinutes; m <= endMinutes; m += step * 2) {
    timeMarkers.push({
      time: minutesToTime(m),
      position: ((m - startMinutes) / totalMinutes) * 100,
    });
  }

  return (
    <div className="mb-8">
      {label && <label className="input-label">{label}</label>}

      <div className="time-slider relative" ref={sliderRef}>
        {/* Track */}
        <div className="time-slider-track"></div>

        {/* Filled range */}
        <div
          className="time-slider-range"
          style={{ left: `${startPos}%`, right: `${100 - endPos}%` }}
        ></div>

        {/* Auto markers */}
        {timeMarkers.map((marker, i) => (
          <div
            key={i}
            className="time-marker"
            style={{ left: `${marker.position}%` }}
          >
            |<div className="time-marker-label">{marker.time}</div>
          </div>
        ))}

        {/* Custom markers */}
        {markers.map((marker, i) => (
          <div
            key={`custom-${i}`}
            className="absolute w-1 h-4 bg-warning-500 rounded-full"
            style={{
              left: `${getPosition(marker.time)}%`,
              top: "12px",
              zIndex: 1,
            }}
            title={marker.label}
          />
        ))}

        {/* Start handle */}
        <div
          style={{ left: `${startPos}%` }}
          className="time-slider-handle animate-fade-in-down animate-duration-300"
          onMouseDown={handleMouseDown(true)}
        >
          <div className="absolute -mt-7 -ml-4 bg-primary-100 px-2 py-0.5 rounded text-xs font-medium text-primary-700">
            {startValue}
          </div>
        </div>

        {/* End handle */}
        <div
          style={{ left: `${endPos}%` }}
          className="time-slider-handle animate-fade-in-down animate-duration-300"
          onMouseDown={handleMouseDown(false)}
        >
          <div className="absolute -mt-7 -ml-4 bg-primary-100 px-2 py-0.5 rounded text-xs font-medium text-primary-700">
            {endValue}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSlider;
