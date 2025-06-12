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
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-2 px-4 text-sm font-medium text-neutral-600">
                Day
              </th>
              <th className="text-left py-2 px-4 text-sm font-medium text-neutral-600">
                In
              </th>
              <th className="text-left py-2 px-4 text-sm font-medium text-neutral-600">
                Out
              </th>
              <th className="text-left py-2 px-4 text-sm font-medium text-neutral-600">
                Lunch
              </th>
              <th className="text-left py-2 px-4 text-sm font-medium text-neutral-600">
                Breaks
              </th>
              <th className="text-left py-2 px-4 text-sm font-medium text-neutral-600">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {dailyRecords.map((record, index) => (
              <tr key={index} className="border-b border-neutral-100">
                <td className="py-2 px-4 text-sm text-neutral-600">
                  {record.date}
                </td>
                <td className="py-2 px-4 text-sm text-neutral-600">
                  {formatTime(record.clockIn)}
                </td>
                <td className="py-2 px-4 text-sm text-neutral-600">
                  {formatTime(record.clockOut)}
                </td>
                <td className="py-2 px-4 text-sm text-neutral-600">
                  {formatTime(record.lunchStart)} -{" "}
                  {formatTime(record.lunchEnd)}
                </td>
                <td className="py-2 px-4 text-sm text-neutral-600">
                  {formatDuration(calculateBreakDuration(record.breaks))}
                </td>
                <td className="py-2 px-4 text-sm font-medium text-neutral-800">
                  {formatTotalHours(record.totalHours)} h
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-neutral-200">
              <td
                colSpan={5}
                className="py-2 px-4 text-sm font-medium text-neutral-600 text-right"
              >
                Weekly Total:
              </td>
              <td className="py-2 px-4 text-sm font-medium text-neutral-800">
                {formatTotalHours(weeklyTotal)} h
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Modal>
  );
};

export default WeeklyBreakdownModal;
