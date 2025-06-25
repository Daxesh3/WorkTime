import React from "react";

interface WorkingHoursTimelineProps {
  inTime: string;
  outTime: string;
  workingPeriods: { start: string; end: string }[];
  lunchPeriod: { start: string; end: string };
  calculation: {
    actualWorking: string | undefined;
    required: string | undefined;
    totalTime: string | undefined;
    lunch: string;
    lunchTime: string;
    takenLunchTime: string;
    flex: string;
    minBreak: string | undefined;
    dailyFlexTimeChangeDirection: "added" | "removed" | undefined;
    flexHours: string | undefined;
  };
  overtimePeriods?: { start: string; end: string; multiplier: number }[];
}

const WorkingHoursTimeline: React.FC<WorkingHoursTimelineProps> = ({
  inTime,
  outTime,
  workingPeriods,
  lunchPeriod,
  calculation,
  overtimePeriods = [],
}) => {
  // Convert time string to percentage for positioning
  const timeToPercentage = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    return (totalMinutes / (24 * 60)) * 100;
  };

  // Calculate duration between two times in hours
  const calculateDuration = (start: string, end: string) => {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    return ((endTotalMinutes - startTotalMinutes) / 60).toFixed(1);
  };

  // Overtime color mapping
  const overtimeColors: Record<number, string> = {
    1: "from-yellow-400 to-yellow-500",
    1.5: "from-orange-400 to-orange-500",
    2: "from-red-500 to-red-700",
  };

  return (
    <div className="bg-white    border-slate-200 ">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Daily Work Schedule
        </h3>
        <p className="text-slate-600 text-sm">
          Visual timeline of your working hours
        </p>
      </div>

      {/* Main Timeline Container */}
      <div className="relative">
        {/* Timeline Base Line */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-slate-300 rounded-full"></div>
        {/* Hour Markers */}
        {Array.from({ length: 25 }).map((_, index) => (
          <div
            key={index}
            className="absolute top-0 w-px h-3 bg-slate-400"
            style={{ left: `${(index / 24) * 100}%` }}
          >
            <div className="absolute left-[-7px] top-4 text-xs font-medium text-slate-500">
              {String(index).padStart(2, "0")}
            </div>
          </div>
        ))}
        {/* IN Marker */}
        <div
          className="absolute -top-2 "
          style={{ left: `${timeToPercentage(inTime)}%` }}
        >
          <div className="absolute top-6 -translate-x-1/2 whitespace-nowrap  group-hover:block z-[1]">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-1 h-1 bg-emerald-50 border-l border-t border-emerald-200"></div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1 shadow-sm">
              <div className="text-sm font-semibold text-emerald-700">IN</div>
              <div className="text-xs text-emerald-600">{inTime}</div>
            </div>
          </div>
        </div>
        {/* OUT Marker */}
        <div
          className="absolute -top-2 "
          style={{ left: `${timeToPercentage(outTime)}%` }}
        >
          <div className="absolute top-6 -translate-x-1/2 whitespace-nowrap  group-hover:block z-[1]">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-1 h-1 bg-emerald-50 border-l border-t border-emerald-200"></div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1 shadow-sm">
              <div className="text-sm font-semibold text-emerald-700">OUT</div>
              <div className="text-xs text-emerald-600">{outTime}</div>
            </div>
          </div>
        </div>
        {/* Working Periods */}
        {workingPeriods.map((period, index) => (
          <div
            key={index}
            className="absolute top-0 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-md group"
            style={{
              left: `${timeToPercentage(period.start)}%`,
              width: `${
                timeToPercentage(period.end) - timeToPercentage(period.start)
              }%`,
            }}
          >
            {/* Working Period Label */}
            <div className="hidden group-hover:block absolute top-8 left-1/2 -translate-x-1/2 w-max z-[1]">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-lg min-w-[200px]">
                <div className="text-sm font-semibold text-blue-800 mb-1">
                  Working time: {calculateDuration(period.start, period.end)}{" "}
                  hours
                </div>
                <div className="text-xs text-blue-600">
                  {period.start} to {period.end}
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Lunch Period */}
        <div
          className="absolute top-0 h-2 bg-gradient-to-r from-rose-400 to-rose-500 rounded-full shadow-md group"
          style={{
            left: `${timeToPercentage(lunchPeriod.start)}%`,
            width: `${
              timeToPercentage(lunchPeriod.end) -
              timeToPercentage(lunchPeriod.start)
            }%`,
          }}
        >
          {/* Lunch Label */}
          <div className="hidden group-hover:block absolute top-8 left-1/2 -translate-x-1/2 w-max z-[1]">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 shadow-lg">
              <div className="text-sm font-semibold text-rose-700">
                Lunch time
              </div>
              <div className="text-xs text-rose-600">
                {lunchPeriod.start} to {lunchPeriod.end}
              </div>
            </div>
          </div>
        </div>
        {/* Overtime Periods */}
        {overtimePeriods.map((period, idx) => (
          <div
            key={idx}
            className={`absolute top-0 h-2 bg-gradient-to-r ${
              overtimeColors[period.multiplier] || "from-gray-400 to-gray-500"
            } rounded-full shadow-md group`}
            style={{
              left: `${timeToPercentage(period.start)}%`,
              width: `${
                timeToPercentage(period.end) - timeToPercentage(period.start)
              }%`,
              zIndex: 2,
              opacity: 0.85,
            }}
          >
            {/* Overtime Label */}
            <div className="hidden group-hover:block absolute top-8 left-1/2 -translate-x-1/2 w-max z-[2]">
              <div className="bg-white border border-yellow-200 rounded-xl p-3 shadow-lg">
                <div className="text-sm font-semibold text-yellow-700">
                  Overtime @{period.multiplier}x
                </div>
                <div className="text-xs text-yellow-600">
                  {period.start} to {period.end}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Calculation Summary */}
      <div className="mt-20 pt-14 border-t border-slate-200">
        {/* <h4 className="text-lg font-semibold text-slate-800 mb-4">
          Daily Summary
        </h4> */}
        <div className="flex flex-col gap-2 bg-neutral-50 p-4 w-max rounded-lg">
          <div className="flex gap-2 justify-between">
            <span className="text-neutral-700">Total time:</span>
            <span className="font-medium text-neutral-900 ">
              {calculation.totalTime}
            </span>
          </div>
          <div className="flex gap-2 justify-between">
            <span className="text-neutral-700">Lunch time:</span>
            <span className="font-medium text-neutral-900 ">
              {calculation.lunchTime}
            </span>
          </div>
          <div className="flex gap-2 justify-between">
            <span className="text-neutral-700">Taken breaks:</span>
            <span className="font-medium text-neutral-900 ">
              {calculation.takenLunchTime}
            </span>
          </div>
          <div className="flex gap-2 justify-between">
            <span className="text-neutral-700">Actual hours:</span>
            <span className="font-medium text-neutral-900 ">
              {calculation.actualWorking}
            </span>
          </div>
          <div className="flex gap-2 justify-between">
            <span className="text-neutral-700">Required hours:</span>
            <span className="font-medium text-neutral-900 ">
              {calculation.required}
            </span>
          </div>

          {/* <div className="flex gap-2 justify-between">
            <span className="text-neutral-700">Min lunch:</span>
            <span className="font-medium text-neutral-900 ">
              {calculation.minBreak}
            </span>
          </div> */}
          <div className="flex gap-2 justify-between">
            <span className="text-neutral-700">Flex hours:</span>
            <span className="font-medium text-neutral-900 ">
              {calculation.flexHours}
            </span>
          </div>

          <div className="flex gap-2 justify-between">
            <span className="text-neutral-700">Flex bank:</span>
            <span className="font-medium text-neutral-900 ">
              {calculation.flex}
            </span>
          </div>

          {/* <div className="flex gap-2 justify-between">
            <span className="text-neutral-700">Taken breaks:</span>
            <span className="font-medium text-neutral-900 ">
              {calculation.takenLunchTime}
            </span>
          </div> */}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex flex-wrap gap-6 text-sm">
          {/* <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
            <span className="text-slate-700">Clock In/Out</span>
          </div> */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            <span className="text-slate-700">Working Time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"></div>
            <span className="text-slate-700">Lunch Break</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
            <span className="text-slate-700">Overtime @ 1x</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"></div>
            <span className="text-slate-700">Overtime @ 1.5x</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-gradient-to-r from-red-500 to-red-700 rounded-full"></div>
            <span className="text-slate-700">Overtime @ 2x</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingHoursTimeline;
