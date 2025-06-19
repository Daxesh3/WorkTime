import React from "react";

interface WorkingHoursTimelineProps {
  inTime: string;
  outTime: string;
  workingPeriods: { start: string; end: string }[];
  lunchPeriod: { start: string; end: string };
  calculation: {
    actualWorking: string;
    required: string;
    lunch: string;
    flex: string;
  };
}

const WorkingHoursTimeline: React.FC<WorkingHoursTimelineProps> = ({
  inTime,
  outTime,
  workingPeriods,
  lunchPeriod,
  calculation,
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
      </div>

      {/* Calculation Summary */}
      <div className="mt-20 pt-8 border-t border-slate-200">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">
          Daily Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className="bg-slate-50 rounded-lg p-4 border border-slate-200"
            style={{
              backgroundColor:
                parseFloat(calculation.actualWorking) <
                parseFloat(calculation.required)
                  ? "rgb(255 241 226)"
                  : undefined,
              borderColor:
                parseFloat(calculation.actualWorking) <
                parseFloat(calculation.required)
                  ? "rgb(219 181 136)"
                  : undefined,
            }}
          >
            <div className="text-sm text-slate-600 mb-1">Actual Working</div>
            <div className="text-lg font-semibold text-slate-800">
              {calculation.actualWorking}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Required Hours</div>
            <div className="text-lg font-semibold text-slate-800">
              {calculation.required}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Lunch Time</div>
            <div className="text-lg font-semibold text-slate-800">
              {calculation.lunch}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Flex Bank</div>
            <div className="text-lg font-semibold text-slate-800">
              {calculation.flex}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
            <span className="text-slate-700">Clock In/Out</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            <span className="text-slate-700">Working Time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"></div>
            <span className="text-slate-700">Lunch Break</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingHoursTimeline;
