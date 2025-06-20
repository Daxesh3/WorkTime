import React from "react";
import { FaTimes } from "react-icons/fa";
import Modal from "./Modal";

export interface DailyRecord {
  date: string;
  inTime: string;
  outTime: string;
  lunchPeriod: string; // e.g., "12:00 - 12:30"
  totalTime: string; // From in to out, e.g., "08:21"
  minBreak: string; // e.g., "0:30"
  takenBreaks: string; // e.g., "0:30" or "0:35"
  totalWorkingHours: string; // After all breaks, e.g., "7:51 h"
  requiredHours: string; // e.g., "07:30 h"
  flexHours: string; // e.g., "+00:21 H" or "-00:20 H"
  flexBank: string; // e.g., "00:00 + 00:21" or "00:21 + 00:34"
  dailyFlexTimeChangeDirection: "added" | "removed"; // To assist with styling
}

interface WeeklySummary {
  weeklyRequiredHours: string;
  weeklyActualHours: string;
  weeklyFlexTimeAddedRemoved: string;
  flexBankStartOfWeek: string;
  flexBankEnd: string;
  dailySummaries: DailyRecord[];
}

interface WeeklyBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyRecords: DailyRecord[];
  weeklySummary: WeeklySummary | null; // Updated to accept the entire weeklySummary object
}

const WeeklyBreakdownModal: React.FC<WeeklyBreakdownModalProps> = ({
  isOpen,
  onClose,
  dailyRecords,
  weeklySummary,
}) => {
  if (!isOpen) return null;

  // This formatting function is for consistency if needed, but weeklyTotal will be pre-formatted.
  const formatHoursAndMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
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
                Total time
              </th>
              <th
                scope="col"
                className="py-3.5 px-4 text-left text-sm font-semibold text-neutral-900"
              >
                Min break
              </th>
              <th
                scope="col"
                className="py-3.5 px-4 text-left text-sm font-semibold text-neutral-900"
              >
                Taken Breaks
              </th>
              <th
                scope="col"
                className="py-3.5 px-4 text-left text-sm font-semibold text-neutral-900"
              >
                Total working hour
              </th>
              <th
                scope="col"
                className="py-3.5 px-4 text-left text-sm font-semibold text-neutral-900"
              >
                Required hours
              </th>
              <th
                scope="col"
                className="py-3.5 px-4 text-left text-sm font-semibold text-neutral-900"
              >
                Flex hours
              </th>
              <th
                scope="col"
                className="py-3.5 px-4 text-left text-sm font-semibold text-neutral-900"
              >
                Flex bank
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {dailyRecords.map((record, index) => (
              <tr
                key={index}
                className="transition-colors hover:bg-neutral-50"
              >
                <td className="whitespace-nowrap py-2 px-4 text-sm text-neutral-600">
                  {record.date}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-sm text-neutral-600">
                  {record.inTime}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-sm text-neutral-600">
                  {record.outTime}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-sm text-neutral-600">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {record.lunchPeriod}
                  </span>
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-sm text-neutral-600">
                  {record.totalTime}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-sm text-neutral-600">
                  {record.minBreak}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-sm text-neutral-600">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                      record.dailyFlexTimeChangeDirection === "added"
                        ? "bg-green-50 text-green-700 ring-green-600/20"
                        : "bg-red-50 text-red-700 ring-red-600/20"
                    } ring-1 ring-inset`}
                  >
                    {record.takenBreaks}
                  </span>
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-sm font-medium text-neutral-900">
                  {record.totalWorkingHours}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-sm text-neutral-600">
                  {record.requiredHours}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-sm text-neutral-600">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                      record.dailyFlexTimeChangeDirection === "added"
                        ? "bg-green-50 text-green-700 ring-green-600/20"
                        : "bg-red-50 text-red-700 ring-red-600/20"
                    } ring-1 ring-inset`}
                  >
                    {record.flexHours}
                  </span>
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-sm font-medium text-neutral-900">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                      record.flexBank.includes("+")
                        ? "bg-primary-50 text-primary-700 ring-primary-700/10"
                        : "bg-red-50 text-red-700 ring-red-600/20"
                    } ring-1 ring-inset`}
                  >
                    {record.flexBank}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-neutral-50">
            <tr>
              <td
                colSpan={7} // Adjusted colspan to match new number of columns (11 - 4 for totals)
                className="py-2 px-4 text-right text-sm font-semibold text-neutral-900"
              >
                Weekly Total:
              </td>
              <td className="py-2 px-4 text-sm font-semibold text-neutral-900">
                <span className="inline-flex items-center rounded-md bg-primary-100 px-2.5 py-1 text-sm font-medium text-primary-700 ring-1 ring-inset ring-primary-700/10 w-max">
                  {weeklySummary ? weeklySummary.weeklyActualHours : "00:00"} h
                </span>
              </td>
              <td className="py-2 px-4 text-sm font-semibold text-neutral-900">
                <span className="inline-flex items-center rounded-md bg-primary-100 px-2.5 py-1 text-sm font-medium text-primary-700 ring-1 ring-inset ring-primary-700/10 w-max">
                  {weeklySummary ? weeklySummary.weeklyRequiredHours : "00:00"}{" "}
                  h
                </span>
              </td>
              <td className="py-2 px-4 text-sm font-semibold text-neutral-900">
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ${
                    weeklySummary &&
                    weeklySummary.weeklyFlexTimeAddedRemoved.includes("+")
                      ? "bg-green-50 text-green-700 ring-green-600/20"
                      : "bg-red-50 text-red-700 ring-red-600/20"
                  } ring-1 ring-inset`}
                >
                  {weeklySummary
                    ? weeklySummary.weeklyFlexTimeAddedRemoved
                    : "00:00"}{" "}
                  H
                </span>
              </td>
              <td className="py-2 px-4 text-sm font-semibold text-neutral-900">
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ${
                    weeklySummary && weeklySummary.flexBankEnd.includes("+")
                      ? "bg-primary-100 text-primary-700 ring-primary-700/10"
                      : "bg-red-50 text-red-700 ring-red-600/20"
                  } ring-1 ring-inset`}
                >
                  {weeklySummary ? weeklySummary.flexBankEnd : "00:00"} H
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
