import React, { useState } from 'react';
import { FiClock, FiCoffee, FiSun, FiAlertCircle } from 'react-icons/fi';
import TimePicker from '../components/ui/TimePicker';
import TimeSlider from '../components/ui/TimeSlider';
import Card from '../components/ui/Card';
import useWorkTimeStore from '../store/workTimeStore';
import { CompanyParameters } from '../shared/types';

const ParameterSettings: React.FC = () => {
    const { parameters, updateParameters } = useWorkTimeStore();

    // Create local state to manage form values
    const [localParams, setLocalParams] = useState<CompanyParameters>({ ...parameters });

    // Handle numeric input changes
    const handleNumberChange = (path: string, value: number) => {
        const newParams = { ...localParams };

        // Split the path into parts (e.g., "lunchBreak.duration" -> ["lunchBreak", "duration"])
        const pathParts = path.split('.');

        // Navigate to the right part of the object
        let current: any = newParams;
        for (let i = 0; i < pathParts.length - 1; i++) {
            current = current[pathParts[i]];
        }

        // Update the value
        current[pathParts[pathParts.length - 1]] = value;

        setLocalParams(newParams);
        updateParameters(newParams);
    };

    // Handle time input changes
    const handleTimeChange = (path: string, value: string) => {
        const newParams = { ...localParams };

        const pathParts = path.split('.');
        let current: any = newParams;
        for (let i = 0; i < pathParts.length - 1; i++) {
            current = current[pathParts[i]];
        }

        current[pathParts[pathParts.length - 1]] = value;

        setLocalParams(newParams);
        updateParameters(newParams);
    };

    // Handle checkbox changes
    const handleCheckboxChange = (path: string, checked: boolean) => {
        const newParams = { ...localParams };

        const pathParts = path.split('.');
        let current: any = newParams;
        for (let i = 0; i < pathParts.length - 1; i++) {
            current = current[pathParts[i]];
        }

        current[pathParts[pathParts.length - 1]] = checked;

        setLocalParams(newParams);
        updateParameters(newParams);
    };

    // Handle lunch break window changes
    const handleLunchWindowChange = ([start, end]: [string, string]) => {
        const newParams = { ...localParams };
        newParams.lunchBreak.flexWindowStart = start;
        newParams.lunchBreak.flexWindowEnd = end;

        setLocalParams(newParams);
        updateParameters(newParams);
    };

    return (
        <div className='space-y-6 py-4'>
            <div className='animate-fade-in-down animate-duration-300'>
                <h1 className='text-2xl font-semibold text-neutral-800'>Company Parameter Settings</h1>
                <p className='text-neutral-500 mt-1'>Configure working hours, breaks, and calculation rules</p>
            </div>

            {/* Working Hours Card */}
            <Card title='Working Hours' icon={<FiClock size={20} />} className='animate-fade-in'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                        <div className='mb-4'>
                            <TimePicker
                                label='Work Start Time'
                                value={localParams.workingHours.start}
                                onChange={(value) => handleTimeChange('workingHours.start', value)}
                            />
                        </div>

                        <div className='mb-4'>
                            <TimePicker
                                label='Work End Time'
                                value={localParams.workingHours.end}
                                onChange={(value) => handleTimeChange('workingHours.end', value)}
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='input-label'>Total Required Hours</label>
                            <div className='flex items-center'>
                                <input
                                    type='number'
                                    min='1'
                                    max='24'
                                    step='0.5'
                                    value={localParams.workingHours.totalRequired}
                                    onChange={(e) => handleNumberChange('workingHours.totalRequired', parseFloat(e.target.value))}
                                    className='time-input w-24'
                                />
                                <span className='ml-2 text-neutral-600'>hours</span>
                            </div>
                        </div>
                    </div>

                    <div className='bg-neutral-50 p-4 rounded-lg'>
                        <div className='text-sm text-neutral-600 mb-3'>
                            <div className='flex items-center mb-2'>
                                <FiAlertCircle className='text-primary-500 mr-2' />
                                <span className='font-medium'>Daily Schedule Overview</span>
                            </div>
                            <p>
                                Working day runs from <span className='font-medium'>{localParams.workingHours.start}</span> to{' '}
                                <span className='font-medium'>{localParams.workingHours.end}</span>
                            </p>
                            <p>
                                Total required hours: <span className='font-medium'>{localParams.workingHours.totalRequired} hours</span>
                            </p>
                        </div>

                        <div className='relative h-20 bg-white rounded-lg border border-neutral-200 p-2 mt-4'>
                            <div className='absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-2 bg-neutral-100 rounded-full mx-4'></div>

                            {/* Work start indicator */}
                            <div className='absolute top-1/2 transform -translate-y-1/2' style={{ left: '10%' }}>
                                <div className='h-4 w-4 bg-primary-500 rounded-full'></div>
                                <div className='absolute text-xs text-primary-700 font-medium -mt-6 -ml-3'>{localParams.workingHours.start}</div>
                                <div className='absolute text-xs text-neutral-500 mt-6 -ml-4'>Start</div>
                            </div>

                            {/* Lunch break indicator */}
                            <div className='absolute top-1/2 transform -translate-y-1/2' style={{ left: '50%' }}>
                                <div className='h-4 w-4 bg-warning-500 rounded-full'></div>
                                <div className='absolute text-xs text-warning-700 font-medium -mt-6 -ml-4'>Lunch</div>
                            </div>

                            {/* Work end indicator */}
                            <div className='absolute top-1/2 transform -translate-y-1/2' style={{ left: '90%' }}>
                                <div className='h-4 w-4 bg-primary-500 rounded-full'></div>
                                <div className='absolute text-xs text-primary-700 font-medium -mt-6 -ml-3'>{localParams.workingHours.end}</div>
                                <div className='absolute text-xs text-neutral-500 mt-6 -ml-3'>End</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Lunch Break Card */}
            <Card title='Lunch Break' icon={<FiCoffee size={20} />} className='animate-fade-in'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                        <div className='mb-4'>
                            <label className='input-label'>Lunch Break Duration</label>
                            <div className='flex items-center'>
                                <input
                                    type='number'
                                    min='15'
                                    max='120'
                                    step='5'
                                    value={localParams.lunchBreak.duration}
                                    onChange={(e) => handleNumberChange('lunchBreak.duration', parseInt(e.target.value))}
                                    className='time-input w-24'
                                />
                                <span className='ml-2 text-neutral-600'>minutes</span>
                            </div>
                        </div>

                        <div className='mb-4'>
                            <TimePicker
                                label='Default Lunch Start Time'
                                value={localParams.lunchBreak.defaultStart}
                                onChange={(value) => handleTimeChange('lunchBreak.defaultStart', value)}
                            />
                        </div>

                        <TimeSlider
                            label='Flexible Lunch Window'
                            startTime='08:00'
                            endTime='17:00'
                            value={[localParams.lunchBreak.flexWindowStart, localParams.lunchBreak.flexWindowEnd]}
                            onChange={handleLunchWindowChange}
                            step={15}
                            markers={[{ time: localParams.lunchBreak.defaultStart, label: 'Default lunch start' }]}
                        />
                    </div>

                    <div className='bg-neutral-50 p-4 rounded-lg'>
                        <div className='text-sm text-neutral-600'>
                            <div className='flex items-center mb-2'>
                                <FiAlertCircle className='text-primary-500 mr-2' />
                                <span className='font-medium'>Lunch Break Policy</span>
                            </div>
                            <p>
                                Duration: <span className='font-medium'>{localParams.lunchBreak.duration} minutes</span>
                            </p>
                            <p>
                                Default start time: <span className='font-medium'>{localParams.lunchBreak.defaultStart}</span>
                            </p>
                            <p>
                                Flexible window:{' '}
                                <span className='font-medium'>
                                    {localParams.lunchBreak.flexWindowStart} - {localParams.lunchBreak.flexWindowEnd}
                                </span>
                            </p>
                        </div>

                        <div className='mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg text-sm text-warning-800'>
                            <p className='font-medium mb-1'>Lunch Break Rules:</p>
                            <ul className='list-disc list-inside'>
                                <li>Employees must take exactly {localParams.lunchBreak.duration} minutes for lunch</li>
                                <li>Lunch must be taken within the flexible window</li>
                                <li>Lunch time is not counted as working time</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Card>
            {/* Early Arrival and Late Stay Card */}
            <Card title='Early Arrival & Late Stay Policies' icon={<FiSun size={20} />} className='animate-fade-in'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                                    value={localParams.earlyArrival.maxMinutes}
                                    onChange={(e) => handleNumberChange('earlyArrival.maxMinutes', parseInt(e.target.value))}
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
                                checked={localParams.earlyArrival.countTowardsTotal}
                                onChange={(e) => handleCheckboxChange('earlyArrival.countTowardsTotal', e.target.checked)}
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
                                    value={localParams.lateStay.maxMinutes}
                                    onChange={(e) => handleNumberChange('lateStay.maxMinutes', parseInt(e.target.value))}
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
                                checked={localParams.lateStay.countTowardsTotal}
                                onChange={(e) => handleCheckboxChange('lateStay.countTowardsTotal', e.target.checked)}
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
                                    value={localParams.lateStay.overtimeMultiplier}
                                    onChange={(e) => handleNumberChange('lateStay.overtimeMultiplier', parseFloat(e.target.value))}
                                    className='time-input w-24'
                                />
                                <span className='ml-2 text-neutral-600'>× regular pay</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-4 p-4 bg-primary-50 border border-primary-100 rounded-lg'>
                    <div className='flex items-start'>
                        <FiAlertCircle className='text-primary-600 mt-0.5 mr-3 flex-shrink-0' />
                        <div className='text-sm text-primary-800'>
                            <p className='font-medium mb-1'>Time Calculation Summary:</p>
                            <ul className='list-disc list-inside space-y-1'>
                                <li>
                                    <strong>Early arrival:</strong> Employees arriving up to {localParams.earlyArrival.maxMinutes} minutes early
                                    {localParams.earlyArrival.countTowardsTotal ? ' will' : ' will not'} have this time counted.
                                </li>
                                <li>
                                    <strong>Late stay:</strong> Employees staying up to {localParams.lateStay.maxMinutes} minutes late
                                    {localParams.lateStay.countTowardsTotal ? ' will' : ' will not'} have this time counted.
                                </li>
                                <li>
                                    <strong>Overtime:</strong> Time beyond {localParams.lateStay.maxMinutes} minutes after shift end is paid at{' '}
                                    {localParams.lateStay.overtimeMultiplier}× rate.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ParameterSettings;
