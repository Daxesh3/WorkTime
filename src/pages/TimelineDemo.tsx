import React from "react";
import WorkingHoursTimeline from "../components/ui/WorkingHoursTimeline";

const TimelineDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Working Hours Timeline Demo
          </h1>
          <p className="text-gray-600">
            Visual representation of daily working hours calculation
          </p>
        </div>

        <WorkingHoursTimeline
          clockIn="07:49"
          clockOut="16:11"
          lunchStart="11:00"
          lunchEnd="11:30"
          workingTime1Start="08:00"
          workingTime1End="11:00"
          workingTime2Start="11:30"
          workingTime2End="16:00"
          totalWorkingHours={8}
          lunchDuration={30}
          dailyRestFulfilled={true}
        />

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">
                Timeline Features
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 24-hour timeline with hourly markers</li>
                <li>• Green circles for clock in/out stamps</li>
                <li>• Green bars for working time periods</li>
                <li>• Red dashed line for lunch break</li>
                <li>• Connecting dashed lines show time flow</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">
                Calculation Logic
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • Working time = (Clock Out - Clock In) - Lunch Duration
                </li>
                <li>• Lunch break is automatically deducted</li>
                <li>• Daily rest time compliance tracking</li>
                <li>• Visual validation of time periods</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineDemo;
