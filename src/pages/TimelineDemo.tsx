import React from "react";
import WorkingHoursTimeline from "../components/WorkingHoursTimeline";

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
          inTime="07:49"
          outTime="16:11"
          workingPeriods={[
            { start: "08:00", end: "11:00" },
            { start: "11:30", end: "16:00" },
          ]}
          lunchPeriod={{
            start: "11:00",
            end: "11:30",
          }}
          calculation={{
            actualWorking: "8.0 hours",
            required: "8 hours",
            lunch: "30 min",
            flex: "0.0 hours",
          }}
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
                <li>• Blue bars for working time periods</li>
                <li>• Rose bars for lunch breaks</li>
                <li>• Clear visual separation of time periods</li>
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
