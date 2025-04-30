import React, { FC, Fragment } from 'react';
import TableRow from '../../components/table/tableRow';
import TableCell from '../../components/table/tableCell';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { FiClock } from 'react-icons/fi';
import { ShiftTiming } from './Shift.types';

interface Props {
    id: string;
    index: number;
    shift: ShiftTiming;
    onEdit: () => void;
    onDelete: () => void;
}
const ShiftRow: FC<Props> = ({ id, index, shift, onEdit, onDelete }) => {
    const formatTime = (time: string) => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateDuration = (start: string, end: string): string => {
        const startDate = new Date(`2000-01-01T${start}`);
        const endDate = new Date(`2000-01-01T${end}`);
        let diff = endDate.getTime() - startDate.getTime();

        // Handle overnight shifts
        if (diff < 0) {
            diff += 24 * 60 * 60 * 1000;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    };

    return (
        <Fragment key={id}>
            <TableRow>
                <TableCell>{index}</TableCell>
                <TableCell>
                    <div className='flex items-center'>
                        <FiClock className='mr-2 text-primary-500' />
                        {shift.name}
                    </div>
                </TableCell>
                <TableCell>
                    <div className='text-sm'>
                        <div>
                            {formatTime(shift.start)} - {formatTime(shift.end)}
                        </div>
                        <div className='text-neutral-500 text-xs'>Duration: {calculateDuration(shift.start, shift.end)}</div>
                    </div>
                </TableCell>
                <TableCell>
                    <div className='text-sm'>
                        <div>
                            {formatTime(shift.lunchBreak.defaultStart)} ({shift.lunchBreak.duration}min)
                        </div>
                        <div className='text-neutral-500 text-xs'>
                            Flex: {formatTime(shift.lunchBreak.flexWindowStart)} - {formatTime(shift.lunchBreak.flexWindowEnd)}
                        </div>
                    </div>
                </TableCell>
                <TableCell>
                    <div className='text-sm'>
                        <div>
                            Early: {shift.earlyArrival.maxMinutes}min {shift.earlyArrival.countTowardsTotal ? '(counted)' : ''}
                        </div>
                        <div>
                            Late: {shift.lateStay.maxMinutes}min ({shift.lateStay.overtimeMultiplier}x)
                        </div>
                    </div>
                </TableCell>
                <TableCell>
                    <div className='flex space-x-2'>
                        <FaEye onClick={() => {}} className='text-primary size-[22px] cursor-pointer' />
                        <FaEdit onClick={onEdit} className='text-success size-[22px] cursor-pointer' />
                        <FaTrash onClick={onDelete} className='text-accent size-[22px] cursor-pointer' />
                    </div>
                </TableCell>
            </TableRow>
        </Fragment>
    );
};

export default ShiftRow;
