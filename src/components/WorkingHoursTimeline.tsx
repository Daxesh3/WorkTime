import { ca } from "date-fns/locale";
import React from "react";

interface WorkingHoursTimelineProps {
  inTime: string;
  outTime: string;
  workingPeriods: { start: string; end: string }[];
  lunchPeriod: { start: string; end: string };
  calculation: {
    actualWorking: string;
    required: string;
    givenLunch: string;
    takenLunch: string;
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
  console.log("🚀 ~ calculation:", calculation);
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
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">
              Required Working Hours
            </div>
            <div className="text-lg font-semibold text-slate-800">
              {calculation.required}
            </div>
            <div className="text-sm text-slate-600 mb-1 mt-2">
              Actual Working
            </div>
            <div className="text-lg font-semibold text-slate-800">
              {calculation.actualWorking}
            </div>
          </div>
          {/* <div
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
          ></div> */}

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Given Lunch Time</div>
            <div className="text-lg font-semibold text-slate-800">
              {calculation.givenLunch}
            </div>
            <div className="text-sm text-slate-600 mb-1 mt-2">
              Taken Lunch Time
            </div>
            <div className="text-lg font-semibold text-slate-800">
              {calculation.takenLunch}
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

      {/* Daily Summary */}
      <div className="mt-20 pt-8 border-t border-slate-200">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">
          Daily Summary for [Date]
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Required Working Hours */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">
              Required Working Hours
            </div>
            <div className="text-lg font-semibold text-slate-800">
              [Value of Required Daily Working Hours in HH:MM format]
            </div>
          </div>

          {/* Working Hour Comparison */}
          <div className="mt-6">
            <p className="text-sm text-slate-500 mb-2">
              Working Hours Comparison
            </p>
            <div className="w-full bg-slate-200 h-3 rounded-full relative">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (parseFloat(calculation.actualWorking) /
                      parseFloat(calculation.required)) *
                      100,
                    100
                  )}%`,
                }}
              ></div>
              {/* Optional target marker */}
              {/* <div
                className="absolute top-0 -mt-1 h-5 w-[2px] bg-red-500"
                style={{
                  left: "100%", // Required is 100%
                }}
              ></div> */}
            </div>
            <div className="flex justify-between text-xs mt-1 text-slate-500">
              <span>0h</span>
              <span>{calculation.required} (Target)</span>
            </div>
          </div>

          {/* Given Lunch Time */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Given Lunch Time</div>
            <div className="text-lg font-semibold text-slate-800">
              {calculation.givenLunch}
            </div>
          </div>

          {/* Taken Lunch Time */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Taken Lunch Time</div>
            <div className="text-lg font-semibold text-slate-800">
              {calculation.takenLunch}
            </div>
          </div>

          {/* Flex Bank */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Flex Bank</div>
            <div className="text-lg font-semibold text-slate-800">
              Sum Flex times till today: [Calculated Value of Flex Bank
              (Current) in HH:MM format]
            </div>
          </div>

          {/* Flex Time */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Flex Time</div>
            <div className="text-lg font-semibold text-slate-800">
              [Absolute Calculated Value of Flex Time of Today in HH:MM format]
              <span className="text-sm text-slate-600">
                {parseFloat(calculation.flex) > 0 ? " added" : " removed"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Summary Section */}
      <section className="mt-20 pt-8 border-t border-slate-200">
        <h4 className="text-xl font-bold text-slate-800 mb-6">Daily Summary</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Actual Working */}
          <div
            className={`rounded-2xl p-5 border transition-colors duration-300 ${
              parseFloat(calculation.actualWorking) <
              parseFloat(calculation.required)
                ? "bg-orange-50 border-orange-300"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <p className="text-sm font-medium text-slate-500 mb-1">
              Actual Working
            </p>
            <p className="text-2xl font-semibold text-slate-800">
              {calculation.actualWorking}
            </p>
          </div>

          {/* Required Hours */}
          <div className="rounded-2xl p-5 bg-slate-50 border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-1">
              Required Hours
            </p>
            <p className="text-2xl font-semibold text-slate-800">
              {calculation.required}
            </p>
          </div>

          {/*  Lunch Time
          <div className="rounded-2xl p-5 bg-slate-50 border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-1">
              Lunch Time
            </p>
            <p className="text-2xl font-semibold text-slate-800">
              {calculation.takenLunch}
            </p>
          </div> */}
          {/* Lunch Time Comparison Box */}
          <div
            className="rounded-2xl p-5 border"
            style={{
              backgroundColor:
                parseFloat(calculation.takenLunch) > 60
                  ? "rgb(255 241 226)"
                  : undefined,
              borderColor:
                parseFloat(calculation.takenLunch) > 60
                  ? "rgb(219 181 136)"
                  : undefined,
            }}
          >
            <div className="text-sm font-medium text-slate-500 mb-1">
              Lunch Time
            </div>
            <div className="text-2xl font-semibold text-slate-800">
              {calculation.takenLunch}
            </div>

            <div className="text-sm mt-2">
              Difference:
              <span
                className={`ml-1 font-medium ${
                  parseFloat(calculation.takenLunch) > 60
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {parseFloat(calculation.takenLunch) > 60
                  ? `+${(parseFloat(calculation.takenLunch) - 60).toFixed(
                      0
                    )} min`
                  : `-${(60 - parseFloat(calculation.takenLunch)).toFixed(
                      0
                    )} min`}
              </span>
            </div>
          </div>

          <div
            className="rounded-2xl p-5 border"
            style={{
              backgroundColor:
                parseFloat(calculation.takenLunch) >
                parseFloat(calculation.givenLunch)
                  ? "rgb(255 241 226)"
                  : undefined,
              borderColor:
                parseFloat(calculation.takenLunch) >
                parseFloat(calculation.givenLunch)
                  ? "rgb(219 181 136)"
                  : undefined,
            }}
          >
            <div className="text-sm font-medium text-slate-500 mb-1">
              Lunch Time
            </div>
            <div className="text-xl font-bold text-slate-800">
              {calculation.takenLunch}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Given:{" "}
              <span className="font-medium text-slate-700">
                {calculation.givenLunch}
              </span>
            </div>
            <div className="text-sm mt-1">
              Difference:
              <span
                className={`ml-1 font-medium ${
                  parseFloat(calculation.takenLunch) >
                  parseFloat(calculation.givenLunch)
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {parseFloat(calculation.takenLunch) >
                parseFloat(calculation.givenLunch)
                  ? `+${(
                      parseFloat(calculation.takenLunch) -
                      parseFloat(calculation.givenLunch)
                    ).toFixed(0)} min`
                  : `-${(60 - parseFloat(calculation.takenLunch)).toFixed(
                      0
                    )} min`}
              </span>
            </div>
          </div>

          {/* Flex Bank */}
          <div className="rounded-2xl p-5 bg-slate-50 border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-1">Flex Bank</p>
            <p className="text-2xl font-semibold text-slate-800">
              {calculation.flex}
            </p>
          </div>
        </div>
      </section>
      {/* Daily Summary Section */}
      <section className="mt-20 pt-8 border-t border-slate-200">
        <h4 className="text-xl font-bold text-slate-800 mb-6">
          Daily Summary for [Date]
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Required Working Hours */}
          <div className="rounded-2xl p-5 bg-slate-50 border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-1">
              Required Working Hours
            </p>
            <p className="text-2xl font-semibold text-slate-800">
              [Value of Required Daily Working Hours in HH:MM format]
            </p>
          </div>

          {/* Actual Working Hours */}
          <div
            className={`rounded-2xl p-5 border transition-colors duration-300 ${
              parseFloat(calculation.actualWorking) <
              parseFloat(calculation.required)
                ? "bg-orange-50 border-orange-300"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <p className="text-sm font-medium text-slate-500 mb-1">
              Actual Working Hours
            </p>
            <p className="text-2xl font-semibold text-slate-800">
              {calculation.actualWorking}
            </p>
          </div>

          {/* Given Lunch Time */}
          <div className="rounded-2xl p-5 bg-slate-50 border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-1">
              Given Lunch Time
            </p>
            <p className="text-2xl font-semibold text-slate-800">
              {calculation.givenLunch}
            </p>
          </div>

          {/* Taken Lunch Time */}
          <div className="rounded-2xl p-5 bg-slate-50 border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-1">
              Taken Lunch Time
            </p>
            <p className="text-2xl font-semibold text-slate-800">
              [Calculated Value of Taken Lunch Time in HH:MM format]
            </p>
          </div>
          {/* Flex Bank */}
          <div className="rounded-2xl p-5 bg-slate-50 border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-1">Flex Bank</p>
            <p className="text-2xl font-semibold text-slate-800">
              Sum Flex times till today: [Calculated Value of Flex Bank
              (Current) in HH:MM format]
            </p>
          </div>
          {/* Flex Time */}
          <div className="rounded-2xl p-5 bg-slate-50 border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-1">Flex Time</p>
            <p className="text-2xl font-semibold text-slate-800">
              [Absolute Calculated Value of Flex Time of Today in HH:MM format]
              <span className="text-sm text-slate-600">
                {parseFloat(calculation.flex) > 0 ? " added" : " removed"}
              </span>
            </p>
          </div>
        </div>
      </section>
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
