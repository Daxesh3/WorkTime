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
    enabled?: boolean;
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

export interface EmployeeRecord {
    id: string; // Unique identifier for the record
    name: string; // Employee's name
    date: string; // Date of the record in yyyy-MM-dd format
    clockIn: string; // Clock-in time in HH:mm format
    clockOut: string; // Clock-out time in HH:mm format
    lunchStart: string; // Lunch start time in HH:mm format
    lunchEnd: string; // Lunch end time in HH:mm format
    breaks: Break[]; // List of additional breaks
    calculatedHours: number; // Total calculated hours for the day
    calculationDetails?: CalculationDetails; // Optional detailed calculation results
}

export interface CalculationDetails {
    effectiveStart: string; // Effective start time in HH:mm format
    effectiveEnd: string; // Effective end time in HH:mm format
    totalWorkingMinutes: number; // Total working minutes
    lunchDuration: number; // Duration of the lunch break in minutes
    otherBreaksDuration: number; // Duration of other breaks in minutes
    regularHours: number; // Regular working hours
    overtimeHours: number; // Overtime hours
    overtimePay: number; // Overtime pay
    totalEffectiveHours: number; // Total effective hours (regular + overtime)
}

export interface Break {
    start: string; // Time in HH:mm format
    end: string; // Time in HH:mm format
}

// Represents the parameters for working hours, lunch breaks, and additional breaks
export interface Parameters {
    workingHours: WorkingHours;
    lunchBreak: LunchBreak;
    // breaks: Breaks;
    earlyArrival: EarlyArrival;
    lateStay: LateStay;
}
