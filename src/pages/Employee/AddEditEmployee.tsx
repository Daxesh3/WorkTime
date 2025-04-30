import React, { useMemo, useState } from 'react';
import { FiCheck, FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { format } from 'date-fns';

import { Break, EmployeeRecord } from '../../shared/types';
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

// Helper function outside the component
const calculateLunchEnd = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
};

const AddEditEmployee: React.FC<AddEditEmployeeProps> = ({ isOpen, editingId, isAddingRecord, onClose }) => {
    const { getCurrentParameters } = useCompanyStore();
    const parameters = getCurrentParameters();
    const { employeeRecords, addEmployeeRecord, updateEmployeeRecord } = useWorkTimeStore();

    const initialRecord: EmployeeRecord = useMemo(
        () => ({
            id: '',
            name: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            clockIn: parameters.workingHours.start,
            clockOut: parameters.workingHours.end,
            lunchStart: parameters.lunchBreak.defaultStart,
            lunchEnd: calculateLunchEnd(parameters.lunchBreak.defaultStart, parameters.lunchBreak.duration),
            breaks: [],
            calculatedHours: 0,
        }),
        [parameters]
    );

    const editedRecord = useMemo(() => employeeRecords.find((r) => r.id === editingId), [employeeRecords, editingId]);
    const [newRecord, setNewRecord] = useState<EmployeeRecord>(isAddingRecord ? initialRecord : editedRecord!);
    console.log(' newRecord:', newRecord);

    const handleFieldChange = (field: keyof EmployeeRecord, value: any) => {
        setNewRecord((prev) => {
            const updated = { ...prev, [field]: value };
            if (field === 'lunchStart') {
                updated.lunchEnd = calculateLunchEnd(value, parameters.lunchBreak.duration);
            }
            return updated;
        });
    };

    const modifyBreaks = (breaks: Break[], index: number, newBreak?: Break) => {
        const updated = [...breaks];
        if (newBreak) {
            updated[index] = newBreak;
        } else {
            updated.splice(index, 1);
        }
        return updated;
    };

    const handleBreakChange = (index: number, field: keyof Break, value: string) => {
        setNewRecord((prev) => ({
            ...prev,
            breaks: modifyBreaks(prev.breaks, index, { ...prev.breaks[index], [field]: value }),
        }));
    };

    const handleAddBreak = () => {
        const start = '10:00';
        const end = calculateLunchEnd(start, 15);
        const newBreak = { start, end } as Break;
        setNewRecord((prev) => ({ ...prev, breaks: [...prev.breaks, newBreak] }));
    };

    const handleRemoveBreak = (index: number) => {
        setNewRecord((prev) => ({
            ...prev,
            breaks: prev.breaks.filter((_, i) => i !== index),
        }));
    };

    const handleAddRecord = () => {
        if (isAddingRecord) {
            addEmployeeRecord(newRecord);
        } else {
            updateEmployeeRecord(editedRecord!.id, newRecord);
        }
        onClose();
    };

    return (
        <Modal
            size='5xl'
            isOpen={isOpen}
            onClose={onClose}
            title={isAddingRecord ? 'Add Company' : 'Edit Company'}
            footer={
                <div className='flex space-x-2'>
                    <button className='btn btn-secondary' onClick={onClose}>
                        <FiX /> Cancel
                    </button>
                    <button className='btn btn-primary' onClick={handleAddRecord}>
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
                                    onChange={(e) => handleFieldChange('name', e.target.value)}
                                    className='time-input w-full'
                                    placeholder='Enter employee name'
                                />
                            </div>
                        )}
                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <TimePicker
                                className='w-full'
                                label='Clock In'
                                value={newRecord.clockIn}
                                onChange={(value) => handleFieldChange('clockIn', value)}
                            />
                            <TimePicker
                                className='w-full'
                                label='Clock Out'
                                value={newRecord.clockOut}
                                onChange={(value) => handleFieldChange('clockOut', value)}
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-6'>
                            <TimePicker
                                className='w-full'
                                label='Lunch Start'
                                value={newRecord.lunchStart}
                                onChange={(value) => handleFieldChange('lunchStart', value)}
                            />
                            <TimePicker
                                className='w-full'
                                label='Lunch End'
                                value={newRecord.lunchEnd}
                                onChange={(value) => handleFieldChange('lunchEnd', value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div className='flex items-center justify-between mb-4'>
                            <label className='input-label'>Additional Breaks</label>
                            <button
                                type='button'
                                className='text-sm text-primary-600 hover:text-primary-800 flex items-center'
                                onClick={handleAddBreak}
                            >
                                <FiPlus className='mr-1' /> Add Break
                            </button>
                        </div>

                        <div className='space-y-3'>
                            {(newRecord.breaks || []).map((b, idx) => (
                                <div key={idx} className='flex items-center space-x-2 p-2 border border-neutral-200 rounded-lg bg-neutral-50'>
                                    <TimePicker value={b.start} onChange={(val) => handleBreakChange(idx, 'start', val)} className='w-24 text-sm' />
                                    <span className='text-neutral-400'>to</span>
                                    <TimePicker value={b.end} onChange={(val) => handleBreakChange(idx, 'end', val)} className='w-24 text-sm' />
                                    <button
                                        type='button'
                                        className='text-error-500 hover:text-error-700 ml-auto'
                                        onClick={() => handleRemoveBreak(idx)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                            {(newRecord.breaks || []).length === 0 && (
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
