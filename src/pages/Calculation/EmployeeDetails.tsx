import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { FaChartPie, FaCheckCircle, FaClock, FaExclamationCircle, FaTimesCircle } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import useWorkTimeStore, { CalculationResult } from '../../store/workTimeStore';
import TimePicker from '../../components/ui/TimePicker';
import TitleText from '../../components/ui/header';
import useCompanyStore from '../../store/companyStore';
import { GiMoneyStack } from 'react-icons/gi';

// Types for simulation record and calculation result
interface Break {
    start: string;
    end: string;
}

interface SimulationRecord {
    clockIn: string;
    clockOut: string;
    lunchStart: string;
    lunchEnd: string;
    breaks: Break[];
}

const EmployeeDetails: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();

    const { employeeRecords, simulateCalculation } = useWorkTimeStore();
    const { getCurrentParameters } = useCompanyStore();

    const user = useMemo(() => employeeRecords.find((c) => c.id === userId), [userId, employeeRecords]) || null;
    const parameters = getCurrentParameters(user?.company || '', user?.shift?.id || '');

    // Sample record for simulation
    const [simulationRecord, setSimulationRecord] = useState<SimulationRecord>({
        clockIn: '07:49',
        clockOut: '16:06',
        lunchStart: '11:45',
        lunchEnd: '12:15',
        breaks: [{ start: '10:00', end: '10:15' }],
    });

    // Keep calculation result in state
    const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);

    // Initialize with pre-filled data if available
    useEffect(() => {
        if (user && parameters) {
            setSimulationRecord(user);
            const result = simulateCalculation(user, parameters);
            console.log(' result:', result);
            setCalculationResult(result);
        }
    }, [user, parameters, simulateCalculation]);

    // Handle updating simulation record fields
    const handleFieldChange = (field: keyof SimulationRecord, value: string) => {};

    // Handle updating break times
    const handleBreakChange = (index: number, field: keyof Break, value: string) => {};

    // Handle removing a break
    const handleRemoveBreak = (index: number) => {};

    // Format break time as string
    const formatBreakTime = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    // Get status color
    const getStatusColor = (status: boolean) => {
        return status ? 'text-success-600' : 'text-error-600';
    };

    // Get status icon
    const getStatusIcon = (status: boolean) => {
        return status ? <FaCheckCircle className='inline-block mr-1' /> : <FaTimesCircle className='inline-block mr-1' />;
    };

    if (!parameters) {
        return (
            <div className='space-y-6 py-4'>
                <div className='animate-fade-in-down animate-duration-300'>
                    <h1 className='text-2xl font-semibold text-neutral-800'>Working Time Calculator</h1>
                    <p className='text-neutral-500 mt-1'>Please select a company first</p>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-6 py-4'>
            <TitleText title='Working Time Calculator' subtitle='Simulate working time calculations based on your settings' />

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2'>
                    <Card title='Simulation Parameters' icon={<FaClock size={20} />} className='animate-fade-in h-full'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div>
                                <h3 className='text-md font-medium text-neutral-800 mb-4'>Time Entry</h3>

                                <div className='grid grid-cols-2 gap-4 mb-4'>
                                    <div>
                                        <TimePicker
                                            className='w-full'
                                            label='Clock In'
                                            value={simulationRecord.clockIn}
                                            disabled
                                            onChange={(value) => handleFieldChange('clockIn', value)}
                                        />
                                    </div>
                                    <div>
                                        <TimePicker
                                            className='w-full'
                                            label='Clock Out'
                                            value={simulationRecord.clockOut}
                                            disabled
                                            onChange={(value) => handleFieldChange('clockOut', value)}
                                        />
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-4 mb-6'>
                                    <TimePicker
                                        className='w-full'
                                        label='Lunch Start'
                                        value={simulationRecord.lunchStart}
                                        disabled
                                        onChange={(value) => handleFieldChange('lunchStart', value)}
                                    />
                                    <TimePicker
                                        className='w-full'
                                        label='Lunch End'
                                        value={simulationRecord.lunchEnd}
                                        disabled
                                        onChange={(value) => handleFieldChange('lunchEnd', value)}
                                    />
                                </div>

                                <div className='mb-4'>
                                    <div className='flex items-center justify-between mb-2'>
                                        <label className='input-label'>Additional Breaks</label>
                                    </div>

                                    <div className='space-y-3'>
                                        {simulationRecord.breaks.map((breakItem, index) => (
                                            <div
                                                key={index}
                                                className='flex items-center space-x-2 p-2 border border-neutral-200 rounded-lg bg-neutral-50'
                                            >
                                                <TimePicker
                                                    value={breakItem.start}
                                                    onChange={(value) => handleBreakChange(index, 'start', value)}
                                                    className='w-24 text-sm'
                                                    disabled
                                                />
                                                <span className='text-neutral-400'>to</span>
                                                <TimePicker
                                                    value={breakItem.end}
                                                    onChange={(value) => handleBreakChange(index, 'end', value)}
                                                    className='w-24 text-sm'
                                                    disabled
                                                />
                                                <button
                                                    type='button'
                                                    className='text-error-500 hover:text-error-700 ml-auto'
                                                    onClick={() => handleRemoveBreak(index)}
                                                    disabled
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className='text-md font-medium text-neutral-800 mb-4'>Company Settings Reference</h3>

                                <div className='bg-neutral-50 p-4 rounded-lg text-sm space-y-2'>
                                    <div className='flex justify-between'>
                                        <span className='text-neutral-600'>Shift:</span>
                                        <div className='flex items-center'>
                                            <span className='font-medium first-letter:capitalize'>{parameters.name} </span>
                                            {parameters.shiftBonus?.isShiftBonus && (
                                                <div className='flex items-center font-medium ml-1'>
                                                    (<GiMoneyStack className='text-green-600 mr-1' size={20} />{' '}
                                                    {parameters.shiftBonus?.bonusAmount || 0})
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-neutral-600'>Work Hours:</span>
                                        <span className='font-medium'>
                                            {parameters.start} - {parameters.end}
                                        </span>
                                    </div>

                                    <div className='flex justify-between'>
                                        <span className='text-neutral-600'>Required Hours:</span>
                                        <span className='font-medium'>{calculationResult?.regularHours} hours</span>
                                    </div>

                                    <div className='flex justify-between'>
                                        <span className='text-neutral-600'>Lunch Break:</span>
                                        <span className='font-medium'>{parameters.lunchBreak.duration} min</span>
                                    </div>

                                    <div className='flex justify-between'>
                                        <span className='text-neutral-600'>Lunch Window:</span>
                                        <span className='font-medium'>
                                            {parameters.lunchBreak.flexWindowStart} - {parameters.lunchBreak.flexWindowEnd}
                                        </span>
                                    </div>

                                    <div className='flex justify-between'>
                                        <span className='text-neutral-600'>Early Arrival:</span>
                                        <span className='font-medium'>
                                            Max {parameters.earlyArrival.maxMinutes} min
                                            {parameters.earlyArrival.countTowardsTotal ? ' (counted)' : ' (not counted)'}
                                        </span>
                                    </div>

                                    <div className='flex justify-between'>
                                        <span className='text-neutral-600'>Late Stay:</span>
                                        <span className='font-medium'>
                                            Max {parameters.lateStay.maxMinutes} min
                                            {parameters.lateStay.countTowardsTotal ? ' (counted)' : ' (not counted)'}
                                        </span>
                                    </div>

                                    <div className='flex justify-between'>
                                        <span className='text-neutral-600'>Overtime Rate:</span>
                                        <span className='font-medium'>{parameters.lateStay.overtimeMultiplier}×</span>
                                    </div>
                                </div>

                                <div className='mt-4 p-3 bg-primary-50 border border-primary-100 rounded-lg text-sm text-primary-700'>
                                    <div className='flex items-start'>
                                        <FaExclamationCircle className='mt-0.5 mr-2 flex-shrink-0' />
                                        <div>
                                            <p className='font-medium mb-1'>Simulation Tips:</p>
                                            <ul className='list-disc list-inside space-y-1'>
                                                <li>Try different clock-in/out times to see how early arrival and overtime are calculated</li>
                                                <li>Adjust lunch times within and outside the flexible window to see the impact</li>
                                                <li>Add or remove breaks to understand their effect on total hours</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div>
                    <Card title='Calculation Results' icon={<FaChartPie size={20} />} className='animate-fade-in h-full'>
                        {calculationResult && (
                            <div className='space-y-4'>
                                <div className='p-3 bg-primary-50 rounded-lg'>
                                    <h4 className='font-medium text-primary-800 mb-2'>Time Summary</h4>
                                    <div className='text-sm space-y-2'>
                                        <div className='flex justify-between'>
                                            <span className='text-neutral-600'>Effective Start:</span>
                                            <span className='font-medium'>{calculationResult.effectiveStart}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-neutral-600'>Effective End:</span>
                                            <span className='font-medium'>{calculationResult.effectiveEnd}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-neutral-600'>Total Work:</span>
                                            <span className='font-medium'>{(calculationResult.totalWorkingMinutes / 60).toFixed(2)} hours</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-neutral-600'>Regular Hours:</span>
                                            <span className='font-medium'>{calculationResult.regularHours}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-neutral-600'>Overtime Hours:</span>
                                            <span className='font-medium'>{calculationResult.overtimeHours.toFixed(2)}</span>
                                        </div>

                                        <div className='flex justify-between'>
                                            <span className='text-neutral-600'>Overtime Pay:</span>
                                            <span className='font-medium'>{calculationResult.overtimePay}× hours</span>
                                        </div>
                                        <div className='mt-2 pt-2 border-t border-primary-200 flex justify-between font-semibold'>
                                            <span>Total Effective:</span>
                                            <span>{calculationResult.totalEffectiveHours} hours</span>
                                        </div>
                                        {parameters.shiftBonus?.isShiftBonus && (
                                            <div className='flex justify-between font-semibold'>
                                                <span className='text-neutral-600'>Shift Bonus:</span>
                                                <span className='flex gap-1 items-center'>
                                                    <GiMoneyStack className='text-green-600' size={20} /> {parameters.shiftBonus?.bonusAmount || 0}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className='p-3 bg-neutral-50 rounded-lg'>
                                    <h4 className='font-medium text-neutral-800 mb-2'>Time Deductions</h4>
                                    <div className='text-sm space-y-2'>
                                        <div className='flex justify-between'>
                                            <span className='text-neutral-600'>Lunch Break:</span>
                                            <span className='font-medium'>{formatBreakTime(calculationResult.lunchDuration)}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-neutral-600'>Other Breaks:</span>
                                            <span className='font-medium'>{formatBreakTime(calculationResult.otherBreaksDuration)}</span>
                                        </div>
                                        <div className='mt-2 pt-2 border-t border-neutral-200 flex justify-between font-semibold'>
                                            <span>Total Deducted:</span>
                                            <span>{formatBreakTime(calculationResult.lunchDuration + calculationResult.otherBreaksDuration)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className='font-medium text-neutral-800 mb-2'>Status Check</h4>
                                    <div className='text-sm space-y-1.5'>
                                        <div className={getStatusColor(calculationResult.isLunchBreakInWindow)}>
                                            {getStatusIcon(calculationResult.isLunchBreakInWindow)}
                                            Lunch in flexible window
                                        </div>

                                        <div className={getStatusColor(calculationResult.isLunchBreakCorrectDuration)}>
                                            {getStatusIcon(calculationResult.isLunchBreakCorrectDuration)}
                                            Correct lunch duration
                                        </div>

                                        {calculationResult.earlyArrival && (
                                            <div className='text-primary-600'>
                                                <FaExclamationCircle className='inline-block mr-1' />
                                                Early by {calculationResult.earlyArrivalMinutes} min
                                                {parameters.earlyArrival.countTowardsTotal ? ' (counted)' : ' (not counted)'}
                                            </div>
                                        )}

                                        {calculationResult.lateArrival && (
                                            <div className='text-warning-600'>
                                                <FaExclamationCircle className='inline-block mr-1' />
                                                Late by {calculationResult.lateArrivalMinutes} min
                                            </div>
                                        )}

                                        {calculationResult.earlyDeparture && (
                                            <div className='text-warning-600'>
                                                <FaExclamationCircle className='inline-block mr-1' />
                                                Left early by {calculationResult.earlyDepartureMinutes} min
                                            </div>
                                        )}

                                        {calculationResult.lateDeparture && (
                                            <div className='text-primary-600'>
                                                <FaExclamationCircle className='inline-block mr-1' />
                                                Stayed late by {calculationResult.lateDepartureMinutes} min
                                                {calculationResult.overtimeHours > 0
                                                    ? ' (includes overtime)'
                                                    : parameters.lateStay.countTowardsTotal
                                                    ? ' (counted)'
                                                    : ' (not counted)'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className='mt-4'>
                                    <h4 className='font-medium text-neutral-800 mb-3'>Hours Breakdown</h4>

                                    {/* <div className='relative h-6 bg-neutral-100 rounded-full overflow-hidden mb-2'>
                                        {calculationResult.regularHours > 0 && (
                                            <div
                                                className='absolute h-full bg-primary-500'
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        (calculationResult.regularHours / parameters.workingHours.totalRequired) * 100
                                                    )}%`,
                                                }}
                                            ></div>
                                        )}

                                        {calculationResult.overtimeHours > 0 && (
                                            <div
                                                className='absolute h-full bg-success-600'
                                                style={{
                                                    left: `${Math.min(
                                                        100,
                                                        (calculationResult.regularHours / parameters.workingHours.totalRequired) * 100
                                                    )}%`,
                                                    width: `${Math.min(
                                                        100,
                                                        (calculationResult.overtimeHours / parameters.workingHours.totalRequired) * 100
                                                    )}%`,
                                                }}
                                            ></div>
                                        )}

                                        <div className='absolute h-full w-px bg-neutral-800' style={{ left: '100%' }}></div>
                                    </div> */}

                                    <div className='flex text-xs justify-between'>
                                        <span>0</span>
                                        <span className='font-medium'>{8} hours (required)</span>
                                    </div>

                                    <div className='flex text-xs text-neutral-600 mt-3 space-x-4'>
                                        <div className='flex items-center'>
                                            <div className='w-3 h-3 bg-primary-500 rounded-sm mr-1'></div>
                                            <span>Regular</span>
                                        </div>

                                        <div className='flex items-center'>
                                            <div className='w-3 h-3 bg-success-600 rounded-sm mr-1'></div>
                                            <span>Overtime</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetails;
