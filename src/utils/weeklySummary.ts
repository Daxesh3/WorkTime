import { EmployeeRecord } from "../shared/types";
import { ShiftTiming } from "../pages/Shifts/Shift.types";
import { differenceInMinutes, addMinutes, format, parseISO } from "date-fns";
import { DailyRecord } from "../components/ui/WeeklyBreakdownModal"; // Import DailyRecord for type assertion

// Helper to convert HH:MM string to total minutes
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Helper to convert total minutes to HH:MM string (handles negative values)
export function minutesToHHMM(totalMinutes: number): string {
  const sign = totalMinutes < 0 ? "-" : "";
  const absMinutes = Math.abs(totalMinutes);
  const h = Math.floor(absMinutes / 60);
  const m = absMinutes % 60;
  return `${sign}${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}`;
}

// Helper to parse time strings into Date objects
const parseTime = (timeStr: string, baseDate: Date = new Date()) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Calculates daily required, actual, and flex time change
export function calculateDailyData(record: EmployeeRecord, shift: ShiftTiming) {
  // Required Daily Working Hours
  const requiredStart = parseTime(shift.start);
  const requiredEnd = parseTime(
    shift.end,
    shift.start > shift.end ? addMinutes(requiredStart, 24 * 60) : requiredStart
  );
  const requiredDailyMinutes =
    differenceInMinutes(requiredEnd, requiredStart) - shift.lunchBreak.duration;

  // Actual Daily Working Hours
  const clockIn = parseTime(record.clockIn);
  const clockOut = parseTime(
    record.clockOut,
    record.clockIn > record.clockOut ? addMinutes(clockIn, 24 * 60) : clockIn
  );
  const lunchStart = parseTime(record.lunchStart);
  const lunchEnd = parseTime(record.lunchEnd);

  const lunchBreakMinutes = differenceInMinutes(lunchEnd, lunchStart);
  const otherBreakMinutes = record.breaks.reduce((total, breakPeriod) => {
    const breakStart = parseTime(breakPeriod.start);
    const breakEnd = parseTime(breakPeriod.end);
    return total + differenceInMinutes(breakEnd, breakStart);
  }, 0);

  // Total time from In to Out
  const totalTimeFromInOutMinutes = differenceInMinutes(clockOut, clockIn);

  // Total taken breaks (lunch + other breaks)
  const totalTakenBreaksMinutes = lunchBreakMinutes + otherBreakMinutes;

  // Minimum break from shift configuration
  const minBreakMinutes = shift.lunchBreak.duration;

  // Calculate the break duration to subtract (max of taken or min break)
  const effectiveBreakMinutes = Math.max(
    totalTakenBreaksMinutes,
    minBreakMinutes
  );

  // Total working hours according to the formula: (Out-In) - Max(Taken Breaks, Min break)
  const totalWorkingHoursCalculatedMinutes =
    totalTimeFromInOutMinutes - effectiveBreakMinutes;

  // Daily Flex Time Change - now actualDailyMinutes will also use the Max(Taken Breaks, Min break) logic
  const actualDailyMinutes = totalWorkingHoursCalculatedMinutes;
  const dailyFlexTimeChangeMinutes = actualDailyMinutes - requiredDailyMinutes;

  return {
    clockIn: record.clockIn,
    clockOut: record.clockOut,
    lunchStart: record.lunchStart,
    lunchEnd: record.lunchEnd,
    breaks: record.breaks,
    requiredDailyWorkingHours: requiredDailyMinutes, // Return in minutes for aggregation
    actualDailyWorkingHours: actualDailyMinutes, // Actual hours (Out-In - Max(Taken Breaks, Min break))
    dailyFlexTimeChangeMinutes: dailyFlexTimeChangeMinutes, // Return in minutes for aggregation
    lunchBreakMinutes: lunchBreakMinutes, // Return taken lunch minutes
    otherBreakMinutes: otherBreakMinutes, // Return other break minutes
    totalWorkingMinutesExcludingBreaks: totalWorkingHoursCalculatedMinutes, // Updated to user's formula
    totalTimeFromInOutMinutes: totalTimeFromInOutMinutes, // Total time from in to out
    minBreakMinutes: minBreakMinutes, // Standard lunch duration in minutes
  };
}

// New internal helper to calculate cumulative flex bank for a list of records
function calculateCumulativeFlex(
  records: EmployeeRecord[],
  allCompanyShifts: ShiftTiming[],
  initialFlexBank: number = 0
): { record: EmployeeRecord; flexBank: number; dailyFlexMinutes: number }[] {
  let currentFlexBank = initialFlexBank;
  const flexCalculations: {
    record: EmployeeRecord;
    flexBank: number;
    dailyFlexMinutes: number;
  }[] = [];

  for (const record of records) {
    const shift = allCompanyShifts.find((s) => s.id === record.shift.id);
    if (!shift) {
      console.warn(`Shift not found for record ${record.id} on ${record.date}`);
      flexCalculations.push({
        record,
        flexBank: currentFlexBank,
        dailyFlexMinutes: 0,
      }); // Use current flex bank if shift not found
      continue;
    }
    const dailyData = calculateDailyData(record, shift);
    // Flex time change calculation is based on actual working hours (Out-In - Max(Taken Breaks, Min break)) vs Required
    currentFlexBank +=
      dailyData.actualDailyWorkingHours - dailyData.requiredDailyWorkingHours; // Use actual and required in minutes for flex calculation
    flexCalculations.push({
      record,
      flexBank: currentFlexBank,
      dailyFlexMinutes: dailyData.dailyFlexTimeChangeMinutes,
    });
  }
  return flexCalculations;
}

// Calculates the weekly summary based on daily records
export function calculateWeeklySummary(
  employeeRecords: EmployeeRecord[],
  allCompanyShifts: ShiftTiming[], // All shifts to find the correct one for each record
  employeeId: string,
  weekStart: Date,
  weekEnd: Date
) {
  const allEmployeeRecordsSorted = employeeRecords
    .filter((r) => r.id === employeeId)
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  // Calculate flex bank for all historical records up to the start of the current week
  const recordsPriorToWeek = allEmployeeRecordsSorted.filter(
    (record) => parseISO(record.date) < weekStart
  );
  const historicalFlexCalculations = calculateCumulativeFlex(
    recordsPriorToWeek,
    allCompanyShifts
  );

  let flexBankStartOfWeekMinutes = 0;
  if (historicalFlexCalculations.length > 0) {
    flexBankStartOfWeekMinutes =
      historicalFlexCalculations[historicalFlexCalculations.length - 1]
        .flexBank; // Use the raw flex bank value
  }

  // Filter and group records within the current week by date
  const weeklyRecords = allEmployeeRecordsSorted.filter(
    (record) =>
      parseISO(record.date) >= weekStart && parseISO(record.date) <= weekEnd
  );

  const weeklyRecordsGroupedByDate = weeklyRecords.reduce((acc, record) => {
    const dateKey = format(parseISO(record.date), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(record);
    return acc;
  }, {} as Record<string, EmployeeRecord[]>); // Use Record for string indexing

  // Convert grouped records into a sorted array of consolidated daily records for calculation
  const consolidatedDailyRecords: EmployeeRecord[] = Object.keys(
    weeklyRecordsGroupedByDate
  )
    .sort()
    .map((dateKey) => {
      const recordsForDay = weeklyRecordsGroupedByDate[dateKey];
      const firstRecord = recordsForDay[0]; // Take the first record for base properties like shiftId, name, id

      // Aggregate times for the day
      let aggregatedClockIn = parseTime("23:59"); // Initialize with a late time for finding earliest
      let aggregatedClockOut = parseTime("00:00"); // Initialize with an early time for finding latest
      let aggregatedLunchStart = parseTime("23:59");
      let aggregatedLunchEnd = parseTime("00:00");
      let aggregatedBreaks: Array<{ start: string; end: string }> = [];

      recordsForDay.forEach((record) => {
        const currentClockIn = parseTime(record.clockIn);
        const currentClockOut = parseTime(
          record.clockOut,
          currentClockIn.getHours() > parseTime(record.clockOut).getHours()
            ? addMinutes(currentClockIn, 24 * 60)
            : currentClockIn
        );
        const currentLunchStart = parseTime(record.lunchStart);
        const currentLunchEnd = parseTime(record.lunchEnd);

        if (currentClockIn < aggregatedClockIn)
          aggregatedClockIn = currentClockIn;
        if (currentClockOut > aggregatedClockOut)
          aggregatedClockOut = currentClockOut;
        if (currentLunchStart < aggregatedLunchStart)
          aggregatedLunchStart = currentLunchStart;
        if (currentLunchEnd > aggregatedLunchEnd)
          aggregatedLunchEnd = currentLunchEnd;
        aggregatedBreaks = aggregatedBreaks.concat(record.breaks); // Combine all breaks
      });

      // Return a new EmployeeRecord structure with aggregated times
      return {
        ...firstRecord, // Keep original ID, name, shift, etc.
        date: dateKey, // Use the consolidated date
        clockIn: format(aggregatedClockIn, "HH:mm"),
        clockOut: format(aggregatedClockOut, "HH:mm"),
        lunchStart: format(aggregatedLunchStart, "HH:mm"),
        lunchEnd: format(aggregatedLunchEnd, "HH:mm"),
        breaks: aggregatedBreaks,
      };
    });

  let weeklyRequiredMinutes = 0;
  let weeklyActualMinutes = 0;
  let weeklyFlexTimeChangeMinutes = 0;

  // Calculate daily summaries for the current week, and update weekly totals
  const dailySummariesWithFlexBank: DailyRecord[] = calculateCumulativeFlex(
    consolidatedDailyRecords, // Use consolidated records here
    allCompanyShifts,
    flexBankStartOfWeekMinutes
  )
    .map((dailyFlexSummary) => {
      const record = dailyFlexSummary.record;
      const shift = allCompanyShifts.find((s) => s.id === record.shift.id);

      if (!shift) {
        console.warn(
          `Shift not found for record ${record.id} on ${record.date} during weekly aggregation.`
        );
        return null;
      }

      const dailyData = calculateDailyData(record, shift);

      weeklyRequiredMinutes += dailyData.requiredDailyWorkingHours;
      weeklyActualMinutes += dailyData.actualDailyWorkingHours;
      weeklyFlexTimeChangeMinutes += dailyData.dailyFlexTimeChangeMinutes;

      // Calculate previous day's flex bank for display string
      const prevDayFlexBank =
        dailyFlexSummary.flexBank - dailyFlexSummary.dailyFlexMinutes;

      return {
        employeeId: record.id,
        date: format(parseISO(record.date), "MMM dd, yyyy"), // Format date
        inTime: dailyData.clockIn,
        outTime: dailyData.clockOut,
        lunchPeriod: `${dailyData.lunchStart} - ${dailyData.lunchEnd}`,
        totalTime: minutesToHHMM(dailyData.totalTimeFromInOutMinutes),
        minBreak: minutesToHHMM(dailyData.minBreakMinutes),
        takenBreaks: minutesToHHMM(
          dailyData.lunchBreakMinutes + dailyData.otherBreakMinutes
        ),
        totalWorkingHours: `${minutesToHHMM(
          dailyData.totalWorkingMinutesExcludingBreaks
        )} h`,
        requiredHours: `${minutesToHHMM(
          dailyData.requiredDailyWorkingHours
        )} h`,
        flexHours: `${minutesToHHMM(dailyData.dailyFlexTimeChangeMinutes)} H`,
        flexBank: `${minutesToHHMM(prevDayFlexBank)} ${
          dailyData.dailyFlexTimeChangeMinutes >= 0 ? "+" : "-"
        } ${minutesToHHMM(Math.abs(dailyData.dailyFlexTimeChangeMinutes))}`,
        dailyFlexTimeChangeDirection:
          dailyData.dailyFlexTimeChangeMinutes >= 0 ? "added" : "removed",
      } as DailyRecord; // Explicitly cast here
    })
    .filter(Boolean) as DailyRecord[]; // Explicitly cast after filter

  let flexBankEndOfWeekMinutes = 0;
  if (dailySummariesWithFlexBank.length > 0) {
    const lastDailySummary =
      dailySummariesWithFlexBank[dailySummariesWithFlexBank.length - 1];
    const flexBankValuePart = lastDailySummary!.flexBank.split(" ")[0];
    flexBankEndOfWeekMinutes = timeToMinutes(flexBankValuePart);
  }

  return {
    weeklyRequiredHours: minutesToHHMM(weeklyRequiredMinutes),
    weeklyActualHours: minutesToHHMM(weeklyActualMinutes),
    weeklyFlexTimeAddedRemoved: `${
      weeklyFlexTimeChangeMinutes >= 0 && weeklyFlexTimeChangeMinutes !== 0
        ? "+"
        : ""
    }${minutesToHHMM(weeklyFlexTimeChangeMinutes)}`,
    flexBankStartOfWeek: minutesToHHMM(flexBankStartOfWeekMinutes),
    flexBankEnd: `${
      flexBankEndOfWeekMinutes >= 0 && flexBankEndOfWeekMinutes !== 0 ? "+" : ""
    }${minutesToHHMM(flexBankEndOfWeekMinutes)}`,
    dailySummaries: dailySummariesWithFlexBank,
  };
}
