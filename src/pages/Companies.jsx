import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaClock, FaExclamationCircle } from 'react-icons/fa';
import Card from '../components/ui/Card';
import useCompanyStore from '../store/companyStore';
import TimePicker from '../components/ui/TimePicker';

const Companies = () => {
    const { companies, addCompany, updateCompany, deleteCompany, setCurrentCompany, currentCompanyId } = useCompanyStore();
    const [isAddingCompany, setIsAddingCompany] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Default parameters for new companies
    const defaultParameters = {
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
        breaks: {
            morning: {
                defaultTime: '10:00',
                duration: 15,
            },
            afternoon: {
                defaultTime: '15:00',
                duration: 15,
            },
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

    // New company state
    const [newCompany, setNewCompany] = useState({
        name: '',
        parameters: defaultParameters,
    });

    // Handle adding a new company
    const handleAddCompany = () => {
        addCompany(newCompany);
        setIsAddingCompany(false);
        setNewCompany({
            name: '',
            parameters: defaultParameters,
        });
    };

    // Handle updating a company
    const handleUpdateCompany = (id) => {
        const company = companies.find((c) => c.id === id);
        if (company) {
            updateCompany(id, {
                name: newCompany.name,
                parameters: newCompany.parameters,
            });
            setEditingId(null);
        }
    };

    // Handle parameter changes
    const handleParameterChange = (section, field, value) => {
        setNewCompany((prev) => ({
            ...prev,
            parameters: {
                ...prev.parameters,
                [section]: {
                    ...prev.parameters[section],
                    [field]: value,
                },
            },
        }));
    };

    return (
        <div className='space-y-6 py-4'>
            <div className='animate-fade-in-down animate-duration-300'>
                <h1 className='text-2xl font-semibold text-neutral-800'>Companies</h1>
                <p className='text-neutral-500 mt-1'>Manage your companies and their working time parameters</p>
            </div>

            <Card
                title='Companies List'
                className='animate-fade-in'
                actionButton={
                    <button
                        className='btn btn-primary'
                        onClick={() => {
                            setIsAddingCompany(true);
                            setEditingId(null);
                            setNewCompany({
                                name: '',
                                parameters: defaultParameters,
                            });
                        }}
                    >
                        <FaPlus className='mr-1' /> Add Company
                    </button>
                }
            >
                {companies.length > 0 ? (
                    <div className='overflow-x-auto -mx-4 px-4'>
                        <table className='min-w-full divide-y divide-neutral-200'>
                            <thead>
                                <tr>
                                    <th className='py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Company Name</th>
                                    <th className='py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Created</th>
                                    <th className='py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>Last Updated</th>
                                    <th className='py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-neutral-100'>
                                {companies.map((company) => (
                                    <tr key={company.id} className={`hover:bg-neutral-50 ${company.id === currentCompanyId ? 'bg-primary-50' : ''}`}>
                                        <td className='py-4 whitespace-nowrap'>
                                            <div className='text-sm font-medium text-neutral-900'>{company.name}</div>
                                        </td>
                                        <td className='py-4 whitespace-nowrap'>
                                            <div className='text-sm text-neutral-500'>{new Date(company.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className='py-4 whitespace-nowrap'>
                                            <div className='text-sm text-neutral-500'>{new Date(company.updatedAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className='py-4 text-right whitespace-nowrap'>
                                            <div className='flex justify-end space-x-2'>
                                                <button
                                                    className={`btn btn-sm ${company.id === currentCompanyId ? 'btn-primary' : 'btn-secondary'}`}
                                                    onClick={() => setCurrentCompany(company.id)}
                                                >
                                                    {company.id === currentCompanyId ? 'Selected' : 'Select'}
                                                </button>
                                                <button
                                                    className='text-primary-600 hover:text-primary-800'
                                                    onClick={() => {
                                                        setEditingId(company.id);
                                                        setNewCompany({
                                                            name: company.name,
                                                            parameters: company.parameters,
                                                        });
                                                    }}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button className='text-error-600 hover:text-error-800' onClick={() => deleteCompany(company.id)}>
                                                    <FaTrash />
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
                        <div className='text-neutral-400 mb-2'>No companies added yet</div>
                        <button className='btn btn-primary mx-auto' onClick={() => setIsAddingCompany(true)}>
                            <FaPlus className='mr-1' /> Add First Company
                        </button>
                    </div>
                )}
            </Card>

            {/* Form for adding/editing companies */}
            {(isAddingCompany || editingId) && (
                <div className='animate-fade-in-down animate-duration-300'>
                    <div className='space-y-6'>
                        <div>
                            <label className='input-label'>Company Name</label>
                            <input
                                type='text'
                                value={newCompany.name}
                                onChange={(e) => setNewCompany((prev) => ({ ...prev, name: e.target.value }))}
                                className='time-input w-full'
                                placeholder='Enter company name'
                            />
                        </div>

                        <Card
                            title='Working Hours'
                            icon={<FaClock size={20} />}
                            className='animate-fade-in'
                            actionButton={
                                <div className='flex space-x-2'>
                                    <button
                                        className='btn btn-secondary'
                                        onClick={() => {
                                            setIsAddingCompany(false);
                                            setEditingId(null);
                                        }}
                                    >
                                        <FaTimes /> Cancel
                                    </button>
                                    <button
                                        className='btn btn-primary'
                                        onClick={isAddingCompany ? handleAddCompany : () => handleUpdateCompany(editingId)}
                                    >
                                        <FaCheck /> {isAddingCompany ? 'Add' : 'Save'}
                                    </button>
                                </div>
                            }
                        >
                            <div className='space-y-6'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='input-label'>Start Time</label>
                                        <TimePicker
                                            value={newCompany.parameters.workingHours.start}
                                            onChange={(value) => handleParameterChange('workingHours', 'start', value)}
                                            className='w-full'
                                        />
                                    </div>
                                    <div>
                                        <label className='input-label'>End Time</label>
                                        <TimePicker
                                            value={newCompany.parameters.workingHours.end}
                                            onChange={(value) => handleParameterChange('workingHours', 'end', value)}
                                            className='w-full'
                                        />
                                    </div>
                                    <div>
                                        <label className='input-label'>Required Hours</label>
                                        <input
                                            type='number'
                                            value={newCompany.parameters.workingHours.totalRequired}
                                            onChange={(e) => handleParameterChange('workingHours', 'totalRequired', parseFloat(e.target.value))}
                                            className='time-input w-full'
                                            min='0'
                                            step='0.5'
                                        />
                                    </div>
                                </div>

                                <div className='bg-neutral-50 p-4 rounded-lg'>
                                    <h3 className='font-medium text-neutral-800 mb-2'>Daily Schedule Overview</h3>
                                    <div className='space-y-2 text-sm text-neutral-600'>
                                        <p>
                                            • Regular working hours: {newCompany.parameters.workingHours.start} -{' '}
                                            {newCompany.parameters.workingHours.end}
                                        </p>
                                        <p>• Total required hours per day: {newCompany.parameters.workingHours.totalRequired} hours</p>
                                        <p>
                                            • Lunch break: {newCompany.parameters.lunchBreak.defaultStart} (
                                            {newCompany.parameters.lunchBreak.duration} minutes)
                                        </p>
                                        <p>
                                            • Morning break: {newCompany.parameters.breaks.morning.defaultTime} (
                                            {newCompany.parameters.breaks.morning.duration} minutes)
                                        </p>
                                        <p>
                                            • Afternoon break: {newCompany.parameters.breaks.afternoon.defaultTime} (
                                            {newCompany.parameters.breaks.afternoon.duration} minutes)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title='Lunch Break' icon={<FaClock size={20} />} className='animate-fade-in'>
                            <div className='space-y-6'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='input-label'>Default Start Time</label>
                                        <TimePicker
                                            value={newCompany.parameters.lunchBreak.defaultStart}
                                            onChange={(value) => handleParameterChange('lunchBreak', 'defaultStart', value)}
                                            className='w-full'
                                        />
                                    </div>
                                    <div>
                                        <label className='input-label'>Duration (minutes)</label>
                                        <input
                                            type='number'
                                            value={newCompany.parameters.lunchBreak.duration}
                                            onChange={(e) => handleParameterChange('lunchBreak', 'duration', parseInt(e.target.value))}
                                            className='time-input w-full'
                                            min='0'
                                        />
                                    </div>
                                    <div>
                                        <label className='input-label'>Flex Window Start</label>
                                        <TimePicker
                                            value={newCompany.parameters.lunchBreak.flexWindowStart}
                                            onChange={(value) => handleParameterChange('lunchBreak', 'flexWindowStart', value)}
                                            className='w-full'
                                        />
                                    </div>
                                    <div>
                                        <label className='input-label'>Flex Window End</label>
                                        <TimePicker
                                            value={newCompany.parameters.lunchBreak.flexWindowEnd}
                                            onChange={(value) => handleParameterChange('lunchBreak', 'flexWindowEnd', value)}
                                            className='w-full'
                                        />
                                    </div>
                                </div>

                                <div className='bg-neutral-50 p-4 rounded-lg'>
                                    <h3 className='font-medium text-neutral-800 mb-2'>Lunch Break Policy</h3>
                                    <div className='space-y-2 text-sm text-neutral-600'>
                                        <p>• Default lunch break time: {newCompany.parameters.lunchBreak.defaultStart}</p>
                                        <p>• Duration: {newCompany.parameters.lunchBreak.duration} minutes</p>
                                        <p>
                                            • Flexible window: {newCompany.parameters.lunchBreak.flexWindowStart} -{' '}
                                            {newCompany.parameters.lunchBreak.flexWindowEnd}
                                        </p>
                                        <p>• Employees can take their lunch break within this window</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title='Breaks' icon={<FaClock size={20} />} className='animate-fade-in'>
                            <div className='space-y-6'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='input-label'>Morning Break Time</label>
                                        <TimePicker
                                            value={newCompany.parameters.breaks.morning.defaultTime}
                                            onChange={(value) =>
                                                handleParameterChange('breaks', 'morning', {
                                                    ...newCompany.parameters.breaks.morning,
                                                    defaultTime: value,
                                                })
                                            }
                                            className='w-full'
                                        />
                                    </div>
                                    <div>
                                        <label className='input-label'>Morning Break Duration (minutes)</label>
                                        <input
                                            type='number'
                                            value={newCompany.parameters.breaks.morning.duration}
                                            onChange={(e) =>
                                                handleParameterChange('breaks', 'morning', {
                                                    ...newCompany.parameters.breaks.morning,
                                                    duration: parseInt(e.target.value),
                                                })
                                            }
                                            className='time-input w-full'
                                            min='0'
                                        />
                                    </div>
                                    <div>
                                        <label className='input-label'>Afternoon Break Time</label>
                                        <TimePicker
                                            value={newCompany.parameters.breaks.afternoon.defaultTime}
                                            onChange={(value) =>
                                                handleParameterChange('breaks', 'afternoon', {
                                                    ...newCompany.parameters.breaks.afternoon,
                                                    defaultTime: value,
                                                })
                                            }
                                            className='w-full'
                                        />
                                    </div>
                                    <div>
                                        <label className='input-label'>Afternoon Break Duration (minutes)</label>
                                        <input
                                            type='number'
                                            value={newCompany.parameters.breaks.afternoon.duration}
                                            onChange={(e) =>
                                                handleParameterChange('breaks', 'afternoon', {
                                                    ...newCompany.parameters.breaks.afternoon,
                                                    duration: parseInt(e.target.value),
                                                })
                                            }
                                            className='time-input w-full'
                                            min='0'
                                        />
                                    </div>
                                </div>

                                <div className='bg-neutral-50 p-4 rounded-lg'>
                                    <h3 className='font-medium text-neutral-800 mb-2'>Break Summary</h3>
                                    <div className='space-y-2 text-sm text-neutral-600'>
                                        <p>
                                            • Morning break: {newCompany.parameters.breaks.morning.defaultTime} (
                                            {newCompany.parameters.breaks.morning.duration} minutes)
                                        </p>
                                        <p>
                                            • Afternoon break: {newCompany.parameters.breaks.afternoon.defaultTime} (
                                            {newCompany.parameters.breaks.afternoon.duration} minutes)
                                        </p>
                                        <p>
                                            • Total break time per day:{' '}
                                            {newCompany.parameters.breaks.morning.duration + newCompany.parameters.breaks.afternoon.duration} minutes
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title='Early Arrival' icon={<FaExclamationCircle size={20} />} className='animate-fade-in'>
                            <div className='space-y-6'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='input-label'>Max Minutes</label>
                                        <input
                                            type='number'
                                            value={newCompany.parameters.earlyArrival.maxMinutes}
                                            onChange={(e) => handleParameterChange('earlyArrival', 'maxMinutes', parseInt(e.target.value))}
                                            className='time-input w-full'
                                            min='0'
                                        />
                                    </div>
                                    <div className='flex items-center'>
                                        <input
                                            type='checkbox'
                                            checked={newCompany.parameters.earlyArrival.countTowardsTotal}
                                            onChange={(e) => handleParameterChange('earlyArrival', 'countTowardsTotal', e.target.checked)}
                                            className='mr-2'
                                        />
                                        <label className='input-label'>Count towards total hours</label>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title='Late Stay' icon={<FaExclamationCircle size={20} />} className='animate-fade-in'>
                            <div className='space-y-6'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='input-label'>Max Minutes</label>
                                        <input
                                            type='number'
                                            value={newCompany.parameters.lateStay.maxMinutes}
                                            onChange={(e) => handleParameterChange('lateStay', 'maxMinutes', parseInt(e.target.value))}
                                            className='time-input w-full'
                                            min='0'
                                        />
                                    </div>
                                    <div className='flex items-center'>
                                        <input
                                            type='checkbox'
                                            checked={newCompany.parameters.lateStay.countTowardsTotal}
                                            onChange={(e) => handleParameterChange('lateStay', 'countTowardsTotal', e.target.checked)}
                                            className='mr-2'
                                        />
                                        <label className='input-label'>Count towards total hours</label>
                                    </div>
                                    <div>
                                        <label className='input-label'>Overtime Multiplier</label>
                                        <input
                                            type='number'
                                            value={newCompany.parameters.lateStay.overtimeMultiplier}
                                            onChange={(e) => handleParameterChange('lateStay', 'overtimeMultiplier', parseFloat(e.target.value))}
                                            className='time-input w-full'
                                            min='1'
                                            step='0.1'
                                        />
                                    </div>
                                </div>

                                <div className='bg-neutral-50 p-4 rounded-lg'>
                                    <h3 className='font-medium text-neutral-800 mb-2'>Time Calculation Summary</h3>
                                    <div className='space-y-2 text-sm text-neutral-600'>
                                        <p>• Early arrival allowance: {newCompany.parameters.earlyArrival.maxMinutes} minutes</p>
                                        <p>
                                            • Early arrival counts towards total:{' '}
                                            {newCompany.parameters.earlyArrival.countTowardsTotal ? 'Yes' : 'No'}
                                        </p>
                                        <p>• Late stay allowance: {newCompany.parameters.lateStay.maxMinutes} minutes</p>
                                        <p>• Late stay counts towards total: {newCompany.parameters.lateStay.countTowardsTotal ? 'Yes' : 'No'}</p>
                                        <p>• Overtime multiplier: {newCompany.parameters.lateStay.overtimeMultiplier}x</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Companies;
