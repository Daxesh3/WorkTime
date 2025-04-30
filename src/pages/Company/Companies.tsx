import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';

import useCompanyStore from '../../store/companyStore';
import { Company } from '../../shared/types';
import AddEditCompanyModal from './AddEditCompanyModal';

import TableHeader, { ITableCell } from '../../components/table/tableHeader';
import TableComponent from '../../components/table/table';
import TableBody from '../../components/table/tableBody';
import CompanyRow from './CompanyRow';
import TitleText from '../../components/ui/header';

const Companies: React.FC = () => {
    const { companies, addCompany, updateCompany, deleteCompany, setCurrentCompany, currentCompanyId } = useCompanyStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);

    const handleSave = (company: { name: string; parameters: Company['parameters'] }) => {
        if (editingCompany) {
            updateCompany(editingCompany.id, { ...editingCompany, ...company });
        } else {
            addCompany({ ...company });
        }
    };

    const openAddModal = () => {
        setEditingCompany(null);
        setIsModalOpen(true);
    };

    const openEditModal = (company: Company) => {
        setEditingCompany(company);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className='space-y-6 py-4'>
                <TitleText
                    title='Companies'
                    subtitle='Manage your companies and their working time parameters'
                    buttons={
                        <button className='btn btn-primary' onClick={openAddModal}>
                            <FaPlus /> Add Company
                        </button>
                    }
                />

                {companies.length > 0 ? (
                    <TableComponent className='overflow-x-auto'>
                        <TableHeader tableCellList={CompanyTable_Cells} />
                        <TableBody>
                            {companies.map((company) => (
                                <CompanyRow
                                    key={company.id}
                                    company={company}
                                    currentCompanyId={currentCompanyId || ''}
                                    onSelect={() => setCurrentCompany(company.id)}
                                    onEdit={() => openEditModal(company)}
                                    onDelete={() => deleteCompany(company.id)}
                                />
                            ))}
                        </TableBody>
                    </TableComponent>
                ) : (
                    <div className='text-center py-8'>
                        <div className='text-neutral-400 mb-2'>No companies added yet</div>
                        <button className='btn btn-primary mx-auto' onClick={openAddModal}>
                            <FaPlus className='mr-1' /> Add First Company
                        </button>
                    </div>
                )}
            </div>
            {isModalOpen && (
                <AddEditCompanyModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={editingCompany ? { name: editingCompany.name, parameters: editingCompany.parameters } : undefined}
                />
            )}
        </>
    );
};
const CompanyTable_Cells: ITableCell[] = [
    { title: 'Company Name', key: 'name' },
    { title: 'Created', key: 'created' },
    { title: 'Last Updated', key: 'updated' },
    { title: 'Actions', key: 'actions', style: { width: '160px' } },
];

export default Companies;
