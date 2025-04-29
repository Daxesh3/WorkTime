import React, { useState } from 'react';
import { FiSun, FiAlertCircle, FiCoffee, FiClock } from 'react-icons/fi';

import { CompanyParameters } from '../../shared/types';
import Modal from '../../components/ui/Modal';
import TimePicker from '../../components/ui/TimePicker';
import Card from '../../components/ui/Card';

interface AddEditCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (company: { name: string; parameters: CompanyParameters }) => void;
    initialData?: { name: string; parameters: CompanyParameters };
}

export const defaultParameters: CompanyParameters = {
    workingHours: {
        start: '08:00',
        end: '17:00',
        totalRequired: 8,
    },
    lunchBreak: {
        defaultStart: '12:00',
        duration: 60,
        flexWindowStart: '11:30',
        flexWindowEnd: '13:30',
    },
    earlyArrival: {
        maxMinutes: 30,
        countTowardsTotal: true,
    },
    lateStay: {
        maxMinutes: 30,
        countTowardsTotal: true,
        overtimeMultiplier: 1.5,
    },
};

const AddEditCompanyModal: React.FC<AddEditCompanyModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState<string>(initialData?.name || '');
    const [parameters, setParameters] = useState<CompanyParameters>(initialData?.parameters || defaultParameters);

    const handleParameterChange = (section: keyof CompanyParameters, field: string, value: any) => {
        setParameters((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const handleSave = () => {
        onSave({ name, parameters });
        onClose();
    };

    return (
        <Modal
            size='5xl'
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Edit Company' : 'Add Company'}
            footer={
                <div className='flex justify-end space-x-2'>
                    <button className='btn btn-secondary' onClick={onClose}>
                        Cancel
                    </button>
                    <button className='btn btn-primary' onClick={handleSave}>
                        Save
                    </button>
                </div>
            }
        >
            <div className='space-y-4'>
                {/* Company Name */}
                <div>
                    <label className='input-label'>Company Name</label>
                    <input
                        type='text'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className='time-input w-full'
                        placeholder='Enter company name'
                    />
                </div>

                {/* Working Hours */}
                <Card title='Working Hours' icon={<FiClock size={20} />}>
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className='input-label'>Start Time</label>
                            <TimePicker
                                value={parameters.workingHours.start}
                                onChange={(value) => handleParameterChange('workingHours', 'start', value)}
                                className='w-full'
                            />
                        </div>
                        <div>
                            <label className='input-label'>End Time</label>
                            <TimePicker
                                value={parameters.workingHours.end}
                                onChange={(value) => handleParameterChange('workingHours', 'end', value)}
                                className='w-full'
                            />
                        </div>
                        <div>
                            <label className='input-label'>Required Hours</label>
                            <input
                                type='number'
                                value={parameters.workingHours.totalRequired}
                                onChange={(e) => handleParameterChange('workingHours', 'totalRequired', parseFloat(e.target.value))}
                                className='time-input w-full'
                                min='0'
                                step='0.5'
                            />
                        </div>
                    </div>
                </Card>

                {/* Lunch Break */}
                <Card title='Lunch Break' icon={<FiCoffee size={20} />}>
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className='input-label'>Default Start</label>
                            <TimePicker
                                value={parameters.lunchBreak.defaultStart}
                                onChange={(value) => handleParameterChange('lunchBreak', 'defaultStart', value)}
                                className='w-full'
                            />
                        </div>
                        <div>
                            <label className='input-label'>Duration (minutes)</label>
                            <input
                                type='number'
                                value={parameters.lunchBreak.duration}
                                onChange={(e) => handleParameterChange('lunchBreak', 'duration', parseInt(e.target.value, 10))}
                                className='time-input w-full'
                                min='0'
                            />
                        </div>
                        <div>
                            <label className='input-label'>Flex Window Start</label>
                            <TimePicker
                                value={parameters.lunchBreak.flexWindowStart}
                                onChange={(value) => handleParameterChange('lunchBreak', 'flexWindowStart', value)}
                                className='w-full'
                            />
                        </div>
                        <div>
                            <label className='input-label'>Flex Window End</label>
                            <TimePicker
                                value={parameters.lunchBreak.flexWindowEnd}
                                onChange={(value) => handleParameterChange('lunchBreak', 'flexWindowEnd', value)}
                                className='w-full'
                            />
                        </div>
                    </div>
                </Card>

                <Card title='Early Arrival & Late Stay Policies' icon={<FiSun size={20} />}>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                        <div>
                            <h3 className='text-md font-medium text-neutral-800 mb-4'>Early Arrival Policy</h3>

                            <div className='mb-4'>
                                <label className='input-label'>Maximum Early Minutes</label>
                                <div className='flex items-center'>
                                    <input
                                        type='number'
                                        min='0'
                                        max='120'
                                        step='5'
                                        value={parameters.earlyArrival.maxMinutes}
                                        onChange={(e) => handleParameterChange('earlyArrival', 'maxMinutes', parseInt(e.target.value))}
                                        className='time-input w-24'
                                    />
                                    <span className='ml-2 text-neutral-600'>minutes</span>
                                </div>
                                <p className='text-xs text-neutral-500 mt-1'>Maximum time before scheduled start that will be counted</p>
                            </div>

                            <div className='flex items-center mb-4'>
                                <input
                                    type='checkbox'
                                    id='early-counts'
                                    checked={parameters.earlyArrival.countTowardsTotal}
                                    onChange={(e) => handleParameterChange('earlyArrival', 'countTowardsTotal', e.target.checked)}
                                    className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded'
                                />
                                <label htmlFor='early-counts' className='ml-2 block text-sm text-neutral-700'>
                                    Count early arrival towards total working hours
                                </label>
                            </div>
                        </div>

                        <div>
                            <h3 className='text-md font-medium text-neutral-800 mb-4'>Late Stay Policy</h3>

                            <div className='mb-4'>
                                <label className='input-label'>Maximum Late Minutes</label>
                                <div className='flex items-center'>
                                    <input
                                        type='number'
                                        min='0'
                                        max='120'
                                        step='5'
                                        value={parameters.lateStay.maxMinutes}
                                        onChange={(e) => handleParameterChange('lateStay', 'maxMinutes', parseInt(e.target.value))}
                                        className='time-input w-24'
                                    />
                                    <span className='ml-2 text-neutral-600'>minutes</span>
                                </div>
                                <p className='text-xs text-neutral-500 mt-1'>Maximum time after scheduled end before overtime applies</p>
                            </div>

                            <div className='flex items-center mb-4'>
                                <input
                                    type='checkbox'
                                    id='late-counts'
                                    checked={parameters.lateStay.countTowardsTotal}
                                    onChange={(e) => handleParameterChange('lateStay', 'countTowardsTotal', e.target.checked)}
                                    className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded'
                                />
                                <label htmlFor='late-counts' className='ml-2 block text-sm text-neutral-700'>
                                    Count late stay towards total working hours
                                </label>
                            </div>

                            <div className='mb-4'>
                                <label className='input-label'>Overtime Multiplier</label>
                                <div className='flex items-center'>
                                    <input
                                        type='number'
                                        min='1'
                                        max='3'
                                        step='0.1'
                                        value={parameters.lateStay.overtimeMultiplier}
                                        onChange={(e) => handleParameterChange('lateStay', 'overtimeMultiplier', parseFloat(e.target.value))}
                                        className='time-input w-24'
                                    />
                                    <span className='ml-2 text-neutral-600'>× regular pay</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='mt-2 p-2 bg-primary-50 border border-primary-100 rounded-lg'>
                        <div className='flex items-start'>
                            <FiAlertCircle className='text-primary-600 mt-0.5 mr-1 flex-shrink-0' />
                            <div className='text-sm text-primary-800'>
                                <p className='font-medium mb-1'>Time Calculation Summary:</p>
                                <ul className='list-disc list-inside space-y-1'>
                                    <li>
                                        <strong>Early arrival:</strong> Employees arriving up to {parameters.earlyArrival.maxMinutes} minutes early
                                        {parameters.earlyArrival.countTowardsTotal ? ' will' : ' will not'} have this time counted.
                                    </li>
                                    <li>
                                        <strong>Late stay:</strong> Employees staying up to {parameters.lateStay.maxMinutes} minutes late
                                        {parameters.lateStay.countTowardsTotal ? ' will' : ' will not'} have this time counted.
                                    </li>
                                    <li>
                                        <strong>Overtime:</strong> Time beyond {parameters.lateStay.maxMinutes} minutes after shift end is paid at{' '}
                                        {parameters.lateStay.overtimeMultiplier}× rate.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </Modal>
    );
};

export default AddEditCompanyModal;
