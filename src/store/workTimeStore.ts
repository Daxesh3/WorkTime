import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Parameters, EmployeeRecord, Break, CalculationDetails } from '../shared/types'; // Assuming these types are defined in shared/types

const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const minutesToTime = (minutes: any) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Define the store state and actions
interface WorkTimeStore {
    parameters: Parameters;
    employeeRecords: EmployeeRecord[];
    updateParameters: (newParameters: Partial<Parameters>) => void;
    addEmployeeRecord: (record: Omit<EmployeeRecord, 'id' | 'calculatedHours' | 'calculationDetails'>) => void;
    updateEmployeeRecord: (id: string, updates: Partial<EmployeeRecord>) => void;
    deleteEmployeeRecord: (id: string) => void;
    simulateCalculation: (record: EmployeeRecord, parameters: Parameters) => CalculationResult;
}

// Define the structure of the calculation result
interface CalculationResult {
    effectiveStart: string;
    effectiveEnd: string;
    totalWorkingMinutes: number;
    lunchDuration: number;
    otherBreaksDuration: number;
    regularHours: number;
    overtimeHours: number;
    overtimePay: number;
    totalEffectiveHours: number;
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
                    calculatedHours: 0,
                    calculationDetails: {} as CalculationDetails,
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

            // Simulate calculation for the calculator page
            // simulateCalculation: (record, parameters) => {
            //     // Calculate effective start time
            //     const [startHour, startMinute] = record.clockIn.split(':').map(Number);
            //     const [standardStartHour, standardStartMinute] = parameters.workingHours.start.split(':').map(Number);

            //     const startTime = new Date();
            //     startTime.setHours(startHour, startMinute, 0, 0);

            //     const standardStartTime = new Date();
            //     standardStartTime.setHours(standardStartHour, standardStartMinute, 0, 0);

            //     const earlyArrivalMinutes = Math.max(0, (standardStartTime - startTime) / (1000 * 60));
            //     const effectiveStartTime = new Date(startTime);

            //     if (earlyArrivalMinutes > parameters.earlyArrival.maxMinutes) {
            //         effectiveStartTime.setHours(standardStartHour, standardStartMinute, 0, 0);
            //     }

            //     // Calculate effective end time
            //     const [endHour, endMinute] = record.clockOut.split(':').map(Number);
            //     const [standardEndHour, standardEndMinute] = parameters.workingHours.end.split(':').map(Number);

            //     const endTime = new Date();
            //     endTime.setHours(endHour, endMinute, 0, 0);

            //     const standardEndTime = new Date();
            //     standardEndTime.setHours(standardEndHour, standardEndMinute, 0, 0);

            //     const lateStayMinutes = Math.max(0, (endTime - standardEndTime) / (1000 * 60));
            //     const effectiveEndTime = new Date(endTime);

            //     if (lateStayMinutes > parameters.lateStay.maxMinutes) {
            //         effectiveEndTime.setHours(standardEndHour, standardEndMinute, 0, 0);
            //     }

            //     // Calculate lunch break time
            //     const [lunchStartHour, lunchStartMinute] = record.lunchStart.split(':').map(Number);
            //     const [lunchEndHour, lunchEndMinute] = record.lunchEnd.split(':').map(Number);

            //     const lunchStartTime = new Date();
            //     lunchStartTime.setHours(lunchStartHour, lunchStartMinute, 0, 0);

            //     const lunchEndTime = new Date();
            //     lunchEndTime.setHours(lunchEndHour, lunchEndMinute, 0, 0);

            //     const lunchDuration = (lunchEndTime - lunchStartTime) / (1000 * 60);

            //     // Calculate other break times
            //     let otherBreaksDuration = 0;
            //     record.breaks.forEach((breakItem) => {
            //         const [breakStartHour, breakStartMinute] = breakItem.start.split(':').map(Number);
            //         const [breakEndHour, breakEndMinute] = breakItem.end.split(':').map(Number);

            //         const breakStartTime = new Date();
            //         breakStartTime.setHours(breakStartHour, breakStartMinute, 0, 0);

            //         const breakEndTime = new Date();
            //         breakEndTime.setHours(breakEndHour, breakEndMinute, 0, 0);

            //         otherBreaksDuration += (breakEndTime - breakStartTime) / (1000 * 60);
            //     });

            //     // Calculate total working minutes
            //     const totalWorkingMinutes = (effectiveEndTime - effectiveStartTime) / (1000 * 60) - lunchDuration - otherBreaksDuration;
            //     const calculatedHours = totalWorkingMinutes / 60;

            //     // Calculate overtime hours
            //     const standardHours = parameters.workingHours.totalRequired;
            //     const overtimeHours = Math.max(0, calculatedHours - standardHours);

            //     // Calculate overtime pay
            //     const overtimePay = overtimeHours * parameters.lateStay.overtimeMultiplier;

            //     // Check lunch break window
            //     const [flexWindowStartHour, flexWindowStartMinute] = parameters.lunchBreak.flexWindowStart.split(':').map(Number);
            //     const [flexWindowEndHour, flexWindowEndMinute] = parameters.lunchBreak.flexWindowEnd.split(':').map(Number);

            //     const flexWindowStartTime = new Date();
            //     flexWindowStartTime.setHours(flexWindowStartHour, flexWindowStartMinute, 0, 0);

            //     const flexWindowEndTime = new Date();
            //     flexWindowEndTime.setHours(flexWindowEndHour, flexWindowEndMinute, 0, 0);

            //     const isLunchBreakInWindow = lunchStartTime >= flexWindowStartTime && lunchEndTime <= flexWindowEndTime;
            //     const isLunchBreakCorrectDuration = Math.abs(lunchDuration - parameters.lunchBreak.duration) <= 5; // Allow 5 minutes tolerance

            //     return {
            //         effectiveStart: `${effectiveStartTime.getHours().toString().padStart(2, '0')}:${effectiveStartTime
            //             .getMinutes()
            //             .toString()
            //             .padStart(2, '0')}`,
            //         effectiveEnd: `${effectiveEndTime.getHours().toString().padStart(2, '0')}:${effectiveEndTime
            //             .getMinutes()
            //             .toString()
            //             .padStart(2, '0')}`,
            //         totalWorkingMinutes,
            //         lunchDuration,
            //         otherBreaksDuration,
            //         regularHours: calculatedHours,
            //         overtimeHours,
            //         overtimePay,
            //         totalEffectiveHours: calculatedHours + overtimePay,
            //         isLunchBreakInWindow,
            //         isLunchBreakCorrectDuration,
            //         earlyArrival: earlyArrivalMinutes > 0,
            //         earlyArrivalMinutes: Math.round(earlyArrivalMinutes),
            //         lateArrival: startTime > standardStartTime,
            //         lateArrivalMinutes: Math.round(Math.max(0, (startTime - standardStartTime) / (1000 * 60))),
            //         earlyDeparture: endTime < standardEndTime,
            //         earlyDepartureMinutes: Math.round(Math.max(0, (standardEndTime - endTime) / (1000 * 60))),
            //         lateDeparture: endTime > standardEndTime,
            //         lateDepartureMinutes: Math.round(Math.max(0, (endTime - standardEndTime) / (1000 * 60))),
            //     };
            // },
            simulateCalculation: (record, parameters) => {
                // Convert time strings to minutes for easier calculation
                const workStartMin = timeToMinutes(parameters.workingHours.start);
                const workEndMin = timeToMinutes(parameters.workingHours.end);
                const clockInMin = timeToMinutes(record.clockIn);
                const clockOutMin = timeToMinutes(record.clockOut);
                const lunchStartMin = timeToMinutes(record.lunchStart);
                const lunchEndMin = timeToMinutes(record.lunchEnd);

                // Calculate effective start time
                let effectiveStartMin = clockInMin;
                if (clockInMin < workStartMin) {
                    // Early arrival
                    const earlyByMinutes = workStartMin - clockInMin;
                    if (earlyByMinutes <= parameters.earlyArrival.maxMinutes && parameters.earlyArrival.countTowardsTotal) {
                        // Count early time
                        effectiveStartMin = clockInMin;
                    } else {
                        // Don't count early time
                        effectiveStartMin = workStartMin;
                    }
                }

                // Calculate effective end time
                let effectiveEndMin = clockOutMin;
                let overtimeMinutes = 0;
                if (clockOutMin > workEndMin) {
                    // Late stay
                    const lateByMinutes = clockOutMin - workEndMin;
                    if (lateByMinutes <= parameters.lateStay.maxMinutes) {
                        if (parameters.lateStay.countTowardsTotal) {
                            // Count late time
                            effectiveEndMin = clockOutMin;
                        } else {
                            // Don't count late time
                            effectiveEndMin = workEndMin;
                        }
                    } else {
                        // Handle overtime
                        effectiveEndMin = workEndMin;
                        overtimeMinutes = lateByMinutes;
                    }
                }

                // Calculate lunch break time
                const lunchBreakMinutes = lunchEndMin - lunchStartMin;

                // Calculate other break times
                const otherBreakMinutes = record.breaks.reduce((total, breakPeriod) => {
                    return total + (timeToMinutes(breakPeriod.end) - timeToMinutes(breakPeriod.start));
                }, 0);

                // Calculate total working minutes
                let totalWorkingMinutes = effectiveEndMin - effectiveStartMin - lunchBreakMinutes - otherBreakMinutes;

                // Convert to hours
                const calculatedHours = totalWorkingMinutes / 60;

                // Calculate overtime hours
                const overtimeHours = overtimeMinutes / 60;

                // Create detailed calculation breakdown
                return {
                    effectiveStart: minutesToTime(effectiveStartMin),
                    effectiveEnd: minutesToTime(effectiveEndMin),
                    lunchDuration: lunchBreakMinutes,
                    otherBreaksDuration: otherBreakMinutes,
                    totalWorkingMinutes,
                    regularHours: calculatedHours,
                    overtimeHours,
                    overtimeRate: parameters.lateStay.overtimeMultiplier,
                    overtimePay: overtimeHours * parameters.lateStay.overtimeMultiplier,
                    totalEffectiveHours: calculatedHours + overtimeHours * parameters.lateStay.overtimeMultiplier,
                    // Status calculations
                    earlyArrival: clockInMin < workStartMin,
                    earlyArrivalMinutes: clockInMin < workStartMin ? workStartMin - clockInMin : 0,
                    lateArrival: clockInMin > workStartMin,
                    lateArrivalMinutes: clockInMin > workStartMin ? clockInMin - workStartMin : 0,
                    earlyDeparture: clockOutMin < workEndMin,
                    earlyDepartureMinutes: clockOutMin < workEndMin ? workEndMin - clockOutMin : 0,
                    lateDeparture: clockOutMin > workEndMin,
                    lateDepartureMinutes: clockOutMin > workEndMin ? clockOutMin - workEndMin : 0,
                    isLunchBreakInWindow:
                        lunchStartMin >= timeToMinutes(parameters.lunchBreak.flexWindowStart) &&
                        lunchEndMin <= timeToMinutes(parameters.lunchBreak.flexWindowEnd),
                    isLunchBreakCorrectDuration: lunchBreakMinutes === parameters.lunchBreak.duration,
                };
            },
        }),
        {
            name: 'work-time-storage',
        }
    )
);

export default useWorkTimeStore;
