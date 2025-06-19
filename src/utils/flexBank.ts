import { EmployeeRecord } from "../shared/types";

// Helper to get minutes from HH:mm
function getMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Calculate actual working minutes for a day
function calculateActualWorkingMinutes(record: EmployeeRecord): number {
  const start = getMinutes(record.clockIn);
  const end = getMinutes(record.clockOut);
  // Handle overnight shifts
  return end >= start ? end - start : 24 * 60 - start + end;
}

// Main function to calculate flex bank for a list of records (sorted by date)
export function calculateFlexBank(
  records: EmployeeRecord[],
  requiredHours: number
): EmployeeRecord[] {
  let flexBank = 0;
  return records.map((record) => {
    const actualMinutes = calculateActualWorkingMinutes(record);
    const dailyFlexChange = actualMinutes - requiredHours * 60;
    flexBank += dailyFlexChange;
    return { ...record, flexBank };
  });
}
