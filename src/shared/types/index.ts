import { ShiftType } from "../../components/ui/ShiftTypeSelector";
import { ShiftTiming } from "../../pages/Shifts/Shift.types";
import { OrderType } from "./enum";

export interface IResponseObject<T> {
  isError: boolean;
  message: string;
  data: T;
}

export interface Pagination extends PageParams {
  offset?: number;
  // page: number;
  total: number;
  // limit: number;
}

export interface PageParams {
  limit: number;
  page: number;
}

export interface WithPagination<T> {
  items: T[];
  pagination: Pagination;
}

export interface ISortData {
  order?: OrderType | "";
  sortBy?: string;
}

export interface Options {
  value: string;
  label: string;
}

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

export interface ConfiguredBreak {
  defaultTime: string;
  duration: number;
  enabled?: boolean;
}

export interface Breaks {
  morning: ConfiguredBreak;
  afternoon: ConfiguredBreak;
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

export interface Company {
  id: string;
  name: string;
  shifts: ShiftTiming[];
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

export interface EmployeeRecord {
  id: string; // Unique identifier for the record
  name: string; // Employee's name
  date: string; // Date of the record in yyyy-MM-dd format
  clockIn: string; // Clock-in time in HH:mm format
  clockOut: string; // Clock-out time in HH:mm format
  lunchStart: string; // Lunch start time in HH:mm format
  lunchEnd: string; // Lunch end time in HH:mm format
  company: string;
  shift: ShiftTiming;
  breaks: Break[]; // List of additional breaks (this now refers to the other Break interface)
  dateId?: string | null;
  flexBank?: number; // Flex bank in minutes
  overtimeStart?: string; // Overtime start time in HH:mm format (optional)
  overtimeEnd?: string; // Overtime end time in HH:mm format (optional)
}

export interface Break {
  start: string; // Time in HH:mm format
  end: string; // Time in HH:mm format
}

// Represents the parameters for working hours, lunch breaks, and additional breaks
export interface Parameters {
  workingHours: WorkingHours;
  lunchBreak: LunchBreak;
  // breaks: Breaks; // This should be updated if using ConfiguredBreaks
  earlyArrival: EarlyArrival;
  lateStay: LateStay;
}
