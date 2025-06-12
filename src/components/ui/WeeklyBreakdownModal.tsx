import React from "react";
import { FaTimes } from "react-icons/fa";
import Modal from "./Modal";

interface DailyRecord {
  date: string;
  clockIn: string;
  clockOut: string;
  lunchStart: string;
  lunchEnd: string;
  breaks: Array<{ start: string; end: string }>;
  totalHours: number;
}

interface WeeklyBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyRecords: DailyRecord[];
  weeklyTotal: number;
}

const WeeklyBreakdownModal: React.FC<WeeklyBreakdownModalProps> = ({
  isOpen,
  onClose,
  dailyRecords,
  weeklyTotal,
}) => {
  if (!isOpen) return null;

  const formatTime = (time: string) => {
    return time;
  };

  const calculateBreakDuration = (
    breaks: Array<{ start: string; end: string }>
  ) => {
    return breaks.reduce((total, breakItem) => {
      const start = new Date(`2000-01-01T${breakItem.start}`);
      const end = new Date(`2000-01-01T${breakItem.end}`);
      return total + (end.getTime() - start.getTime()) / (1000 * 60);
    }, 0);
  };

  const calculateLunchDuration = (lunchStart: string, lunchEnd: string) => {
    if (lunchStart === "-" || lunchEnd === "-") return 0;
    const start = new Date(`2000-01-01T${lunchStart}`);
    const end = new Date(`2000-01-01T${lunchEnd}`);
    return (end.getTime() - start.getTime()) / (1000 * 60);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  };

  const formatTotalHours = (decimalHours: number) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      size="7xl"
      isOpen={isOpen}
      onClose={onClose}
      title="Weekly Breakdown"
    >
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 px-4 text-left text-sm font-semibold text-neutral-900"
              >
                Day
              </th>
              <th
                scope="col"
                className="py-3.5 px-4 text-left text-sm font-semibold text-neutral-900"
              >
                In
              </th>
              <th
                scope="col"
                className="py-3.5 px-4 text-left text-sm font-semibold text-neutral-900"
              >
                Out
              </th>
              <th
                scope="col"
                className="py-3.5 px-4 text-left text-sm font-semibold text-neutral-900"
              >
                Lunch
              </th>
              <th
                scope="col"
                className="py-3.5 px-4 text-left text-sm font-semibold text-neutral-900"
              >
                Breaks
              </th>
              <th
                scope="col"
                className="py-3.5 px-4 text-left text-sm font-semibold text-neutral-900"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {dailyRecords.map((record, index) => (
              <tr key={index} className="transition-colors hover:bg-neutral-50">
                <td className="whitespace-nowrap py-2 px-4 text-sm text-neutral-600">
                  {record.date}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-sm text-neutral-600">
                  {formatTime(record.clockIn)}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-sm text-neutral-600">
                  {formatTime(record.clockOut)}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-sm text-neutral-600">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {formatTime(record.lunchStart)} -{" "}
                    {formatTime(record.lunchEnd)}
                  </span>
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-sm text-neutral-600">
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    {record.lunchStart
                      ? formatDuration(
                          calculateLunchDuration(
                            record.lunchStart,
                            record.lunchEnd
                          )
                        )
                      : "-"}
                  </span>
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-sm font-medium text-neutral-900">
                  <span className="inline-flex items-center rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-700/10">
                    {formatTotalHours(record.totalHours)} h
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-neutral-50">
            <tr>
              <td
                colSpan={5}
                className="py-2 px-4 text-right text-sm font-semibold text-neutral-900"
              >
                Weekly Total:
              </td>
              <td className="py-2 px-4 text-sm font-semibold text-neutral-900">
                <span className="inline-flex items-center rounded-md bg-primary-100 px-2.5 py-1 text-sm font-medium text-primary-700 ring-1 ring-inset ring-primary-700/10">
                  {formatTotalHours(weeklyTotal)} h
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Modal>
  );
};

export default WeeklyBreakdownModal;
