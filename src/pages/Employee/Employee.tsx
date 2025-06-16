import React, { useMemo, useState } from "react";
import { FiUsers, FiInfo, FiChevronRight } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  eachDayOfInterval,
} from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Card from "../../components/ui/Card";
import useWorkTimeStore from "../../store/workTimeStore";
import AddEditEmployee from "./AddEditEmployee";
import TitleText from "../../components/ui/header";
import WeeklyBreakdownModal from "../../components/ui/WeeklyBreakdownModal";
import EmployeeDetailsModal from "../Calculation/EmployeeDetailsPopup";
import { EmployeeRecord } from "../../shared/types";

interface TimeCell {
  hours: string;
  hasAlert?: boolean;
}

interface EmployeeWeeklyData {
  id: string;
  name: string;
  dailyHours: TimeCell[];
  totalHours: string;
  dateId: string;
}

const EmployeeSchedule: React.FC = () => {
  const { employeeRecords, deleteEmployeeRecord } = useWorkTimeStore();
  const [isAddingRecord, setIsAddingRecord] = useState<boolean>(false);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [selectedEmployeeData, setSelectedEmployeeData] =
    useState<EmployeeWeeklyData | null>(null);
  const [userCalculation, setUserCalculation] = useState<
    EmployeeRecord | null | undefined
  >(null);

  // Calculate the start and end of the week
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  // Get all days in the week
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get records for the selected week
  const filteredRecords = useMemo(
    () =>
      employeeRecords.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= weekStart && recordDate <= weekEnd;
      }),
    [employeeRecords, weekStart, weekEnd]
  );

  // Transform records into weekly data
  const weeklyData = useMemo(() => {
    const employeeMap = new Map<string, EmployeeWeeklyData>();

    const calculateTimeDifference = (start: Date, end: Date): number => {
      // If end time is earlier than start time, assume it's the next day
      if (end < start) {
        end.setDate(end.getDate() + 1);
      }
      return (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
    };

    const calculateBreakDuration = (
      breaks: Array<{ start: string; end: string }>
    ): number => {
      return breaks.reduce((total, breakItem) => {
        const breakStart = new Date(`2000-01-01T${breakItem.start}`);
        const breakEnd = new Date(`2000-01-01T${breakItem.end}`);
        return total + calculateTimeDifference(breakStart, breakEnd);
      }, 0);
    };

    filteredRecords.forEach((record) => {
      if (!employeeMap.has(record.id)) {
        employeeMap.set(record.id, {
          id: record.id,
          name: record.name,
          dailyHours: Array(7).fill({ hours: "0:00" }),
          totalHours: "0:00",
          dateId: record.date,
        });
      }

      const employeeData = employeeMap.get(record.id)!;
      const dayIndex = new Date(record.date).getDay() - 1; // Convert to 0-6 (Monday-Sunday)

      // Create date objects for all times
      const clockIn = new Date(`2000-01-01T${record.clockIn}`);
      const clockOut = new Date(`2000-01-01T${record.clockOut}`);
      const lunchStart = new Date(`2000-01-01T${record.lunchStart}`);
      const lunchEnd = new Date(`2000-01-01T${record.lunchEnd}`);

      // Calculate total time (handling overnight shifts)
      const totalMinutes = calculateTimeDifference(clockIn, clockOut);

      // Calculate break times
      const lunchBreakMinutes = calculateTimeDifference(lunchStart, lunchEnd);
      const otherBreakMinutes = calculateBreakDuration(record.breaks);

      // Calculate working minutes (excluding breaks)
      const workingMinutes = Math.max(
        0,
        totalMinutes - lunchBreakMinutes - otherBreakMinutes
      );

      // Format hours
      const hours = Math.floor(workingMinutes / 60);
      const minutes = Math.round(workingMinutes % 60);
      const formattedHours = `${hours}:${minutes.toString().padStart(2, "0")}`;

      employeeData.dailyHours[dayIndex] = {
        hours: formattedHours,
        hasAlert: workingMinutes / 60 < 8, // Alert if less than 8 hours
      };
    });

    // Calculate weekly totals
    employeeMap.forEach((data) => {
      const totalMinutes = data.dailyHours.reduce((acc, day) => {
        const [hours, minutes] = day.hours.split(":").map(Number);
        return acc + hours * 60 + minutes;
      }, 0);

      const totalHours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      data.totalHours = `${totalHours}:${remainingMinutes
        .toString()
        .padStart(2, "0")}`;
    });

    return Array.from(employeeMap.values());
  }, [filteredRecords]);

  return (
    <>
      <div className="space-y-3 py-4">
        <TitleText
          title="Employee Schedule"
          subtitle="View and manage weekly working time records"
          buttons={
            <button
              className="btn btn-primary"
              onClick={() => {
                setIsAddingRecord(true);
                setEditingId(null);
              }}
            >
              <FaPlus /> Add Record
            </button>
          }
        />
        <div>
          <label className="input-label">Select Week</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date) => setSelectedDate(date)}
            dateFormat="MMM d, yyyy"
            className="time-input w-48"
          />
          <div className="text-sm text-neutral-500 mt-1">
            Week of {format(weekStart, "MMM d, yyyy")} to{" "}
            {format(weekEnd, "MMM d, yyyy")}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-neutral-200">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-4 py-2 border-b border-r border-neutral-200"></th>
                <th className="px-4 py-2 border-b border-r border-neutral-200 text-left">
                  Employee
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.toISOString()}
                    className={`px-4 py-2 border-b border-r border-neutral-200 ${
                      day.getDay() === 0 || day.getDay() === 6
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    {format(day, "EEE dd")}
                  </th>
                ))}
                <th className="px-4 py-2 border-b border-neutral-200 bg-blue-100">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.map((employee) => (
                <tr key={employee.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2 border-b border-r border-neutral-200">
                    <FiChevronRight className="text-neutral-400" />
                  </td>
                  <td className="px-4 py-2 border-b border-r border-neutral-200">
                    <div className="flex items-center">
                      <span className="font-medium">{employee.name}</span>
                    </div>
                  </td>
                  {employee.dailyHours.map((day, index) => (
                    <td
                      key={index}
                      className={`px-4 py-2 border-b border-r border-neutral-200 ${
                        weekDays[index].getDay() === 0 ||
                        weekDays[index].getDay() === 6
                          ? "bg-blue-50"
                          : ""
                      }`}
                      onClick={(e) => {
                        setIsAddingRecord(false);
                        setEditingId(employee.id);
                        setEditingDateId(format(weekDays[index], "yyyy-MM-dd"));
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`${day.hasAlert ? "text-red-500" : ""}`}
                        >
                          {day.hours}
                        </span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            const editing = employee.id;
                            const editingDate = format(
                              weekDays[index],
                              "yyyy-MM-dd"
                            );
                            const user = () => {
                              if (!editing || !editingDate) return null;
                              const employee = employeeRecords.filter(
                                (r) => r.id === editing
                              );
                              if (employee.length === 0) return null;
                              return employee.find(
                                (r) => r.dateId === editingDate
                              );
                            };

                            setUserCalculation(user);
                          }}
                        >
                          <FiInfo className="text-neutral-400 ml-2 cursor-pointer" />
                        </div>
                      </div>
                    </td>
                  ))}
                  <td
                    className="px-4 py-2 border-b border-neutral-200 bg-blue-100 cursor-pointer hover:bg-blue-50"
                    onClick={() => {
                      setSelectedEmployeeData(employee);
                      setIsBreakdownModalOpen(true);
                    }}
                  >
                    {employee.totalHours}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {weeklyData.length === 0 && (
          <Card
            title="No Records Found"
            icon={<FiUsers size={20} />}
            className="animate-fade-in"
          >
            <div className="text-center py-8">
              <div className="text-neutral-400 mb-2">
                No records found for this week
              </div>
              <button
                className="btn btn-primary mx-auto"
                onClick={() => {
                  setIsAddingRecord(true);
                }}
              >
                <FaPlus /> Add First Record
              </button>
            </div>
          </Card>
        )}
      </div>
      {(isAddingRecord || editingId) && (
        <AddEditEmployee
          isOpen={isAddingRecord || !!editingId}
          editingId={editingId}
          isAddingRecord={isAddingRecord}
          editingDateId={editingDateId}
          onClose={() => {
            setIsAddingRecord(false);
            setEditingId(null);
          }}
        />
      )}
      {userCalculation && (
        <EmployeeDetailsModal
          userCalculation={userCalculation}
          isOpen={userCalculation !== null}
          onClose={() => {
            setUserCalculation(null);
          }}
        />
      )}
      <WeeklyBreakdownModal
        isOpen={isBreakdownModalOpen}
        onClose={() => {
          setIsBreakdownModalOpen(false);
          setSelectedEmployeeData(null);
        }}
        dailyRecords={
          selectedEmployeeData
            ? weekDays.map((day) => {
                const record = filteredRecords.find(
                  (r) =>
                    r.id === selectedEmployeeData.id &&
                    r.date === format(day, "yyyy-MM-dd")
                );
                if (!record) {
                  return {
                    date: format(day, "MMM dd, yyyy"),
                    clockIn: "-",
                    clockOut: "-",
                    lunchStart: "",
                    lunchEnd: "",
                    breaks: [],
                    totalHours: 0,
                  };
                }
                return {
                  date: format(day, "MMM dd, yyyy"),
                  clockIn: record.clockIn,
                  clockOut: record.clockOut,
                  lunchStart: record.lunchStart,
                  lunchEnd: record.lunchEnd,
                  breaks: record.breaks,
                  totalHours: (() => {
                    const clockIn = new Date(`2000-01-01T${record.clockIn}`);
                    const clockOut = new Date(`2000-01-01T${record.clockOut}`);
                    const lunchStart = new Date(
                      `2000-01-01T${record.lunchStart}`
                    );
                    const lunchEnd = new Date(`2000-01-01T${record.lunchEnd}`);
                    const breakMinutes = record.breaks.reduce(
                      (total, breakItem) => {
                        const breakStart = new Date(
                          `2000-01-01T${breakItem.start}`
                        );
                        const breakEnd = new Date(
                          `2000-01-01T${breakItem.end}`
                        );
                        return (
                          total +
                          (breakEnd.getTime() - breakStart.getTime()) /
                            (1000 * 60)
                        );
                      },
                      0
                    );
                    const totalMinutes =
                      (clockOut.getTime() - clockIn.getTime()) / (1000 * 60) -
                      (lunchEnd.getTime() - lunchStart.getTime()) /
                        (1000 * 60) -
                      breakMinutes;
                    return totalMinutes / 60;
                  })(),
                };
              })
            : []
        }
        weeklyTotal={
          selectedEmployeeData
            ? filteredRecords
                .filter((record) => record.id === selectedEmployeeData.id)
                .reduce((total, record) => {
                  const clockIn = new Date(`2000-01-01T${record.clockIn}`);
                  const clockOut = new Date(`2000-01-01T${record.clockOut}`);
                  const lunchStart = new Date(
                    `2000-01-01T${record.lunchStart}`
                  );
                  const lunchEnd = new Date(`2000-01-01T${record.lunchEnd}`);
                  const breakMinutes = record.breaks.reduce(
                    (total, breakItem) => {
                      const breakStart = new Date(
                        `2000-01-01T${breakItem.start}`
                      );
                      const breakEnd = new Date(`2000-01-01T${breakItem.end}`);
                      return (
                        total +
                        (breakEnd.getTime() - breakStart.getTime()) /
                          (1000 * 60)
                      );
                    },
                    0
                  );
                  const tempWorkingHours =
                    (clockOut.getTime() - clockIn.getTime()) / (1000 * 60) -
                    (lunchEnd.getTime() - lunchStart.getTime()) / (1000 * 60);
                  if (tempWorkingHours < 0) {
                    const totalMinutes = 1140 - tempWorkingHours - breakMinutes;
                    return total + totalMinutes / 60;
                  } else {
                    const totalMinutes =
                      (clockOut.getTime() - clockIn.getTime()) / (1000 * 60) -
                      (lunchEnd.getTime() - lunchStart.getTime()) /
                        (1000 * 60) -
                      breakMinutes;
                    return total + totalMinutes / 60;
                  }
                }, 0)
            : 0
        }
      />
    </>
  );
};

export default EmployeeSchedule;
