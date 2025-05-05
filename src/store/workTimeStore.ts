import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { differenceInMinutes, addMinutes, format } from 'date-fns';
import { Parameters, EmployeeRecord } from '../shared/types'; // Assuming these types are defined in shared/types
import { formatDurationManually } from '../shared/utils';
import { ShiftTiming } from '../pages/Shifts/Shift.types';

// Define the store state and actions
interface WorkTimeStore {
    parameters: Parameters;
    employeeRecords: EmployeeRecord[];
    updateParameters: (newParameters: Partial<Parameters>) => void;
    addEmployeeRecord: (record: Omit<EmployeeRecord, 'id' | 'calculatedHours'>) => void;
    updateEmployeeRecord: (id: string, updates: Partial<EmployeeRecord>) => void;
    deleteEmployeeRecord: (id: string) => void;
    simulateCalculation: (record: EmployeeRecord, shift: ShiftTiming) => CalculationResult;
}

// Define the structure of the calculation result
export interface CalculationResult {
    effectiveStart: string;
    effectiveEnd: string;
    totalWorkingMinutes: number;
    lunchDuration: number;
    otherBreaksDuration: number;
    regularHours: string;
    overtimeHours: number;
    overtimePay: number;
    totalEffectiveHours: string;
    isLunchBreakInWindow: boolean;
    isLunchBreakCorrectDuration: boolean;
    earlyArrival: boolean;
    earlyArrivalMinutes: number;
    lateArrival: boolean;
    lateArrivalMinutes: number;
    earlyDeparture: boolean;
    earlyDepartureMinutes: number;
    lateDeparture: boolean;
    lateDepartureMinutes: number;
}

const useWorkTimeStore = create<WorkTimeStore>()(
    persist(
        (set, get) => ({
            // Company parameters
            parameters: {
                workingHours: {
                    start: '08:00',
                    end: '16:00',
                    totalRequired: 8, // in hours
                },
                lunchBreak: {
                    duration: 30, // in minutes
                    defaultStart: '12:00',
                    flexWindowStart: '11:00',
                    flexWindowEnd: '13:00',
                },
                earlyArrival: {
                    maxMinutes: 30, // How early can an employee arrive before it counts
                    countTowardsTotal: false, // Whether early arrival counts towards total working hours
                },
                lateStay: {
                    maxMinutes: 60, // How late can an employee stay before overtime policy applies
                    countTowardsTotal: true, // Whether staying late counts towards total
                    overtimeMultiplier: 1.5, // Overtime pay multiplier
                },
            },

            // Employee schedule records
            employeeRecords: [],

            // Update parameters
            updateParameters: (newParameters) => {
                set((state) => ({
                    parameters: {
                        ...state.parameters,
                        ...newParameters,
                    },
                }));
            },

            // Add a new employee record
            addEmployeeRecord: (record) => {
                const newRecord: EmployeeRecord = {
                    ...record,
                    id: Date.now().toString(),
                };
                set({ employeeRecords: [...get().employeeRecords, newRecord] });
            },

            // Update an existing employee record
            updateEmployeeRecord: (id, updates) => {
                set((state) => ({
                    employeeRecords: state.employeeRecords.map((record) => (record.id === id ? { ...record, ...updates } : record)),
                }));
            },

            // Delete an employee record
            deleteEmployeeRecord: (id) => {
                set((state) => ({
                    employeeRecords: state.employeeRecords.filter((record) => record.id !== id),
                }));
            },
            simulateCalculation: (record, shift) => {
                // const shift = record.shift;

                // Helper to parse time strings into Date objects
                const parseTime = (timeStr: string, baseDate: Date = new Date()) => {
                    const [hours, minutes] = timeStr.split(':').map(Number);
                    const date = new Date(baseDate);
                    date.setHours(hours, minutes, 0, 0);
                    return date;
                };

                // Parse shift and record times
                const workStart = parseTime(shift.start);
                const workEnd = parseTime(shift.end, shift.start > shift.end ? addMinutes(workStart, 24 * 60) : workStart); // Handle night shifts
                const clockIn = parseTime(record.clockIn);
                const clockOut = parseTime(record.clockOut, record.clockIn > record.clockOut ? addMinutes(clockIn, 24 * 60) : clockIn); // Handle night shifts
                const lunchStart = parseTime(record.lunchStart);
                const lunchEnd = parseTime(record.lunchEnd);
                const flexWindowStart = parseTime(shift.lunchBreak.flexWindowStart);
                const flexWindowEnd = parseTime(shift.lunchBreak.flexWindowEnd);

                // Calculate effective start time
                let effectiveStart = clockIn;
                if (clockIn < workStart) {
                    const earlyByMinutes = differenceInMinutes(workStart, clockIn);
                    console.log('earlyByMinutes', earlyByMinutes > shift.earlyArrival.maxMinutes, shift.earlyArrival.countTowardsTotal);
                    if (earlyByMinutes > shift.earlyArrival.maxMinutes || !shift.earlyArrival.countTowardsTotal) {
                        effectiveStart = workStart;
                    }
                }

                // Calculate effective end time
                let effectiveEnd = clockOut;
                let overtimeHours = 0;
                let overtimeMinutes = 0;
                if (clockOut > workEnd) {
                    const lateByMinutes = differenceInMinutes(clockOut, workEnd);
                    if (lateByMinutes > shift.lateStay.maxMinutes) {
                        overtimeMinutes = lateByMinutes;
                        effectiveEnd = workEnd;
                        overtimeHours = overtimeMinutes / 60;
                    } else if (!shift.lateStay.countTowardsTotal) {
                        effectiveEnd = workEnd;
                    }
                }

                // Calculate lunch break duration
                const lunchBreakMinutes = differenceInMinutes(lunchEnd, lunchStart);

                // Calculate other breaks duration
                const otherBreakMinutes = record.breaks.reduce((total, breakPeriod) => {
                    const breakStart = parseTime(breakPeriod.start);
                    const breakEnd = parseTime(breakPeriod.end);
                    return total + differenceInMinutes(breakEnd, breakStart);
                }, 0);

                // Calculate total working minutes
                const totalWorkingMinutes = differenceInMinutes(effectiveEnd, effectiveStart) - lunchBreakMinutes - otherBreakMinutes;

                // Convert total working minutes to HH:mm format
                const calculatedHours = format(addMinutes(new Date(0).getTime(), totalWorkingMinutes), 'HH:mm');

                // Calculate overtime hours in HH:mm format
                // const overtimeHours = format(addMinutes(new Date(0), overtimeMinutes), 'HH:mm');

                // Calculate overtime pay
                const overtimePay = (overtimeMinutes / 60) * shift.lateStay.overtimeMultiplier;

                // Check lunch break window
                const isLunchBreakInWindow = lunchStart >= flexWindowStart && lunchEnd <= flexWindowEnd;
                const isLunchBreakCorrectDuration = lunchBreakMinutes === shift.lunchBreak.duration;

                // Calculate early/late arrival and departure
                const earlyArrivalMinutes = clockIn < workStart ? differenceInMinutes(workStart, clockIn) : 0;
                const lateArrivalMinutes = clockIn > workStart ? differenceInMinutes(clockIn, workStart) : 0;
                const earlyDepartureMinutes = clockOut < workEnd ? differenceInMinutes(workEnd, clockOut) : 0;
                const lateDepartureMinutes = clockOut > workEnd ? differenceInMinutes(clockOut, workEnd) : 0;

                return {
                    effectiveStart: format(effectiveStart, 'HH:mm'),
                    effectiveEnd: format(effectiveEnd, 'HH:mm'),
                    lunchDuration: lunchBreakMinutes,
                    otherBreaksDuration: otherBreakMinutes,
                    totalWorkingMinutes,
                    regularHours: formatDurationManually(differenceInMinutes(workEnd, workStart) - shift.lunchBreak.duration),
                    overtimeHours,
                    overtimeRate: shift.lateStay.overtimeMultiplier,
                    overtimePay,
                    totalEffectiveHours: formatDurationManually(totalWorkingMinutes),
                    // Status calculations
                    earlyArrival: clockIn < workStart,
                    earlyArrivalMinutes,
                    lateArrival: clockIn > workStart,
                    lateArrivalMinutes,
                    earlyDeparture: clockOut < workEnd,
                    earlyDepartureMinutes,
                    lateDeparture: clockOut > workEnd,
                    lateDepartureMinutes,
                    isLunchBreakInWindow,
                    isLunchBreakCorrectDuration,
                };
            },
        }),
        {
            name: 'work-time-storage',
        }
    )
);

export default useWorkTimeStore;
