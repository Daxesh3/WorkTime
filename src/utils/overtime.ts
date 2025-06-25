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
  if (!shift.overtime) return [];
  const overtimeConfig = shift.overtime;
  let start = timeToMinutes(overtimeStart);
  let end = timeToMinutes(overtimeEnd);
  let total = end - start;

  // Subtract break time within overtime
  for (const br of breaks) {
    const bStart = timeToMinutes(br.start);
    const bEnd = timeToMinutes(br.end);
    // If break overlaps with overtime
    const overlapStart = Math.max(start, bStart);
    const overlapEnd = Math.min(end, bEnd);
    if (overlapStart < overlapEnd) {
      total -= overlapEnd - overlapStart;
    }
  }

  const free = timeToMinutes(overtimeConfig.freeOvertimeDuration);
  const next = timeToMinutes(overtimeConfig.nextOvertimeDuration);

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
  return segments;
}
