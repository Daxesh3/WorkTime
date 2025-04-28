export interface WorkingHours {
    start: string;
    end: string;
    totalRequired: number;
}

export interface LunchBreak {
    defaultStart: string;
    duration: number;
    flexWindowStart: string;
    flexWindowEnd: string;
}

export interface Break {
    defaultTime: string;
    duration: number;
}

export interface Breaks {
    morning: Break;
    afternoon: Break;
}

export interface EarlyArrival {
    maxMinutes: number;
    countTowardsTotal: boolean;
}

export interface LateStay {
    maxMinutes: number;
    countTowardsTotal: boolean;
    overtimeMultiplier: number;
}

export interface CompanyParameters {
    workingHours: WorkingHours;
    lunchBreak: LunchBreak;
    breaks: Breaks;
    earlyArrival: EarlyArrival;
    lateStay: LateStay;
}

export interface Company {
    id: string;
    name: string;
    parameters: CompanyParameters;
    createdAt: Date;
    updatedAt: Date;
}

export interface WorkTimeRecord {
    id: string;
    employeeId: string;
    date: Date;
    startTime: string;
    endTime: string;
    lunchBreakStart?: string;
    lunchBreakEnd?: string;
    morningBreakStart?: string;
    morningBreakEnd?: string;
    afternoonBreakStart?: string;
    afternoonBreakEnd?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CalculationResult {
    effectiveHours: number;
    regularHours: number;
    overtime: number;
    deductions: number;
    totalHours: number;
    isComplete: boolean;
    notes: string[];
}
