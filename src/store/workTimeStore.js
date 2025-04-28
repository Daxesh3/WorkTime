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
        const record = get().employeeRecords.find(r => r.id === id)
        if (!record) return

        // Get parameters from company store
        const parameters = get().getCurrentParameters()
        if (!parameters) return

        // Calculate effective start time
        const [startHour, startMinute] = record.clockIn.split(':').map(Number)
        const [standardStartHour, standardStartMinute] = parameters.workingHours.start.split(':').map(Number)

        const startTime = new Date()
        startTime.setHours(startHour, startMinute, 0, 0)

        const standardStartTime = new Date()
        standardStartTime.setHours(standardStartHour, standardStartMinute, 0, 0)

        const earlyArrivalMinutes = Math.max(0, (standardStartTime - startTime) / (1000 * 60))
        const effectiveStartTime = new Date(startTime)

        if (earlyArrivalMinutes > parameters.earlyArrival.maxMinutes) {
          effectiveStartTime.setHours(standardStartHour, standardStartMinute, 0, 0)
        }

        // Calculate effective end time
        const [endHour, endMinute] = record.clockOut.split(':').map(Number)
        const [standardEndHour, standardEndMinute] = parameters.workingHours.end.split(':').map(Number)

        const endTime = new Date()
        endTime.setHours(endHour, endMinute, 0, 0)

        const standardEndTime = new Date()
        standardEndTime.setHours(standardEndHour, standardEndMinute, 0, 0)

        const lateStayMinutes = Math.max(0, (endTime - standardEndTime) / (1000 * 60))
        const effectiveEndTime = new Date(endTime)

        if (lateStayMinutes > parameters.lateStay.maxMinutes) {
          effectiveEndTime.setHours(standardEndHour, standardEndMinute, 0, 0)
        }

        // Calculate lunch break time
        const [lunchStartHour, lunchStartMinute] = record.lunchStart.split(':').map(Number)
        const [lunchEndHour, lunchEndMinute] = record.lunchEnd.split(':').map(Number)

        const lunchStartTime = new Date()
        lunchStartTime.setHours(lunchStartHour, lunchStartMinute, 0, 0)

        const lunchEndTime = new Date()
        lunchEndTime.setHours(lunchEndHour, lunchEndMinute, 0, 0)

        const lunchDuration = (lunchEndTime - lunchStartTime) / (1000 * 60)

        // Calculate other break times
        let otherBreaksDuration = 0
        record.breaks.forEach(breakItem => {
          const [breakStartHour, breakStartMinute] = breakItem.start.split(':').map(Number)
          const [breakEndHour, breakEndMinute] = breakItem.end.split(':').map(Number)

          const breakStartTime = new Date()
          breakStartTime.setHours(breakStartHour, breakStartMinute, 0, 0)

          const breakEndTime = new Date()
          breakEndTime.setHours(breakEndHour, breakEndMinute, 0, 0)

          otherBreaksDuration += (breakEndTime - breakStartTime) / (1000 * 60)
        })

        // Calculate total working minutes
        const totalWorkingMinutes = (effectiveEndTime - effectiveStartTime) / (1000 * 60) - lunchDuration - otherBreaksDuration
        const calculatedHours = totalWorkingMinutes / 60

        // Calculate overtime hours
        const standardHours = parameters.workingHours.totalRequired
        const overtimeHours = Math.max(0, calculatedHours - standardHours)

        // Calculate overtime pay
        const overtimePay = overtimeHours * parameters.lateStay.overtimeMultiplier

        // Update the record with calculated values
        set(state => ({
          employeeRecords: state.employeeRecords.map(r =>
            r.id === id ? {
              ...r,
              calculatedHours,
              calculationDetails: {
                effectiveStart: `${effectiveStartTime.getHours().toString().padStart(2, '0')}:${effectiveStartTime.getMinutes().toString().padStart(2, '0')}`,
                effectiveEnd: `${effectiveEndTime.getHours().toString().padStart(2, '0')}:${effectiveEndTime.getMinutes().toString().padStart(2, '0')}`,
                totalWorkingMinutes,
                lunchDuration,
                otherBreaksDuration,
                regularHours: calculatedHours,
                overtimeHours,
                overtimePay,
                totalEffectiveHours: calculatedHours + overtimePay
              }
            } : r
          )
        }))
      },

      // Calculate hours for all employees
      calculateAllHours: () => {
        const store = get()
        store.employeeRecords.forEach(record => {
          store.calculateHours(record.id)
        })
      },

      // Simulate calculation for the calculator page
      simulateCalculation: (record, parameters) => {
        // Calculate effective start time
        const [startHour, startMinute] = record.clockIn.split(':').map(Number)
        const [standardStartHour, standardStartMinute] = parameters.workingHours.start.split(':').map(Number)

        const startTime = new Date()
        startTime.setHours(startHour, startMinute, 0, 0)

        const standardStartTime = new Date()
        standardStartTime.setHours(standardStartHour, standardStartMinute, 0, 0)

        const earlyArrivalMinutes = Math.max(0, (standardStartTime - startTime) / (1000 * 60))
        const effectiveStartTime = new Date(startTime)

        if (earlyArrivalMinutes > parameters.earlyArrival.maxMinutes) {
          effectiveStartTime.setHours(standardStartHour, standardStartMinute, 0, 0)
        }

        // Calculate effective end time
        const [endHour, endMinute] = record.clockOut.split(':').map(Number)
        const [standardEndHour, standardEndMinute] = parameters.workingHours.end.split(':').map(Number)

        const endTime = new Date()
        endTime.setHours(endHour, endMinute, 0, 0)

        const standardEndTime = new Date()
        standardEndTime.setHours(standardEndHour, standardEndMinute, 0, 0)

        const lateStayMinutes = Math.max(0, (endTime - standardEndTime) / (1000 * 60))
        const effectiveEndTime = new Date(endTime)

        if (lateStayMinutes > parameters.lateStay.maxMinutes) {
          effectiveEndTime.setHours(standardEndHour, standardEndMinute, 0, 0)
        }

        // Calculate lunch break time
        const [lunchStartHour, lunchStartMinute] = record.lunchStart.split(':').map(Number)
        const [lunchEndHour, lunchEndMinute] = record.lunchEnd.split(':').map(Number)

        const lunchStartTime = new Date()
        lunchStartTime.setHours(lunchStartHour, lunchStartMinute, 0, 0)

        const lunchEndTime = new Date()
        lunchEndTime.setHours(lunchEndHour, lunchEndMinute, 0, 0)

        const lunchDuration = (lunchEndTime - lunchStartTime) / (1000 * 60)

        // Calculate other break times
        let otherBreaksDuration = 0
        record.breaks.forEach(breakItem => {
          const [breakStartHour, breakStartMinute] = breakItem.start.split(':').map(Number)
          const [breakEndHour, breakEndMinute] = breakItem.end.split(':').map(Number)

          const breakStartTime = new Date()
          breakStartTime.setHours(breakStartHour, breakStartMinute, 0, 0)

          const breakEndTime = new Date()
          breakEndTime.setHours(breakEndHour, breakEndMinute, 0, 0)

          otherBreaksDuration += (breakEndTime - breakStartTime) / (1000 * 60)
        })

        // Calculate total working minutes
        const totalWorkingMinutes = (effectiveEndTime - effectiveStartTime) / (1000 * 60) - lunchDuration - otherBreaksDuration
        const calculatedHours = totalWorkingMinutes / 60

        // Calculate overtime hours
        const standardHours = parameters.workingHours.totalRequired
        const overtimeHours = Math.max(0, calculatedHours - standardHours)

        // Calculate overtime pay
        const overtimePay = overtimeHours * parameters.lateStay.overtimeMultiplier

        // Check lunch break window
        const [flexWindowStartHour, flexWindowStartMinute] = parameters.lunchBreak.flexWindowStart.split(':').map(Number)
        const [flexWindowEndHour, flexWindowEndMinute] = parameters.lunchBreak.flexWindowEnd.split(':').map(Number)

        const flexWindowStartTime = new Date()
        flexWindowStartTime.setHours(flexWindowStartHour, flexWindowStartMinute, 0, 0)

        const flexWindowEndTime = new Date()
        flexWindowEndTime.setHours(flexWindowEndHour, flexWindowEndMinute, 0, 0)

        const isLunchBreakInWindow = lunchStartTime >= flexWindowStartTime && lunchEndTime <= flexWindowEndTime
        const isLunchBreakCorrectDuration = Math.abs(lunchDuration - parameters.lunchBreak.duration) <= 5 // Allow 5 minutes tolerance

        return {
          effectiveStart: `${effectiveStartTime.getHours().toString().padStart(2, '0')}:${effectiveStartTime.getMinutes().toString().padStart(2, '0')}`,
          effectiveEnd: `${effectiveEndTime.getHours().toString().padStart(2, '0')}:${effectiveEndTime.getMinutes().toString().padStart(2, '0')}`,
          totalWorkingMinutes,
          lunchDuration,
          otherBreaksDuration,
          regularHours: calculatedHours,
          overtimeHours,
          overtimePay,
          totalEffectiveHours: calculatedHours + overtimePay,
          isLunchBreakInWindow,
          isLunchBreakCorrectDuration,
          earlyArrival: earlyArrivalMinutes > 0,
          earlyArrivalMinutes: Math.round(earlyArrivalMinutes),
          lateArrival: startTime > standardStartTime,
          lateArrivalMinutes: Math.round(Math.max(0, (startTime - standardStartTime) / (1000 * 60))),
          earlyDeparture: endTime < standardEndTime,
          earlyDepartureMinutes: Math.round(Math.max(0, (standardEndTime - endTime) / (1000 * 60))),
          lateDeparture: endTime > standardEndTime,
          lateDepartureMinutes: Math.round(Math.max(0, (endTime - standardEndTime) / (1000 * 60)))
        }
      }
    }),
    {
      name: 'work-time-storage'
    }
  )
)

export default useWorkTimeStore