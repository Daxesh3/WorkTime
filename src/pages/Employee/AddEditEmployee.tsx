import React, { useMemo, useState } from 'react';
import { FiCheck, FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { format } from 'date-fns';

import { Break, CompanyParameters, EmployeeRecord } from '../../shared/types';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import TimePicker from '../../components/ui/TimePicker';
import useCompanyStore from '../../store/companyStore';
import useWorkTimeStore from '../../store/workTimeStore';

interface AddEditEmployeeProps {
    editingId: string | null;
    isOpen: boolean;
    isAddingRecord: boolean;
    onClose: () => void;
}

const AddEditEmployee: React.FC<AddEditEmployeeProps> = ({ isOpen, editingId: editId, isAddingRecord, onClose }) => {
    const { getCurrentParameters } = useCompanyStore();
    const parameters: CompanyParameters = getCurrentParameters();
    const { employeeRecords, addEmployeeRecord, updateEmployeeRecord } = useWorkTimeStore();
    const [editingId, setEditingId] = useState<string | null>(editId);

    const calculateLunchEnd = (startTime: string, durationMinutes: number) => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);

        const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
        const endHours = endDate.getHours().toString().padStart(2, '0');
        const endMinutes = endDate.getMinutes().toString().padStart(2, '0');

        return `${endHours}:${endMinutes}`;
    };

    const newRecordObj = useMemo(() => {
        return {
            id: '',
            name: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            clockIn: parameters.workingHours.start,
            clockOut: parameters.workingHours.end,
            lunchStart: parameters.lunchBreak.defaultStart,
            lunchEnd: calculateLunchEnd(parameters.lunchBreak.defaultStart, parameters.lunchBreak.duration),
            breaks: [],
            calculatedHours: 0,
        };
    }, [parameters]);
    const [newRecord, setNewRecord] = useState<EmployeeRecord>(newRecordObj);

    const handleNewRecordChange = (field: keyof EmployeeRecord, value: any) => {
        setNewRecord((prev) => ({ ...prev, [field]: value }));

        // Auto-calculate lunch end if lunch start changes
        if (field === 'lunchStart') {
            const lunchEnd = calculateLunchEnd(value, parameters.lunchBreak.duration);
            setNewRecord((prev) => ({ ...prev, lunchEnd }));
        }
    };

    // Handle adding a break to a new or existing record
    const handleAddBreak = (isNewRecord: boolean) => {
        const initTime = '10:00';
        const duration = 15;
        if (isNewRecord) {
            const breakEndTime = calculateLunchEnd(initTime, duration);
            setNewRecord((prev) => ({
                ...prev,
                breaks: [...prev.breaks, { start: initTime, end: breakEndTime } as Break],
            }));
        } else {
            const record = employeeRecords.find((r) => r.id === editingId);
            if (record) {
                const breakEndTime = calculateLunchEnd(initTime, duration);
                updateEmployeeRecord(editingId!, {
                    ...record,
                    breaks: [...record.breaks, { start: initTime, end: breakEndTime } as Break],
                });
            }
        }
    };

    const handleRemoveBreak = (index: number, isNewRecord: boolean) => {
        if (isNewRecord) {
            setNewRecord((prev) => ({
                ...prev,
                breaks: prev.breaks.filter((_, i) => i !== index),
            }));
        } else {
            const record = employeeRecords.find((r) => r.id === editingId);
            if (record) {
                updateEmployeeRecord(editingId!, {
                    ...record,
                    breaks: record.breaks.filter((_, i) => i !== index),
                });
            }
        }
    };

    // Handle updating a break time
    const handleUpdateBreakTime = (index: number, field: keyof Break, value: string, isNewRecord: boolean) => {
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
                updateEmployeeRecord(editingId!, { ...record, breaks: newBreaks });
            }
        }
    };

    const handleAddRecord = () => {
        addEmployeeRecord(newRecord);
        setNewRecord(newRecordObj);
        onClose();
    };

    return (
        <Modal
            size='5xl'
            isOpen={isOpen}
            onClose={onClose}
            title={!isAddingRecord ? 'Edit Company' : 'Add Company'}
            footer={
                <div className='flex space-x-2'>
                    <button className='btn btn-secondary' onClick={onClose} type='button'>
                        <FiX /> Cancel
                    </button>
                    <button className='btn btn-primary' onClick={() => (isAddingRecord ? handleAddRecord() : () => setEditingId(null))}>
                        <FiCheck /> {isAddingRecord ? 'Add' : 'Save'}
                    </button>
                </div>
            }
        >
            <Card title={isAddingRecord ? 'Add New Record' : 'Edit Record'} icon={<FiEdit2 size={20} />}>
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
                            <TimePicker
                                label='Clock In'
                                value={isAddingRecord ? newRecord.clockIn : employeeRecords.find((r) => r.id === editingId)?.clockIn}
                                onChange={(value) =>
                                    isAddingRecord
                                        ? handleNewRecordChange('clockIn', value)
                                        : updateEmployeeRecord(editingId || '', { clockIn: value })
                                }
                            />
                            <TimePicker
                                label='Clock Out'
                                value={isAddingRecord ? newRecord.clockOut : employeeRecords.find((r) => r.id === editingId)?.clockOut || ''}
                                onChange={(value) =>
                                    isAddingRecord
                                        ? handleNewRecordChange('clockOut', value)
                                        : updateEmployeeRecord(editingId || '', { clockOut: value })
                                }
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-6'>
                            <TimePicker
                                label='Lunch Start'
                                value={isAddingRecord ? newRecord.lunchStart : employeeRecords.find((r) => r.id === editingId)?.lunchStart}
                                onChange={(value) => {
                                    if (isAddingRecord) {
                                        handleNewRecordChange('lunchStart', value);
                                    } else {
                                        const lunchEnd = calculateLunchEnd(value, parameters.lunchBreak.duration);
                                        updateEmployeeRecord(editingId || '', {
                                            lunchStart: value,
                                            lunchEnd,
                                        });
                                    }
                                }}
                                minTime={parameters.lunchBreak.flexWindowStart}
                                maxTime={parameters.lunchBreak.flexWindowEnd}
                            />
                            <TimePicker
                                label='Lunch End'
                                value={isAddingRecord ? newRecord.lunchEnd : employeeRecords.find((r) => r.id === editingId)?.lunchEnd}
                                onChange={(value) =>
                                    isAddingRecord
                                        ? handleNewRecordChange('lunchEnd', value)
                                        : updateEmployeeRecord(editingId || '', { lunchEnd: value })
                                }
                                minTime={parameters.lunchBreak.flexWindowStart}
                                maxTime={parameters.lunchBreak.flexWindowEnd}
                            />
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
                                    <div key={index} className='flex items-center space-x-2 p-2 border border-neutral-200 rounded-lg bg-neutral-50'>
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

                            {(isAddingRecord ? newRecord.breaks : employeeRecords.find((r) => r.id === editingId)?.breaks || []).length === 0 && (
                                <div className='text-sm text-neutral-500 italic p-2'>No additional breaks added</div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </Modal>
    );
};

export default AddEditEmployee;
