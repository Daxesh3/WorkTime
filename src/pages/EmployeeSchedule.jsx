import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiEdit2, FiTrash2, FiPlus, FiClock, FiCheck, FiX, FiCalendar } from 'react-icons/fi';
import Card from '../components/ui/Card';
import TimePicker from '../components/ui/TimePicker';
import useWorkTimeStore from '../store/workTimeStore';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';

const EmployeeSchedule = () => {
    const navigate = useNavigate();
    const { employeeRecords, parameters, addEmployeeRecord, updateEmployeeRecord, deleteEmployeeRecord, calculateAllHours } = useWorkTimeStore();

    const [isAddingRecord, setIsAddingRecord] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // New record state
    const [newRecord, setNewRecord] = useState({
        name: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        clockIn: parameters.workingHours.start,
        clockOut: parameters.workingHours.end,
        lunchStart: parameters.lunchBreak.defaultStart,
        lunchEnd: calculateLunchEnd(parameters.lunchBreak.defaultStart, parameters.lunchBreak.duration),
        breaks: [],
    });

    // Function to calculate lunch end time based on start time and duration
    function calculateLunchEnd(startTime, durationMinutes) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);

        const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
        const endHours = endDate.getHours().toString().padStart(2, '0');
        const endMinutes = endDate.getMinutes().toString().padStart(2, '0');

        return `${endHours}:${endMinutes}`;
    }

    // Handle adding a new record
    const handleAddRecord = () => {
        addEmployeeRecord(newRecord);
        setIsAddingRecord(false);
        setNewRecord({
            name: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            clockIn: parameters.workingHours.start,
            clockOut: parameters.workingHours.end,
            lunchStart: parameters.lunchBreak.defaultStart,
            lunchEnd: calculateLunchEnd(parameters.lunchBreak.defaultStart, parameters.lunchBreak.duration),
            breaks: [],
        });
    };

    // Handle adding a break to a new or existing record
    const handleAddBreak = (isNewRecord) => {
        const morningBreakTime = parameters.breaks.morning.defaultTime;

        if (isNewRecord) {
            const breakEndTime = calculateLunchEnd(morningBreakTime, parameters.breaks.morning.duration);
            setNewRecord((prev) => ({
                ...prev,
                breaks: [...prev.breaks, { start: morningBreakTime, end: breakEndTime }],
            }));
        } else {
            const record = employeeRecords.find((r) => r.id === editingId);
            if (record) {
                const breakEndTime = calculateLunchEnd(morningBreakTime, parameters.breaks.morning.duration);
                updateEmployeeRecord(editingId, {
                    breaks: [...record.breaks, { start: morningBreakTime, end: breakEndTime }],
                });
            }
        }
    };

    // Handle removing a break
    const handleRemoveBreak = (index, isNewRecord) => {
        if (isNewRecord) {
            setNewRecord((prev) => ({
                ...prev,
                breaks: prev.breaks.filter((_, i) => i !== index),
            }));
        } else {
            const record = employeeRecords.find((r) => r.id === editingId);
            if (record) {
                updateEmployeeRecord(editingId, {
                    breaks: record.breaks.filter((_, i) => i !== index),
                });
            }
        }
    };

    // Handle updating a break time
    const handleUpdateBreakTime = (index, field, value, isNewRecord) => {
        if (isNewRecord) {
            setNewRecord((prev) => {
                const newBreaks = [...prev.breaks];
                newBreaks[index] = { ...newBreaks[index], [field]: value };
                return { ...prev, breaks: newBreaks };
            });
        } else {
            const record = employeeRecords.find((r) => r.id === editingId);
            if (record) {
                const newBreaks = [...record.breaks];
                newBreaks[index] = { ...newBreaks[index], [field]: value };
                updateEmployeeRecord(editingId, { breaks: newBreaks });
            }
        }
    };

    // Handle new record field changes
    const handleNewRecordChange = (field, value) => {
        setNewRecord((prev) => ({ ...prev, [field]: value }));

        // Auto-calculate lunch end if lunch start changes
        if (field === 'lunchStart') {
            const lunchEnd = calculateLunchEnd(value, parameters.lunchBreak.duration);
            setNewRecord((prev) => ({ ...prev, lunchEnd }));
        }
    };

    // Calculate time status class
    const getTimeStatusClass = (time, standard, isEarly) => {
        if (time === standard) return 'text-neutral-700';
        return isEarly ? (time < standard ? 'text-success-600' : 'text-error-600') : time > standard ? 'text-success-600' : 'text-error-600';
    };

    // Get records for the selected date
    const filteredRecords = employeeRecords.filter((record) => record.date === format(selectedDate, 'yyyy-MM-dd'));

    return (
        <div className='space-y-6 py-4'>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h1 className='text-2xl font-semibold text-neutral-800'>Employee Schedule</h1>
                <p className='text-neutral-500 mt-1'>View and manage daily working time records</p>
            </motion.div>

            <Card
                title='Date Selection'
                icon={<FiCalendar size={20} />}
                className='animate-fade-in'
                actionButton={
                    <button
                        className='btn btn-primary'
                        onClick={() => {
                            setIsAddingRecord(true);
                            setEditingId(null);
                            setNewRecord((prev) => ({
                                ...prev,
                                date: format(selectedDate, 'yyyy-MM-dd'),
                            }));
                        }}
                    >
                        <FiPlus className='mr-1' /> Add Record
                    </button>
                }
            >
                <div className='flex items-center'>
                    <div className='flex-grow'>
                        <div className='mb-4'>
                            <label className='input-label'>Select Date</label>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat='MMM d, yyyy'
                                className='time-input w-48'
                            />
                        </div>
                    </div>
                    <div className='text-neutral-500 text-sm'>
                        <div className='p-3 bg-neutral-50 rounded-lg'>
                            <p>
                                Standard hours: <span className='font-medium'>{parameters.workingHours.totalRequired} hours</span>
                            </p>
                            <p>
                                Work day:{' '}
                                <span className='font-medium'>
                                    {parameters.workingHours.start} - {parameters.workingHours.end}
                                </span>
                            </p>
                            <p>
                                Date: <span className='font-medium'>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Form for adding/editing records */}
            <AnimatePresence>
                {(isAddingRecord || editingId) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card
                            title={isAddingRecord ? 'Add New Record' : 'Edit Record'}
                            icon={<FiEdit2 size={20} />}
                            actionButton={
                                <div className='flex space-x-2'>
                                    <button
                                        className='btn btn-secondary'
                                        onClick={() => {
                                            setIsAddingRecord(false);
                                            setEditingId(null);
                                        }}
                                    >
                                        <FiX /> Cancel
                                    </button>
                                    <button
                                        className='btn btn-primary'
                                        onClick={
                                            isAddingRecord
                                                ? handleAddRecord
                                                : () => {
                                                      calculateAllHours();
                                                      setEditingId(null);
                                                  }
                                        }
                                    >
                                        <FiCheck /> {isAddingRecord ? 'Add' : 'Save'}
                                    </button>
                                </div>
                            }
                        >
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    {isAddingRecord && (
                                        <div className='mb-4'>
                                            <label className='input-label'>Employee Name</label>
                                            <input
                                                type='text'
                                                value={newRecord.name}
                                                onChange={(e) => handleNewRecordChange('name', e.target.value)}
                                                className='time-input w-full'
                                                placeholder='Enter employee name'
                                            />
                                        </div>
                                    )}

                                    <div className='grid grid-cols-2 gap-4 mb-4'>
                                        <div>
                                            <TimePicker
                                                label='Clock In'
                                                value={isAddingRecord ? newRecord.clockIn : employeeRecords.find((r) => r.id === editingId)?.clockIn}
                                                onChange={(value) =>
                                                    isAddingRecord
                                                        ? handleNewRecordChange('clockIn', value)
                                                        : updateEmployeeRecord(editingId, { clockIn: value })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <TimePicker
                                                label='Clock Out'
                                                value={
                                                    isAddingRecord ? newRecord.clockOut : employeeRecords.find((r) => r.id === editingId)?.clockOut
                                                }
                                                onChange={(value) =>
                                                    isAddingRecord
                                                        ? handleNewRecordChange('clockOut', value)
                                                        : updateEmployeeRecord(editingId, { clockOut: value })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-2 gap-4 mb-6'>
                                        <div>
                                            <TimePicker
                                                label='Lunch Start'
                                                value={
                                                    isAddingRecord
                                                        ? newRecord.lunchStart
                                                        : employeeRecords.find((r) => r.id === editingId)?.lunchStart
                                                }
                                                onChange={(value) => {
                                                    if (isAddingRecord) {
                                                        handleNewRecordChange('lunchStart', value);
                                                    } else {
                                                        const lunchEnd = calculateLunchEnd(value, parameters.lunchBreak.duration);
                                                        updateEmployeeRecord(editingId, {
                                                            lunchStart: value,
                                                            lunchEnd,
                                                        });
                                                    }
                                                }}
                                                minTime={parameters.lunchBreak.flexWindowStart}
                                                maxTime={parameters.lunchBreak.flexWindowEnd}
                                            />
                                        </div>
                                        <div>
                                            <TimePicker
                                                label='Lunch End'
                                                value={
                                                    isAddingRecord ? newRecord.lunchEnd : employeeRecords.find((r) => r.id === editingId)?.lunchEnd
                                                }
                                                onChange={(value) =>
                                                    isAddingRecord
                                                        ? handleNewRecordChange('lunchEnd', value)
                                                        : updateEmployeeRecord(editingId, { lunchEnd: value })
                                                }
                                                minTime={parameters.lunchBreak.flexWindowStart}
                                                maxTime={parameters.lunchBreak.flexWindowEnd}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className='flex items-center justify-between mb-4'>
                                        <label className='input-label'>Additional Breaks</label>
                                        <button
                                            type='button'
                                            className='text-sm text-primary-600 hover:text-primary-800 flex items-center'
                                            onClick={() => handleAddBreak(isAddingRecord)}
                                        >
                                            <FiPlus className='mr-1' /> Add Break
                                        </button>
                                    </div>

                                    {/* Break list */}
                                    <div className='space-y-3'>
                                        {(isAddingRecord ? newRecord.breaks : employeeRecords.find((r) => r.id === editingId)?.breaks || []).map(
                                            (breakItem, index) => (
                                                <div
                                                    key={index}
                                                    className='flex items-center space-x-2 p-2 border border-neutral-200 rounded-lg bg-neutral-50'
                                                >
                                                    <TimePicker
                                                        value={breakItem.start}
                                                        onChange={(value) => handleUpdateBreakTime(index, 'start', value, isAddingRecord)}
                                                        className='w-24 text-sm'
                                                    />
                                                    <span className='text-neutral-400'>to</span>
                                                    <TimePicker
                                                        value={breakItem.end}
                                                        onChange={(value) => handleUpdateBreakTime(index, 'end', value, isAddingRecord)}
                                                        className='w-24 text-sm'
                                                    />
                                                    <button
                                                        type='button'
                                                        className='text-error-500 hover:text-error-700 ml-auto'
                                                        onClick={() => handleRemoveBreak(index, isAddingRecord)}
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            )
                                        )}

                                        {(isAddingRecord ? newRecord.breaks : employeeRecords.find((r) => r.id === editingId)?.breaks || [])
                                            .length === 0 && <div className='text-sm text-neutral-500 italic p-2'>No additional breaks added</div>}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Employee Records Table */}
            <Card title='Time Records' subtitle={`${format(selectedDate, 'MMMM d, yyyy')}`} icon={<FiUsers size={20} />} className='animate-fade-in'>
                {filteredRecords.length > 0 ? (
                    <div className='overflow-x-auto -mx-4 px-4'>
                        <table className='min-w-full divide-y divide-neutral-200'>
                            <thead>
                                <tr>
                                    <th className='py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Employee</th>
                                    <th className='py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Clock In/Out</th>
                                    <th className='py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Lunch Break</th>
                                    <th className='py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Other Breaks</th>
                                    <th className='py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Hours</th>
                                    <th className='py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-neutral-100'>
                                {filteredRecords.map((record) => (
                                    <tr key={record.id} className='hover:bg-neutral-50'>
                                        <td className='py-4 whitespace-nowrap'>
                                            <div className='text-sm font-medium text-neutral-900'>{record.name}</div>
                                        </td>
                                        <td className='py-4 whitespace-nowrap'>
                                            <div className='flex flex-col'>
                                                <span
                                                    className={`text-sm ${getTimeStatusClass(record.clockIn, parameters.workingHours.start, true)}`}
                                                >
                                                    In: {record.clockIn}
                                                    {record.clockIn !== parameters.workingHours.start && (
                                                        <span className='ml-1 text-xs'>
                                                            ({record.clockIn < parameters.workingHours.start ? 'early' : 'late'})
                                                        </span>
                                                    )}
                                                </span>
                                                <span
                                                    className={`text-sm ${getTimeStatusClass(record.clockOut, parameters.workingHours.end, false)}`}
                                                >
                                                    Out: {record.clockOut}
                                                    {record.clockOut !== parameters.workingHours.end && (
                                                        <span className='ml-1 text-xs'>
                                                            ({record.clockOut > parameters.workingHours.end ? 'overtime' : 'early'})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='py-4 whitespace-nowrap'>
                                            <div className='text-sm text-neutral-700'>
                                                {record.lunchStart} - {record.lunchEnd}
                                            </div>
                                        </td>
                                        <td className='py-4'>
                                            {record.breaks.length > 0 ? (
                                                <div className='text-sm text-neutral-700'>
                                                    {record.breaks.map((breakItem, i) => (
                                                        <div key={i}>
                                                            {breakItem.start} - {breakItem.end}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className='text-sm text-neutral-400'>None</span>
                                            )}
                                        </td>
                                        <td className='py-4 whitespace-nowrap'>
                                            <div className='text-sm font-medium'>{record.calculatedHours.toFixed(2)} hrs</div>
                                        </td>
                                        <td className='py-4 text-right whitespace-nowrap'>
                                            <div className='flex justify-end space-x-2'>
                                                <button
                                                    className='text-primary-600 hover:text-primary-800'
                                                    onClick={() => {
                                                        navigate('/calculations', {
                                                            state: {
                                                                record: {
                                                                    clockIn: record.clockIn,
                                                                    clockOut: record.clockOut,
                                                                    lunchStart: record.lunchStart,
                                                                    lunchEnd: record.lunchEnd,
                                                                    breaks: record.breaks,
                                                                },
                                                            },
                                                        });
                                                    }}
                                                    title='Calculate'
                                                >
                                                    <FiClock />
                                                </button>
                                                <button
                                                    className='text-primary-600 hover:text-primary-800'
                                                    onClick={() => setEditingId(record.id)}
                                                    title='Edit'
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    className='text-error-600 hover:text-error-800'
                                                    onClick={() => deleteEmployeeRecord(record.id)}
                                                    title='Delete'
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className='text-center py-8'>
                        <div className='text-neutral-400 mb-2'>No records found for this date</div>
                        <button
                            className='btn btn-primary mx-auto'
                            onClick={() => {
                                setIsAddingRecord(true);
                                setNewRecord((prev) => ({
                                    ...prev,
                                    date: format(selectedDate, 'yyyy-MM-dd'),
                                }));
                            }}
                        >
                            <FiPlus className='mr-1' /> Add First Record
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default EmployeeSchedule;
