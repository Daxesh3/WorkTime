import React, { useMemo, useState } from 'react';
import { FiUsers } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import Card from '../../components/ui/Card';
import useWorkTimeStore from '../../store/workTimeStore';
import AddEditEmployee from './AddEditEmployee';
import TableHeader, { ITableCell } from '../../components/table/tableHeader';
import TableComponent from '../../components/table/table';
import TableBody from '../../components/table/tableBody';
import EmployeeRow from './EmployeeRow';
import TitleText from '../../components/ui/header';

const EmployeeSchedule: React.FC = () => {
    const { employeeRecords, deleteEmployeeRecord } = useWorkTimeStore();

    const [isAddingRecord, setIsAddingRecord] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Get records for the selected date
    const filteredRecords = useMemo(
        () => employeeRecords.filter((record) => record.date === format(selectedDate, 'yyyy-MM-dd')),
        [employeeRecords, selectedDate]
    );

    return (
        <>
            <div className='space-y-3 py-4'>
                <TitleText
                    title='Employee Schedule'
                    subtitle='View and manage daily working time records'
                    buttons={
                        <button
                            className='btn btn-primary'
                            onClick={() => {
                                setIsAddingRecord(true);
                                setEditingId(null);
                            }}
                        >
                            <FaPlus /> Add Record
                        </button>
                    }
                />
                <div>
                    <label className='input-label'>Select Date</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date) => setSelectedDate(date)}
                        dateFormat='MMM d, yyyy'
                        className='time-input w-48'
                    />
                </div>

                {filteredRecords.length > 0 ? (
                    <TableComponent className='overflow-x-auto'>
                        <TableHeader tableCellList={TimeRecordTable_Cells} />
                        <TableBody>
                            {filteredRecords.length > 0 &&
                                filteredRecords.map((record, index) => (
                                    <EmployeeRow
                                        key={record.id}
                                        record={record}
                                        index={index + 1}
                                        onEdit={() => setEditingId(record.id)}
                                        onDelete={() => deleteEmployeeRecord(record.id)}
                                    />
                                ))}
                        </TableBody>
                    </TableComponent>
                ) : (
                    <Card title='No Records Found' icon={<FiUsers size={20} />} className='animate-fade-in'>
                        <div className='text-center py-8'>
                            <div className='text-neutral-400 mb-2'>No records found for this date</div>
                            <button
                                className='btn btn-primary mx-auto'
                                onClick={() => {
                                    setIsAddingRecord(true);
                                }}
                            >
                                <FaPlus /> Add First Record
                            </button>
                        </div>
                    </Card>
                )}
            </div>
            {(isAddingRecord || editingId) && (
                <AddEditEmployee
                    isOpen={isAddingRecord || !!editingId}
                    editingId={editingId}
                    isAddingRecord={isAddingRecord}
                    onClose={() => {
                        setIsAddingRecord(false);
                        setEditingId(null);
                    }}
                />
            )}
        </>
    );
};

const TimeRecordTable_Cells: ITableCell[] = [
    { title: 'Employee', key: 'employee' },
    { title: 'Clock In/Out', key: 'clock_in_out' },
    { title: 'Lunch Break', key: 'lunch_break' },
    { title: 'Other Breaks', key: 'other_breaks' },
    { title: 'Hours', key: 'hours' },
    { title: 'Actions', key: 'actions', style: { width: '120px' } },
];

export default EmployeeSchedule;
