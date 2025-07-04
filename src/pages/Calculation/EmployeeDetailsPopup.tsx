import React, { useState, useEffect, useMemo } from "react";
import { format, eachDayOfInterval } from "date-fns";

import {
  FaChartPie,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaTimesCircle,
} from "react-icons/fa";
import Card from "../../components/ui/Card";
import useWorkTimeStore, { CalculationResult } from "../../store/workTimeStore";
import TimePicker from "../../components/ui/TimePicker";
import useCompanyStore from "../../store/companyStore";
import { GiMoneyStack } from "react-icons/gi";
import Modal from "../../components/ui/Modal";
import WorkingHoursTimeline from "../../components/WorkingHoursTimeline";
import { EmployeeRecord } from "../../shared/types";
import { calculateFlexBank } from "../../utils/flexBank";
import { calculateDailyData, minutesToHHMM } from "../../utils/weeklySummary";
import { DailyRecord } from "../../components/ui/WeeklyBreakdownModal";
import { calculateOvertimeSegments } from "../../utils/overtime";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  userCalculation: EmployeeRecord | null | undefined;
}

// Types for simulation record and calculation result
interface Break {
  start: string;
  end: string;
}

interface SimulationRecord {
  clockIn: string;
  clockOut: string;
  lunchStart: string;
  lunchEnd: string;
  breaks: Break[];
}

const EmployeeDetailsModal: React.FC<IProps> = ({
  onClose,
  isOpen,
  userCalculation: user,
}) => {
  const {
    simulateCalculation,
    employeeRecords,
    parameters: globalParameters,
  } = useWorkTimeStore();
  const { getCurrentParameters } = useCompanyStore();

  const shiftParameters = getCurrentParameters(
    user?.company || "",
    user?.shift?.id || ""
  );

  // Sample record for simulation
  const [simulationRecord, setSimulationRecord] = useState<SimulationRecord>({
    clockIn: "07:49",
    clockOut: "16:06",
    lunchStart: "11:45",
    lunchEnd: "12:15",
    breaks: [{ start: "10:00", end: "10:15" }],
  });

  // Keep calculation result in state
  const [calculationResult, setCalculationResult] =
    useState<CalculationResult | null>(null);

  // Initialize with pre-filled data if available
  useEffect(() => {
    if (user && shiftParameters) {
      setSimulationRecord(user);
      const result = simulateCalculation(user, shiftParameters);
      setCalculationResult(result);
    }
  }, [user, shiftParameters, simulateCalculation]);

  // Calculate week range for the selected record
  const weekStart = useMemo(() => {
    if (!user) return null;
    const date = new Date(user.date);
    const day = date.getDay() || 7;
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (day - 1));
    return date;
  }, [user]);
  const weekEnd = useMemo(() => {
    if (!weekStart) return null;
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }, [weekStart]);

  // Get all records for this employee for the week, sorted by date
  const employeeRecordsThisWeek = useMemo(() => {
    if (!user || !weekStart || !weekEnd) return [];
    return employeeRecords
      .filter(
        (r: EmployeeRecord) =>
          r.id === user.id &&
          new Date(r.date) >= weekStart &&
          new Date(r.date) <= weekEnd
      )
      .sort(
        (a: EmployeeRecord, b: EmployeeRecord) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }, [user, weekStart, weekEnd, employeeRecords]);

  // Calculate flex bank for each day using the utility
  const employeeRecordsWithFlex = useMemo(() => {
    if (!employeeRecordsThisWeek.length || !globalParameters) return [];
    return calculateFlexBank(
      employeeRecordsThisWeek,
      globalParameters.workingHours.totalRequired
    );
  }, [employeeRecordsThisWeek, globalParameters]);

  // Get flex bank for the selected day
  const flexBankForThisDay = useMemo(() => {
    if (!user) return 0;
    const rec = employeeRecordsWithFlex.find((r) => r.date === user.date);
    return rec?.flexBank || 0;
  }, [employeeRecordsWithFlex, user]);

  // Calculate daily summary data for the selected record
  const dailySummary = useMemo(() => {
    if (!user || !shiftParameters) return null;
    const data = calculateDailyData(user, shiftParameters);
    // Format flex hours with a plus sign if positive
    const flexHoursFormatted = `${
      data.dailyFlexTimeChangeMinutes >= 0 &&
      data.dailyFlexTimeChangeMinutes !== 0
        ? "+"
        : ""
    }${minutesToHHMM(data.dailyFlexTimeChangeMinutes)} H`;

    const previousDayFlexBankMinutes =
      flexBankForThisDay - data.dailyFlexTimeChangeMinutes;
    const flexBankFormatted = `${minutesToHHMM(previousDayFlexBankMinutes)} ${
      data.dailyFlexTimeChangeMinutes >= 0 ? "+" : "-"
    } ${minutesToHHMM(
      Math.abs(data.dailyFlexTimeChangeMinutes)
    )} = ${minutesToHHMM(flexBankForThisDay)}`;

    // Construct DailyRecord like object for display consistency
    return {
      date: format(new Date(user.date), "MMM dd, yyyy"),
      inTime: data.clockIn,
      outTime: data.clockOut,
      lunchPeriod: `${data.lunchStart} - ${data.lunchEnd}`,
      totalTime: minutesToHHMM(data.totalTimeFromInOutMinutes),
      minBreak: minutesToHHMM(data.minBreakMinutes),
      takenBreaks: minutesToHHMM(
        data.lunchBreakMinutes + data.otherBreakMinutes
      ),
      totalWorkingHours: `${minutesToHHMM(
        data.totalWorkingMinutesExcludingBreaks
      )} h`,
      requiredHours: `${minutesToHHMM(data.requiredDailyWorkingHours)} h`,
      flexHours: flexHoursFormatted,
      flexBank: flexBankFormatted,
      dailyFlexTimeChangeDirection:
        data.dailyFlexTimeChangeMinutes >= 0 ? "added" : "removed",
    } as DailyRecord;
  }, [user, shiftParameters, flexBankForThisDay]);

  // Handle updating simulation record fields
  const handleFieldChange = (
    field: keyof SimulationRecord,
    value: string
  ) => {};

  // Handle updating break times
  const handleBreakChange = (
    index: number,
    field: keyof Break,
    value: string
  ) => {};

  // Handle removing a break
  const handleRemoveBreak = (index: number) => {};

  // Format break time as string
  const formatBreakTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Get status color
  const getStatusColor = (status: boolean) => {
    return status ? "text-success-600" : "text-error-600";
  };

  // Get status icon
  const getStatusIcon = (status: boolean) => {
    return status ? (
      <FaCheckCircle className="inline-block mr-1" />
    ) : (
      <FaTimesCircle className="inline-block mr-1" />
    );
  };

  // Helper to format minutes as HH:mm
  const formatHHmm = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  if (!shiftParameters) {
    return (
      <div className="space-y-6 py-4">
        <div className="animate-fade-in-down animate-duration-300">
          <h1 className="text-2xl font-semibold text-neutral-800">
            Working Time Calculator
          </h1>
          <p className="text-neutral-500 mt-1">Please select a company first</p>
        </div>
      </div>
    );
  }

  return (
    <Modal
      size="7xl"
      isOpen={isOpen}
      onClose={onClose}
      title={"Record Details"}
    >
      <div className="space-y-6">
        {/* Daily Summary Card */}
        {/*   {dailySummary && (
          <Card
            title="Daily Summary"
            icon={<FaChartPie size={20} />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="font-medium text-neutral-700">Day:</span>
                <span className="text-neutral-900">{dailySummary.date}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-neutral-700">In:</span>
                <span className="text-neutral-900">{dailySummary.inTime}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-neutral-700">Out:</span>
                <span className="text-neutral-900">{dailySummary.outTime}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-neutral-700">
                  Required hours:
                </span>
                <span className="text-neutral-900">
                  {dailySummary.requiredHours}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-neutral-700">
                  Total working hour:
                </span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                    dailySummary.requiredHours <= dailySummary.totalWorkingHours
                      ? "bg-green-50 text-green-700 ring-green-600/20"
                      : "bg-red-50 text-red-700 ring-red-600/20"
                  } ring-1 ring-inset`}
                >
                  {dailySummary.totalWorkingHours}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-neutral-700">
                  Total time:
                </span>
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {dailySummary.totalTime}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-neutral-700">Min break:</span>
                <span className="text-neutral-900">
                  {dailySummary.minBreak}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-neutral-700">Lunch:</span>
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {dailySummary.lunchPeriod}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-neutral-700">
                  Taken Breaks:
                </span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                    dailySummary.minBreak >= dailySummary.takenBreaks
                      ? "bg-green-50 text-green-700 ring-green-600/20"
                      : "bg-red-50 text-red-700 ring-red-600/20"
                  } ring-1 ring-inset`}
                >
                  {dailySummary.takenBreaks}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-neutral-700">
                  Flex hours:
                </span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                    dailySummary.dailyFlexTimeChangeDirection === "added"
                      ? "bg-green-50 text-green-700 ring-green-600/20"
                      : "bg-red-50 text-red-700 ring-red-600/20"
                  } ring-1 ring-inset`}
                >
                  {dailySummary.flexHours}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-neutral-700">Flex bank:</span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                    dailySummary.flexBank.includes("+")
                      ? "bg-primary-50 text-primary-700 ring-primary-700/10"
                      : "bg-red-50 text-red-700 ring-red-600/20"
                  } ring-1 ring-inset`}
                >
                  {dailySummary.flexBank}
                </span>
              </div>
            </div>
          </Card>
        )} */}
        {/* Timeline Visualization */}
        {calculationResult && (
          <Card title="Timeline Visualization" icon={<FaClock size={20} />}>
            <WorkingHoursTimeline
              inTime={simulationRecord.clockIn}
              outTime={simulationRecord.clockOut}
              workingPeriods={[
                {
                  start: simulationRecord.clockIn,
                  end: simulationRecord.lunchStart,
                },
                {
                  start: simulationRecord.lunchEnd,
                  end: simulationRecord.clockOut,
                },
              ]}
              lunchPeriod={{
                start: simulationRecord.lunchStart,
                end: simulationRecord.lunchEnd,
              }}
              calculation={{
                actualWorking: dailySummary?.totalWorkingHours,
                totalTime: dailySummary?.totalTime,
                required: dailySummary?.requiredHours,
                lunch: `${dailySummary?.minBreak} h`,
                lunchTime: `${dailySummary?.lunchPeriod}`,
                takenLunchTime: `${dailySummary?.takenBreaks}`,
                flex: `${dailySummary?.flexBank}`,
                flexHours: dailySummary?.flexHours,
                minBreak: dailySummary?.minBreak,
                dailyFlexTimeChangeDirection:
                  dailySummary?.dailyFlexTimeChangeDirection,
              }}
              overtimePeriods={(() => {
                if (
                  user?.overtimeStart &&
                  user?.overtimeEnd &&
                  shiftParameters?.overtime
                ) {
                  // Combine lunch and additional breaks
                  const breaks = [
                    { start: user.lunchStart, end: user.lunchEnd },
                    ...(user.breaks || []),
                  ];

                  const segments = calculateOvertimeSegments({
                    overtimeStart: user.overtimeStart,
                    overtimeEnd: user.overtimeEnd,
                    breaks,
                    shift: shiftParameters,
                  });

                  // Map segments to timeline periods
                  let current = user.overtimeStart;
                  return segments.map((seg) => {
                    const period = {
                      start: current,
                      end: (() => {
                        const mins =
                          parseInt(current.split(":")[0]) * 60 +
                          parseInt(current.split(":")[1]) +
                          seg.duration;
                        const h = Math.floor(mins / 60)
                          .toString()
                          .padStart(2, "0");
                        const m = (mins % 60).toString().padStart(2, "0");
                        return `${h}:${m}`;
                      })(),
                      multiplier: seg.multiplier,
                    };
                    current = period.end;
                    return period;
                  });
                }
                return [];
              })()}
            />
          </Card>
        )}
        {/* Overtime Breakdown Card (separate) */}
        {user?.overtimeStart &&
          user?.overtimeEnd &&
          shiftParameters?.overtime &&
          (() => {
            const breaks = [
              { start: user.lunchStart, end: user.lunchEnd },
              ...(user.breaks || []),
            ];
            const segments = calculateOvertimeSegments({
              overtimeStart: user.overtimeStart,
              overtimeEnd: user.overtimeEnd,
              breaks,
              shift: shiftParameters,
            });
            if (!segments.length) return null;
            const totalOvertime = segments.reduce(
              (sum, seg) => sum + seg.duration,
              0
            );
            return (
              <Card
                className="mt-4"
                title="Overtime Breakdown"
                icon={<FaClock size={20} className="text-yellow-600" />}
              >
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Overtime:</span>{" "}
                    {Math.floor(totalOvertime / 60)
                      .toString()
                      .padStart(2, "0")}
                    :{(totalOvertime % 60).toString().padStart(2, "0")}
                  </div>
                  {segments.map((seg, idx) => (
                    <div key={idx}>
                      <span className="font-medium">
                        {seg.multiplier}x Overtime:
                      </span>{" "}
                      {seg.durationHHMM}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card
              title="Simulation Parameters"
              icon={<FaClock size={20} />}
              className="animate-fade-in h-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-neutral-800 mb-4">
                    Time Entry
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <TimePicker
                        className="w-full"
                        label="Clock In"
                        value={simulationRecord.clockIn}
                        disabled
                        onChange={(value) =>
                          handleFieldChange("clockIn", value)
                        }
                      />
                    </div>
                    <div>
                      <TimePicker
                        className="w-full"
                        label="Clock Out"
                        value={simulationRecord.clockOut}
                        disabled
                        onChange={(value) =>
                          handleFieldChange("clockOut", value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <TimePicker
                      className="w-full"
                      label="Lunch Start"
                      value={simulationRecord.lunchStart}
                      disabled
                      onChange={(value) =>
                        handleFieldChange("lunchStart", value)
                      }
                    />
                    <TimePicker
                      className="w-full"
                      label="Lunch End"
                      value={simulationRecord.lunchEnd}
                      disabled
                      onChange={(value) => handleFieldChange("lunchEnd", value)}
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="input-label">Additional Breaks</label>
                    </div>

                    <div className="space-y-3">
                      {simulationRecord.breaks.map((breakItem, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-2 border border-neutral-200 rounded-lg bg-neutral-50"
                        >
                          <TimePicker
                            value={breakItem.start}
                            onChange={(value) =>
                              handleBreakChange(index, "start", value)
                            }
                            className="w-24 text-sm"
                            disabled
                          />
                          <span className="text-neutral-400">to</span>
                          <TimePicker
                            value={breakItem.end}
                            onChange={(value) =>
                              handleBreakChange(index, "end", value)
                            }
                            className="w-24 text-sm"
                            disabled
                          />
                          <button
                            type="button"
                            className="text-error-500 hover:text-error-700 ml-auto"
                            onClick={() => handleRemoveBreak(index)}
                            disabled
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-neutral-800 mb-4">
                    Company Settings Reference
                  </h3>

                  <div className="bg-neutral-50 p-4 rounded-lg text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Shift:</span>
                      <div className="flex items-center">
                        <span className="font-medium first-letter:capitalize">
                          {shiftParameters.name}{" "}
                        </span>
                        {shiftParameters.shiftBonus?.isShiftBonus && (
                          <div className="flex items-center font-medium ml-1">
                            (
                            <GiMoneyStack
                              className="text-green-600 mr-1"
                              size={20}
                            />{" "}
                            {shiftParameters.shiftBonus?.bonusAmount || 0})
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Work Hours:</span>
                      <span className="font-medium">
                        {shiftParameters.start} - {shiftParameters.end}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-neutral-600">Required Hours:</span>
                      <span className="font-medium">
                        {calculationResult?.regularHours} hours
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-neutral-600">Lunch Break:</span>
                      <span className="font-medium">
                        {shiftParameters.lunchBreak.duration} min
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-neutral-600">Lunch Window:</span>
                      <span className="font-medium">
                        {shiftParameters.lunchBreak.flexWindowStart} -{" "}
                        {shiftParameters.lunchBreak.flexWindowEnd}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-neutral-600">Early Arrival:</span>
                      <span className="font-medium">
                        Max {shiftParameters.earlyArrival.maxMinutes} min
                        {shiftParameters.earlyArrival.countTowardsTotal
                          ? " (counted)"
                          : " (not counted)"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-neutral-600">Late Stay:</span>
                      <span className="font-medium">
                        Max {shiftParameters.lateStay.maxMinutes} min
                        {shiftParameters.lateStay.countTowardsTotal
                          ? " (counted)"
                          : " (not counted)"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-neutral-600">Overtime Rate:</span>
                      <span className="font-medium">
                        {shiftParameters.lateStay.overtimeMultiplier}×
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-primary-50 border border-primary-100 rounded-lg text-sm text-primary-700">
                    <div className="flex items-start">
                      <FaExclamationCircle className="mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-1">Simulation Tips:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Try different clock-in/out times to see how early
                            arrival and overtime are calculated
                          </li>
                          <li>
                            Adjust lunch times within and outside the flexible
                            window to see the impact
                          </li>
                          <li>
                            Add or remove breaks to understand their effect on
                            total hours
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card
              title="Calculation Results"
              icon={<FaChartPie size={20} />}
              className="animate-fade-in h-full"
            >
              {calculationResult && (
                <div className="space-y-4">
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <h4 className="font-medium text-primary-800 mb-2">
                      Time Summary
                    </h4>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">
                          Effective Start:
                        </span>
                        <span className="font-medium">
                          {calculationResult.effectiveStart}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Effective End:</span>
                        <span className="font-medium">
                          {calculationResult.effectiveEnd}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Total Work:</span>
                        <span className="font-medium">
                          {(calculationResult.totalWorkingMinutes / 60).toFixed(
                            2
                          )}{" "}
                          hours
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Regular Hours:</span>
                        <span className="font-medium">
                          {calculationResult.regularHours}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">
                          Overtime Hours:
                        </span>
                        <span className="font-medium">
                          {calculationResult.overtimeHours.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-neutral-600">Overtime Pay:</span>
                        <span className="font-medium">
                          {calculationResult.overtimePay}× hours
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-primary-200 flex justify-between font-semibold">
                        <span>Total Effective:</span>
                        <span>
                          {calculationResult.totalEffectiveHours} hours
                        </span>
                      </div>
                      {shiftParameters.shiftBonus?.isShiftBonus && (
                        <div className="flex justify-between font-semibold">
                          <span className="text-neutral-600">Shift Bonus:</span>
                          <span className="flex gap-1 items-center">
                            <GiMoneyStack
                              className="text-green-600"
                              size={20}
                            />{" "}
                            {shiftParameters.shiftBonus?.bonusAmount || 0}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <h4 className="font-medium text-neutral-800 mb-2">
                      Time Deductions
                    </h4>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Lunch Break:</span>
                        <span className="font-medium">
                          {formatBreakTime(calculationResult.lunchDuration)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Other Breaks:</span>
                        <span className="font-medium">
                          {formatBreakTime(
                            calculationResult.otherBreaksDuration
                          )}
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-neutral-200 flex justify-between font-semibold">
                        <span>Total Deducted:</span>
                        <span>
                          {formatBreakTime(
                            calculationResult.lunchDuration +
                              calculationResult.otherBreaksDuration
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-neutral-800 mb-2">
                      Status Check
                    </h4>
                    <div className="text-sm space-y-1.5">
                      <div
                        className={getStatusColor(
                          calculationResult.isLunchBreakInWindow
                        )}
                      >
                        {getStatusIcon(calculationResult.isLunchBreakInWindow)}
                        Lunch in flexible window
                      </div>

                      <div
                        className={getStatusColor(
                          calculationResult.isLunchBreakCorrectDuration
                        )}
                      >
                        {getStatusIcon(
                          calculationResult.isLunchBreakCorrectDuration
                        )}
                        Correct lunch duration
                      </div>

                      {calculationResult.earlyArrival && (
                        <div className="text-primary-600">
                          <FaExclamationCircle className="inline-block mr-1" />
                          Early by {calculationResult.earlyArrivalMinutes} min
                          {shiftParameters.earlyArrival.countTowardsTotal
                            ? " (counted)"
                            : " (not counted)"}
                        </div>
                      )}

                      {calculationResult.lateArrival && (
                        <div className="text-warning-600">
                          <FaExclamationCircle className="inline-block mr-1" />
                          Late by {calculationResult.lateArrivalMinutes} min
                        </div>
                      )}

                      {calculationResult.earlyDeparture && (
                        <div className="text-warning-600">
                          <FaExclamationCircle className="inline-block mr-1" />
                          Left early by{" "}
                          {calculationResult.earlyDepartureMinutes} min
                        </div>
                      )}

                      {calculationResult.lateDeparture && (
                        <div className="text-primary-600">
                          <FaExclamationCircle className="inline-block mr-1" />
                          Stayed late by{" "}
                          {calculationResult.lateDepartureMinutes} min
                          {calculationResult.overtimeHours > 0
                            ? " (includes overtime)"
                            : shiftParameters.lateStay.countTowardsTotal
                            ? " (counted)"
                            : " (not counted)"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-neutral-800 mb-3">
                      Hours Breakdown
                    </h4>

                    <div className="flex text-xs justify-between">
                      <span>0</span>
                      <span className="font-medium">{8} hours (required)</span>
                    </div>

                    <div className="flex text-xs text-neutral-600 mt-3 space-x-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-primary-500 rounded-sm mr-1"></div>
                        <span>Regular</span>
                      </div>

                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-success-600 rounded-sm mr-1"></div>
                        <span>Overtime</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EmployeeDetailsModal;
