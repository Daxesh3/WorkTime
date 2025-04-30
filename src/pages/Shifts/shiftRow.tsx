import { FC, Fragment } from 'react';
import TableRow from '../../components/table/tableRow';
import TableCell from '../../components/table/tableCell';
import { FiClock, FiTrash2 } from 'react-icons/fi';
import { ShiftTiming } from './Shift.types';
import { RiEdit2Line } from 'react-icons/ri';

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
                        <FiClock className='mr-1 text-primary-500' />
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
                    <div className='flex justify-center space-x-2'>
                        <RiEdit2Line onClick={onEdit} className='text-primary-600 hover:text-primary-800 cursor-pointer' />
                        <FiTrash2 onClick={onDelete} className='text-error-600 hover:text-error-800 cursor-pointer' />
                    </div>
                </TableCell>
            </TableRow>
        </Fragment>
    );
};

export default ShiftRow;
