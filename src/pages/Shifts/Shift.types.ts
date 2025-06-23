import { ShiftType } from "../../components/ui/ShiftTypeSelector";

export interface ShiftTiming {
  id?: string;
  name: ShiftType;
  start: string;
  end: string;
  lunchBreak: {
    defaultStart: string;
    duration: number;
    flexWindowStart: string;
    flexWindowEnd: string;
  };
  shiftBonus: {
    isShiftBonus: boolean;
    bonusAmount: number;
  };
  earlyArrival: {
    maxMinutes: number;
    countTowardsTotal: boolean;
  };
  lateStay: {
    maxMinutes: number;
    countTowardsTotal: boolean;
    overtimeMultiplier: number;
  };
}

export interface ShiftManagementProps {
  companyName: string;
  shifts: ShiftTiming[];
  onShiftCreate: (shift: ShiftTiming) => Promise<void>;
  onShiftDelete: (shiftId: string) => Promise<void>;
  onShiftUpdate: (shift: ShiftTiming) => Promise<void>;
}
