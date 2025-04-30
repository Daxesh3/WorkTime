import React from 'react';
import { FiSun, FiCoffee, FiClock } from 'react-icons/fi';

import Modal from '../../components/ui/Modal';
import TimePicker from '../../components/ui/TimePicker';
import Card from '../../components/ui/Card';
import { ShiftTiming } from './Shift.types';
import ShiftTypeSelector from '../../components/ui/ShiftTypeSelector';

interface AddEditCompanyModalProps {
    isOpen: boolean;
    editingShift: ShiftTiming | null;
    onClose: () => void;
    onSave: () => void;
    updateEditingShift: (field: keyof ShiftTiming, value: any, subField?: string) => void;
}

const AddEditShift: React.FC<AddEditCompanyModalProps> = ({ isOpen, editingShift, onClose, onSave, updateEditingShift }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingShift && 'id' in editingShift ? 'Edit Shift' : 'Add New Shift'}
            size='5xl'
            footer={
                <div className='flex justify-end space-x-2'>
                    <button onClick={onClose} className='btn btn-secondary'>
                        Cancel
                    </button>
                    <button onClick={onSave} className='btn btn-primary'>
                        {'Save Shift'}
                    </button>
                </div>
            }
        >
            <div className='space-y-3'>
                <Card title='Basic Information' icon={<FiClock />}>
                    <div className='grid grid-cols-3 gap-4'>
                        <div>
                            <ShiftTypeSelector value={editingShift?.name || 'regular'} onChange={(value) => updateEditingShift('name', value)} />
                        </div>
                        <div>
                            <label className='input-label'>Start Time</label>
                            <TimePicker value={editingShift?.start || '09:00'} onChange={(value) => updateEditingShift('start', value)} />
                        </div>
                        <div>
                            <label className='input-label'>End Time</label>
                            <TimePicker value={editingShift?.end || '17:00'} onChange={(value) => updateEditingShift('end', value)} />
                        </div>
                    </div>
                </Card>

                <Card title='Break Duration' icon={<FiCoffee />}>
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className='input-label'>Default Start Time</label>
                            <TimePicker
                                value={editingShift?.lunchBreak.defaultStart || '12:00'}
                                onChange={(value) => updateEditingShift('lunchBreak', value, 'defaultStart')}
                            />
                        </div>
                        <div>
                            <label className='input-label'>Duration (minutes)</label>
                            <input
                                type='number'
                                value={editingShift?.lunchBreak.duration || 60}
                                onChange={(e) => updateEditingShift('lunchBreak', parseInt(e.target.value), 'duration')}
                                className='time-input'
                                min='15'
                                max='120'
                                step='15'
                            />
                        </div>
                        <div>
                            <label className='input-label'>Flex Window Start</label>
                            <TimePicker
                                value={editingShift?.lunchBreak.flexWindowStart || '11:30'}
                                onChange={(value) => updateEditingShift('lunchBreak', value, 'flexWindowStart')}
                            />
                        </div>
                        <div>
                            <label className='input-label'>Flex Window End</label>
                            <TimePicker
                                value={editingShift?.lunchBreak.flexWindowEnd || '13:30'}
                                onChange={(value) => updateEditingShift('lunchBreak', value, 'flexWindowEnd')}
                            />
                        </div>
                    </div>
                </Card>

                <Card title='Time Policies' icon={<FiSun />}>
                    <div className='grid grid-cols-2 gap-6'>
                        <div className='space-y-4'>
                            <h4 className='font-medium'>Early Arrival</h4>
                            <div>
                                <label className='input-label'>Maximum Minutes</label>
                                <input
                                    type='number'
                                    value={editingShift?.earlyArrival.maxMinutes || 30}
                                    onChange={(e) => updateEditingShift('earlyArrival', parseInt(e.target.value), 'maxMinutes')}
                                    className='time-input'
                                    min='0'
                                    max='120'
                                />
                            </div>
                            <div className='flex items-center'>
                                <input
                                    type='checkbox'
                                    checked={editingShift?.earlyArrival.countTowardsTotal || false}
                                    onChange={(e) => updateEditingShift('earlyArrival', e.target.checked, 'countTowardsTotal')}
                                    className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded'
                                />
                                <label className='ml-2 text-sm text-neutral-700'>Count towards total hours</label>
                            </div>
                        </div>

                        <div className='space-y-4'>
                            <h4 className='font-medium'>Late Stay</h4>
                            <div>
                                <label className='input-label'>Maximum Minutes</label>
                                <input
                                    type='number'
                                    value={editingShift?.lateStay.maxMinutes || 30}
                                    onChange={(e) => updateEditingShift('lateStay', parseInt(e.target.value), 'maxMinutes')}
                                    className='time-input'
                                    min='0'
                                    max='120'
                                />
                            </div>
                            <div className='flex items-center'>
                                <input
                                    type='checkbox'
                                    checked={editingShift?.lateStay.countTowardsTotal || false}
                                    onChange={(e) => updateEditingShift('lateStay', e.target.checked, 'countTowardsTotal')}
                                    className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded'
                                />
                                <label className='ml-2 text-sm text-neutral-700'>Count towards total hours</label>
                            </div>
                            <div>
                                <label className='input-label'>Overtime Multiplier</label>
                                <input
                                    type='number'
                                    value={editingShift?.lateStay.overtimeMultiplier || 1.5}
                                    onChange={(e) => updateEditingShift('lateStay', parseFloat(e.target.value), 'overtimeMultiplier')}
                                    className='time-input'
                                    min='1'
                                    max='3'
                                    step='0.1'
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </Modal>
    );
};

export default AddEditShift;
