import React from 'react';
import { FiCheck, FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';

import { CompanyParameters, EmployeeRecord } from '../../shared/types';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import TimePicker from '../../components/ui/TimePicker';

interface AddEditEmployeeProps {
    isOpen: boolean;
    isAddingRecord: boolean;
    onClose: () => void;
    onSave: () => void;
    newRecord: EmployeeRecord;
}

const AddEditEmployee: React.FC<AddEditEmployeeProps> = ({ isOpen, isAddingRecord, newRecord, setNewRecord, onClose, onSave }) => {
    const handleNewRecordChange = (field: keyof EmployeeRecord, value: any) => {
        setNewRecord((prev) => ({ ...prev, [field]: value }));

        // Auto-calculate lunch end if lunch start changes
        if (field === 'lunchStart') {
            const lunchEnd = calculateLunchEnd(value, parameters.lunchBreak.duration);
            setNewRecord((prev) => ({ ...prev, lunchEnd }));
        }
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
                    <button className='btn btn-primary' onClick={onSave}>
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
