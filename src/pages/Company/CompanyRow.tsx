import React from 'react';
import TableRow from '../../components/table/tableRow';
import TableCell from '../../components/table/tableCell';
import { useNavigate } from 'react-router-dom';
import { Company } from '../../shared/types';
import { FiTrash2 } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';

interface Props {
    company: Company;
    onEdit: () => void;
    onDelete: () => void;
}

const CompanyRow: React.FC<Props> = ({ company, onEdit, onDelete }) => {
    const navigate = useNavigate();

    return (
        <TableRow>
            <TableCell>
                <div className='text-sm font-medium text-neutral-900 cursor-pointer' onClick={() => navigate(`/companies/${company.id}`)}>
                    {company.name}
                </div>
            </TableCell>
            <TableCell>
                <div className='text-sm text-neutral-500'>{new Date(company.createdAt).toLocaleDateString()}</div>
            </TableCell>
            <TableCell>
                <div className='text-sm text-neutral-500'>{new Date(company.updatedAt).toLocaleDateString()}</div>
            </TableCell>
            <TableCell>
                <button className={`btn btn-sm btn-secondary`} onClick={() => navigate(`/companies/${company.id}`)}>
                    <RiEdit2Line /> Manage Shifts
                </button>
            </TableCell>
            <TableCell>
                <div className='flex justify-center space-x-2'>
                    <button className='text-primary-600 hover:text-primary-800' onClick={onEdit}>
                        <RiEdit2Line />
                    </button>
                    <button className='text-error-600 hover:text-error-800' onClick={onDelete}>
                        <FiTrash2 />
                    </button>
                </div>
            </TableCell>
        </TableRow>
    );
};

export default CompanyRow;
