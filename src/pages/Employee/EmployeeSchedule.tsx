import React, { useMemo, useState } from 'react';
import { FiUsers, FiEdit2, FiTrash2, FiPlus, FiClock, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';

import Card from '../../components/ui/Card';
import useWorkTimeStore from '../../store/workTimeStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { CompanyParameters } from '../../shared/types';
import useCompanyStore from '../../store/companyStore';
import AddEditEmployee from './AddEditEmployee';

const EmployeeSchedule: React.FC = () => {
    const navigate = useNavigate();
    const { getCurrentParameters } = useCompanyStore();
    const parameters: CompanyParameters = getCurrentParameters();

    const { employeeRecords, deleteEmployeeRecord } = useWorkTimeStore();

    const [isAddingRecord, setIsAddingRecord] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Calculate time status class
    const getTimeStatusClass = (time: string, standard: string, isEarly: boolean): string => {
        if (time === standard) return 'text-neutral-700';
        return isEarly ? (time < standard ? 'text-success-600' : 'text-error-600') : time > standard ? 'text-success-600' : 'text-error-600';
    };

    // Get records for the selected date
    const filteredRecords = employeeRecords.filter((record) => record.date === format(selectedDate, 'yyyy-MM-dd'));

    return (
        <div className='space-y-6 py-4'>
            <div className='animate-fade-in-down animate-duration-300'>
                <h1 className='text-2xl font-semibold text-neutral-800'>Employee Schedule</h1>
                <p className='text-neutral-500 mt-1'>View and manage daily working time records</p>
            </div>

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
                        }}
                    >
                        <FiPlus className='mr-1' /> Add Record
                    </button>
                }
            >
                <div className='mb-4'>
                    <label className='input-label'>Select Date</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date) => setSelectedDate(date)}
                        dateFormat='MMM d, yyyy'
                        className='time-input w-48'
                    />
                </div>
            </Card>

            {(isAddingRecord || editingId) && (
                <AddEditEmployee
                    isOpen={isAddingRecord || !!editingId}
                    editingId={editingId}
                    isAddingRecord={isAddingRecord}
                    onClose={() => {
                        setIsAddingRecord(false);
                        setEditingId(null);
                    }}
                />
            )}

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
                                {filteredRecords.map((record) => {
                                    return (
                                        <tr key={record.id} className='hover:bg-neutral-50'>
                                            <td className='py-4 whitespace-nowrap'>
                                                <div className='text-sm font-medium text-neutral-900'>{record.name}</div>
                                            </td>
                                            <td className='py-4 whitespace-nowrap'>
                                                <div className='flex flex-col'>
                                                    <span
                                                        className={`text-sm ${getTimeStatusClass(
                                                            record.clockIn,
                                                            parameters.workingHours.start,
                                                            true
                                                        )}`}
                                                    >
                                                        In: {record.clockIn}
                                                        {record.clockIn !== parameters.workingHours.start && (
                                                            <span className='ml-1 text-xs'>
                                                                ({record.clockIn < parameters.workingHours.start ? 'early' : 'late'})
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span
                                                        className={`text-sm ${getTimeStatusClass(
                                                            record.clockOut,
                                                            parameters.workingHours.end,
                                                            false
                                                        )}`}
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
                                    );
                                })}
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
