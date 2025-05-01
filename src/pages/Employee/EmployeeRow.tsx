import React from 'react';
import TableRow from '../../components/table/tableRow';
import TableCell from '../../components/table/tableCell';
import { FiTrash2 } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';
import { FaCalculator } from 'react-icons/fa';

import { EmployeeRecord } from '../../shared/types';
import { useNavigate } from 'react-router-dom';
import { ShiftTiming } from '../Shifts/Shift.types';

interface Props {
    record: EmployeeRecord;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
}

const getTimeStatusClass = (time: string, reference: string, isStart: boolean) => {
    if (time === reference) return 'text-neutral-800';
    if (isStart ? time < reference : time > reference) return 'text-success-600';
    return 'text-error-500';
};

const EmployeeRow: React.FC<Props> = ({ record, onEdit, onDelete }) => {
    const navigate = useNavigate();

    return (
        <TableRow>
            <TableCell>
                <div className='text-sm font-medium text-neutral-900'>{record.name}</div>
            </TableCell>
            <TableCell>
                <div className='flex flex-col text-sm'>
                    <span className={getTimeStatusClass(record.clockIn, record.shift.start, true)}>
                        In: {record.clockIn}
                        {record.clockIn !== record.shift.start && (
                            <span className='ml-1 text-xs'>({record.clockIn <= record.shift.start ? 'early' : 'late'})</span>
                        )}
                    </span>
                    <span className={getTimeStatusClass(record.clockOut, record.shift.end, false)}>
                        Out: {record.clockOut}
                        {record.clockOut !== record.shift.end && (
                            <span className='ml-1 text-xs'>({record.clockOut > record.shift.end ? 'overtime' : 'early'})</span>
                        )}
                    </span>
                </div>
            </TableCell>
            <TableCell>
                <div className='text-sm text-neutral-700'>
                    {record.lunchStart} - {record.lunchEnd}
                </div>
            </TableCell>
            <TableCell>
                {record.breaks.length > 0 ? (
                    <div className='text-sm text-neutral-700'>
                        {record.breaks.map((b, i) => (
                            <div key={i}>
                                {b.start} - {b.end}
                            </div>
                        ))}
                    </div>
                ) : (
                    <span className='text-sm text-neutral-400'>None</span>
                )}
            </TableCell>
            <TableCell>
                <div className='text-sm font-medium'>{record.calculatedHours.toFixed(2)} hrs</div>
            </TableCell>
            <TableCell>
                <div className='flex justify-center space-x-2'>
                    <button
                        className='text-primary-600 hover:text-primary-800'
                        onClick={() =>
                            navigate('/calculations', {
                                state: {
                                    record: {
                                        clockIn: record.clockIn,
                                        clockOut: record.clockOut,
                                        lunchStart: record.lunchStart,
                                        lunchEnd: record.lunchEnd,
                                        breaks: record.breaks,
                                        shift: record.shift,
                                    },
                                },
                            })
                        }
                        title='Calculate'
                    >
                        <FaCalculator />
                    </button>
                    <RiEdit2Line className='text-primary-600 hover:text-primary-800 cursor-pointer' onClick={onEdit} title='Edit' />
                    <FiTrash2 className='text-error-600 hover:text-error-800 cursor-pointer' onClick={onDelete} title='Delete' />
                </div>
            </TableCell>
        </TableRow>
    );
};

export default EmployeeRow;
