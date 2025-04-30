import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaClock, FaExclamationCircle } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import useCompanyStore from '../../store/companyStore';
import TimePicker from '../../components/ui/TimePicker';
import { Company } from '../../shared/types';
import AddEditCompanyModal from './AddEditCompanyModal';
import { useNavigate } from 'react-router-dom';

// Interfaces for company parameters

const Companies: React.FC = () => {
    const { companies, addCompany, updateCompany, deleteCompany, setCurrentCompany, currentCompanyId } = useCompanyStore();
    const navigate = useNavigate();
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
                <div className='animate-fade-in-down animate-duration-300'>
                    <h1 className='text-2xl font-semibold text-neutral-800'>Companies</h1>
                    <p className='text-neutral-500 mt-1'>Manage your companies and their working time parameters</p>
                </div>

                <Card
                    title='Companies List'
                    className='animate-fade-in'
                    actionButton={
                        <button className='btn btn-primary' onClick={openAddModal}>
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
                                    {companies.map((company: Company) => (
                                        <tr
                                            key={company.id}
                                            className={`hover:bg-neutral-50 ${company.id === currentCompanyId ? 'bg-primary-50' : ''}`}
                                        >
                                            <td className='py-4 whitespace-nowrap'>
                                                <div
                                                    className='text-sm font-medium text-neutral-900'
                                                    onClick={() => navigate(`/companies/${company.id}`)}
                                                >
                                                    {company.name}
                                                </div>
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
                                                        onClick={() => openEditModal(company)}
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
                            <button className='btn btn-primary mx-auto' onClick={openAddModal}>
                                <FaPlus className='mr-1' /> Add First Company
                            </button>
                        </div>
                    )}
                </Card>
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

export default Companies;
