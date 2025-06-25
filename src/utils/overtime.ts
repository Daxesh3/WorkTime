// Overtime calculation utility
import { ShiftTiming } from "../pages/Shifts/Shift.types";

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export interface OvertimeSegment {
  duration: number;
  multiplier: number;
  durationHHMM: string;
}

export function calculateOvertimeSegments({
  overtimeStart,
  overtimeEnd,
  breaks,
  shift,
}: {
  overtimeStart: string;
  overtimeEnd: string;
  breaks: { start: string; end: string }[];
  shift: ShiftTiming;
}): OvertimeSegment[] {
  console.log("calculateOvertimeSegments input:", {
    overtimeStart,
    overtimeEnd,
    breaks,
    shiftOvertime: shift.overtime,
  });

  if (!shift.overtime) {
    console.log("No overtime config found, returning empty array");
    return [];
  }

  const overtimeConfig = shift.overtime;
  console.log("Overtime config:", overtimeConfig);

  let start = timeToMinutes(overtimeStart);
  let end = timeToMinutes(overtimeEnd);
  let total = end - start;

  console.log("Total overtime minutes before breaks:", total);

  // Subtract break time within overtime
  for (const br of breaks) {
    const bStart = timeToMinutes(br.start);
    const bEnd = timeToMinutes(br.end);
    // If break overlaps with overtime
    const overlapStart = Math.max(start, bStart);
    const overlapEnd = Math.min(end, bEnd);
    if (overlapStart < overlapEnd) {
      const breakOverlap = overlapEnd - overlapStart;
      total -= breakOverlap;
      console.log(
        `Break ${br.start}-${br.end} overlaps overtime by ${breakOverlap} minutes`
      );
    }
  }

  console.log("Total overtime minutes after breaks:", total);

  const free = timeToMinutes(overtimeConfig.freeOvertimeDuration);
  const next = timeToMinutes(overtimeConfig.nextOvertimeDuration);

  console.log("Overtime thresholds:", {
    free,
    next,
    nextMultiplier: overtimeConfig.nextOvertimeMultiplier,
    beyondMultiplier: overtimeConfig.beyondOvertimeMultiplier,
  });

  let segments: OvertimeSegment[] = [];
  if (total > 0) {
    if (total <= free) {
      segments.push({
        duration: total,
        multiplier: 1,
        durationHHMM: minutesToHHMM(total),
      });
    } else if (total <= free + next) {
      segments.push({
        duration: free,
        multiplier: 1,
        durationHHMM: minutesToHHMM(free),
      });
      segments.push({
        duration: total - free,
        multiplier: overtimeConfig.nextOvertimeMultiplier,
        durationHHMM: minutesToHHMM(total - free),
      });
    } else {
      segments.push({
        duration: free,
        multiplier: 1,
        durationHHMM: minutesToHHMM(free),
      });
      segments.push({
        duration: next,
        multiplier: overtimeConfig.nextOvertimeMultiplier,
        durationHHMM: minutesToHHMM(next),
      });
      segments.push({
        duration: total - free - next,
        multiplier: overtimeConfig.beyondOvertimeMultiplier,
        durationHHMM: minutesToHHMM(total - free - next),
      });
    }
  }

  console.log("Final segments:", segments);
  return segments;
}
