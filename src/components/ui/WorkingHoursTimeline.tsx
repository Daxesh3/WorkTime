import React from "react";
import { format } from "date-fns";

interface WorkingHoursTimelineProps {
  clockIn: string;
  clockOut: string;
  lunchStart: string;
  lunchEnd: string;
  workingTime1Start: string;
  workingTime1End: string;
  workingTime2Start: string;
  workingTime2End: string;
  totalWorkingHours: number;
  lunchDuration: number;
  dailyRestFulfilled: boolean;
}

const WorkingHoursTimeline: React.FC<WorkingHoursTimelineProps> = ({
  clockIn,
  clockOut,
  lunchStart,
  lunchEnd,
  workingTime1Start,
  workingTime1End,
  workingTime2Start,
  workingTime2End,
  totalWorkingHours,
  lunchDuration,
  dailyRestFulfilled,
}) => {
  // Convert time strings to minutes for positioning
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const getPosition = (time: string) => {
    const minutes = timeToMinutes(time);
    return (minutes / (24 * 60)) * 100; // Convert to percentage of 24 hours
  };

  const clockInPos = getPosition(clockIn);
  const clockOutPos = getPosition(clockOut);
  const lunchStartPos = getPosition(lunchStart);
  const lunchEndPos = getPosition(lunchEnd);
  const work1StartPos = getPosition(workingTime1Start);
  const work1EndPos = getPosition(workingTime1End);
  const work2StartPos = getPosition(workingTime2Start);
  const work2EndPos = getPosition(workingTime2End);

  return (
    <div className="bg-white p-1 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Working Hours Timeline
        </h2>
        <p className="text-gray-600">Daily time tracking visualization</p>
      </div>

      <div className="flex gap-8">
        {/* Timeline Section */}
        <div className="flex-1">
          <div className="relative">
            {/* Timeline Base */}
            <div className="h-2 bg-gray-200 rounded-full mb-8 relative">
              {/* Hour markers */}
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 w-px h-4 bg-gray-300"
                  style={{ left: `${(i / 24) * 100}%` }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium">
                    {i.toString().padStart(2, "0")}
                  </div>
                </div>
              ))}

              {/* Clock In Marker */}
              <div
                className="absolute top-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1"
                style={{ left: `${clockInPos}%` }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-green-700 bg-white px-1 rounded">
                  IN: {clockIn}
                </div>
              </div>

              {/* Clock Out Marker */}
              <div
                className="absolute top-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1"
                style={{ left: `${clockOutPos}%` }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-green-700 bg-white px-1 rounded">
                  OUT: {clockOut}
                </div>
              </div>

              {/* Lunch Period Marker */}
              <div
                className="absolute top-0 w-px h-16 bg-red-400 border-dashed border-red-400"
                style={{ left: `${lunchStartPos}%` }}
              >
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 text-xs font-medium text-red-700 bg-white px-2 py-1 rounded border border-red-200 whitespace-nowrap">
                  Lunchstamps
                  <br />
                  To lunch and From lunch
                </div>
              </div>

              {/* Working Time Periods */}
              <div className="absolute top-8 left-0 right-0 h-16">
                {/* First Working Time */}
                <div
                  className="absolute h-8 bg-green-100 border-2 border-green-300 rounded-lg flex items-center justify-center"
                  style={{
                    left: `${work1StartPos}%`,
                    width: `${work1EndPos - work1StartPos}%`,
                  }}
                >
                  <div className="text-xs font-medium text-green-700 bg-white px-2 py-1 rounded shadow-sm">
                    Working time
                    <br />
                    {workingTime1Start} - {workingTime1End}
                  </div>
                </div>

                {/* Second Working Time */}
                <div
                  className="absolute h-8 bg-green-100 border-2 border-green-300 rounded-lg flex items-center justify-center"
                  style={{
                    left: `${work2StartPos}%`,
                    width: `${work2EndPos - work2StartPos}%`,
                  }}
                >
                  <div className="text-xs font-medium text-green-700 bg-white px-2 py-1 rounded shadow-sm">
                    Working time
                    <br />
                    {workingTime2Start} - {workingTime2End}
                  </div>
                </div>

                {/* Connecting Lines */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  {/* Line from Clock In to First Working Time */}
                  <line
                    x1={`${clockInPos}%`}
                    y1="0"
                    x2={`${work1StartPos}%`}
                    y2="16"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />

                  {/* Line from First Working Time to Lunch */}
                  <line
                    x1={`${work1EndPos}%`}
                    y1="16"
                    x2={`${lunchStartPos}%`}
                    y2="32"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />

                  {/* Line from Lunch to Second Working Time */}
                  <line
                    x1={`${lunchEndPos}%`}
                    y1="32"
                    x2={`${work2StartPos}%`}
                    y2="16"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />

                  {/* Line from Second Working Time to Clock Out */}
                  <line
                    x1={`${work2EndPos}%`}
                    y1="16"
                    x2={`${clockOutPos}%`}
                    y2="0"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Result Box */}
        {/* <div className="w-64">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Calculation Result
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Working time:</span>
                <span className="font-semibold text-green-700">
                  {totalWorkingHours} hours
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lunch:</span>
                <span className="font-semibold text-red-700">
                  {lunchDuration} min
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Daily rest time:</span>
                <span
                  className={`font-semibold ${
                    dailyRestFulfilled ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {dailyRestFulfilled ? "fulfilled" : "not fulfilled"}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Clock stamps</span>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-green-300 rounded mr-2"></div>
                  <span>Working periods</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-400 rounded mr-2"></div>
                  <span>Lunch break</span>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default WorkingHoursTimeline;
