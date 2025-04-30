import React from 'react';
import TableRow from '../../components/table/tableRow';
import TableCell from '../../components/table/tableCell';
import { useNavigate } from 'react-router-dom';
import { Company } from '../../shared/types';
import { FiTrash2 } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';

interface Props {
    company: Company;
    currentCompanyId: string;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const CompanyRow: React.FC<Props> = ({ company, currentCompanyId, onSelect, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const isSelected = company.id === currentCompanyId;

    return (
        <TableRow className={isSelected ? 'bg-primary-50' : ''}>
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
                <div className='flex justify-center space-x-2'>
                    <button className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`} onClick={onSelect}>
                        {isSelected ? 'Selected' : 'Select'}
                    </button>
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
