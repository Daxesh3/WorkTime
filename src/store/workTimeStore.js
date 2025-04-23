import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { parseISO, format, addMinutes } from 'date-fns'

// Helper to convert time string to minutes from midnight
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

// Helper to convert minutes from midnight to time string
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

const useWorkTimeStore = create(
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
        breaks: {
          morning: {
            enabled: true,
            duration: 15, // in minutes
            defaultTime: '10:00',
          },
          afternoon: {
            enabled: true,
            duration: 15, // in minutes
            defaultTime: '14:00',
          },
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
      employeeRecords: [
        {
          id: '1',
          name: 'John Doe',
          date: '2023-09-15',
          clockIn: '07:49',
          clockOut: '16:06',
          lunchStart: '11:45',
          lunchEnd: '12:15',
          breaks: [
            { start: '10:00', end: '10:15' },
            { start: '14:30', end: '14:45' }
          ],
          calculatedHours: 0, // Will be filled by calculation function
          calculationDetails: {} // Will be filled with detailed breakdown
        },
        {
          id: '2',
          name: 'Jane Smith',
          date: '2023-09-15',
          clockIn: '08:05',
          clockOut: '16:00',
          lunchStart: '12:00',
          lunchEnd: '12:30',
          breaks: [
            { start: '10:00', end: '10:15' },
          ],
          calculatedHours: 0,
          calculationDetails: {}
        },
        {
          id: '3',
          name: 'Alex Johnson',
          date: '2023-09-15',
          clockIn: '07:30',
          clockOut: '17:15',
          lunchStart: '11:30',
          lunchEnd: '12:15',
          breaks: [
            { start: '10:00', end: '10:15' },
            { start: '14:00', end: '14:15' }
          ],
          calculatedHours: 0,
          calculationDetails: {}
        }
      ],

      // Update parameters
      updateParameters: (newParameters) => {
        set((state) => ({
          parameters: {
            ...state.parameters,
            ...newParameters
          }
        }))
        // Recalculate all employee records when parameters change
        get().calculateAllHours()
      },

      // Add a new employee record
      addEmployeeRecord: (record) => {
        const newRecord = {
          id: Date.now().toString(),
          ...record,
          calculatedHours: 0
        }
        set({ employeeRecords: [...get().employeeRecords, newRecord] })
        // Calculate hours for the new record
        get().calculateHours(newRecord.id)
      },

      // Update an existing employee record
      updateEmployeeRecord: (id, updates) => {
        set(state => ({
          employeeRecords: state.employeeRecords.map(record =>
            record.id === id ? { ...record, ...updates } : record
          )
        }))
        // Recalculate hours for the updated record
        get().calculateHours(id)
      },

      // Delete an employee record
      deleteEmployeeRecord: (id) => {
        set((state) => ({
          employeeRecords: state.employeeRecords.filter(record => record.id !== id)
        }))
      },

      // Calculate working hours for a specific employee
      calculateHours: (id) => {
        set((state) => {
          const record = state.employeeRecords.find(r => r.id === id)
          if (!record) return state

          const params = state.parameters

          // Convert time strings to minutes for easier calculation
          const workStartMin = timeToMinutes(params.workingHours.start)
          const workEndMin = timeToMinutes(params.workingHours.end)
          const clockInMin = timeToMinutes(record.clockIn)
          const clockOutMin = timeToMinutes(record.clockOut)
          const lunchStartMin = timeToMinutes(record.lunchStart)
          const lunchEndMin = timeToMinutes(record.lunchEnd)

          // Calculate effective start time
          let effectiveStartMin = clockInMin
          if (clockInMin < workStartMin) {
            // Early arrival
            const earlyByMinutes = workStartMin - clockInMin
            if (earlyByMinutes <= params.earlyArrival.maxMinutes && params.earlyArrival.countTowardsTotal) {
              // Count early time
              effectiveStartMin = clockInMin
            } else {
              // Don't count early time
              effectiveStartMin = workStartMin
            }
          }

          // Calculate effective end time
          let effectiveEndMin = clockOutMin
          let overtimeMinutes = 0
          if (clockOutMin > workEndMin) {
            // Late stay
            const lateByMinutes = clockOutMin - workEndMin
            if (lateByMinutes <= params.lateStay.maxMinutes) {
              if (params.lateStay.countTowardsTotal) {
                // Count late time
                effectiveEndMin = clockOutMin
              } else {
                // Don't count late time
                effectiveEndMin = workEndMin
              }
            } else {
              // Handle overtime
              effectiveEndMin = workEndMin
              overtimeMinutes = lateByMinutes
            }
          }

          // Calculate lunch break time
          const lunchBreakMinutes = lunchEndMin - lunchStartMin

          // Calculate other break times
          const otherBreakMinutes = record.breaks.reduce((total, breakPeriod) => {
            return total + (timeToMinutes(breakPeriod.end) - timeToMinutes(breakPeriod.start))
          }, 0)

          // Calculate total working minutes
          let totalWorkingMinutes = effectiveEndMin - effectiveStartMin - lunchBreakMinutes - otherBreakMinutes

          // Convert to hours
          const calculatedHours = totalWorkingMinutes / 60

          // Calculate overtime hours
          const overtimeHours = overtimeMinutes / 60

          // Create detailed calculation breakdown
          const calculationDetails = {
            effectiveStart: minutesToTime(effectiveStartMin),
            effectiveEnd: minutesToTime(effectiveEndMin),
            lunchDuration: lunchBreakMinutes,
            otherBreaksDuration: otherBreakMinutes,
            totalWorkingMinutes,
            regularHours: calculatedHours,
            overtimeHours,
            overtimeRate: params.lateStay.overtimeMultiplier,
            overtimePay: overtimeHours * params.lateStay.overtimeMultiplier,
            totalEffectiveHours: calculatedHours + (overtimeHours * params.lateStay.overtimeMultiplier),
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
              lunchStartMin >= timeToMinutes(params.lunchBreak.flexWindowStart) &&
              lunchEndMin <= timeToMinutes(params.lunchBreak.flexWindowEnd),
            isLunchBreakCorrectDuration: lunchBreakMinutes === params.lunchBreak.duration,
          }

          // Update the record with calculated values
          return {
            ...state,
            employeeRecords: state.employeeRecords.map(r =>
              r.id === id
                ? {
                  ...r,
                  calculatedHours: calculatedHours,
                  calculationDetails
                }
                : r
            )
          }
        })
      },

      // Calculate hours for all employees
      calculateAllHours: () => {
        const store = get()
        store.employeeRecords.forEach(record => {
          store.calculateHours(record.id)
        })
      },

      // Simulates calculation for preview purposes without saving
      simulateCalculation: (recordData) => {
        const params = get().parameters

        // Convert time strings to minutes for easier calculation
        const workStartMin = timeToMinutes(params.workingHours.start)
        const workEndMin = timeToMinutes(params.workingHours.end)
        const clockInMin = timeToMinutes(recordData.clockIn)
        const clockOutMin = timeToMinutes(recordData.clockOut)
        const lunchStartMin = timeToMinutes(recordData.lunchStart)
        const lunchEndMin = timeToMinutes(recordData.lunchEnd)

        // Calculate effective start time
        let effectiveStartMin = clockInMin
        if (clockInMin < workStartMin) {
          // Early arrival
          const earlyByMinutes = workStartMin - clockInMin
          if (earlyByMinutes <= params.earlyArrival.maxMinutes && params.earlyArrival.countTowardsTotal) {
            // Count early time
            effectiveStartMin = clockInMin
          } else {
            // Don't count early time
            effectiveStartMin = workStartMin
          }
        }

        // Calculate effective end time
        let effectiveEndMin = clockOutMin
        let overtimeMinutes = 0
        if (clockOutMin > workEndMin) {
          // Late stay
          const lateByMinutes = clockOutMin - workEndMin
          if (lateByMinutes <= params.lateStay.maxMinutes) {
            if (params.lateStay.countTowardsTotal) {
              // Count late time
              effectiveEndMin = clockOutMin
            } else {
              // Don't count late time
              effectiveEndMin = workEndMin
            }
          } else {
            // Handle overtime
            effectiveEndMin = workEndMin
            overtimeMinutes = lateByMinutes
          }
        }

        // Calculate lunch break time
        const lunchBreakMinutes = lunchEndMin - lunchStartMin

        // Calculate other break times
        const otherBreakMinutes = recordData.breaks.reduce((total, breakPeriod) => {
          return total + (timeToMinutes(breakPeriod.end) - timeToMinutes(breakPeriod.start))
        }, 0)

        // Calculate total working minutes
        let totalWorkingMinutes = effectiveEndMin - effectiveStartMin - lunchBreakMinutes - otherBreakMinutes

        // Convert to hours
        const calculatedHours = totalWorkingMinutes / 60

        // Calculate overtime hours
        const overtimeHours = overtimeMinutes / 60

        // Create detailed calculation breakdown
        return {
          effectiveStart: minutesToTime(effectiveStartMin),
          effectiveEnd: minutesToTime(effectiveEndMin),
          lunchDuration: lunchBreakMinutes,
          otherBreaksDuration: otherBreakMinutes,
          totalWorkingMinutes,
          regularHours: calculatedHours,
          overtimeHours,
          overtimeRate: params.lateStay.overtimeMultiplier,
          overtimePay: overtimeHours * params.lateStay.overtimeMultiplier,
          totalEffectiveHours: calculatedHours + (overtimeHours * params.lateStay.overtimeMultiplier),
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
            lunchStartMin >= timeToMinutes(params.lunchBreak.flexWindowStart) &&
            lunchEndMin <= timeToMinutes(params.lunchBreak.flexWindowEnd),
          isLunchBreakCorrectDuration: lunchBreakMinutes === params.lunchBreak.duration,
        }
      }
    }),
    {
      name: 'worktime-storage',
      getStorage: () => localStorage
    }
  )
)

export default useWorkTimeStore