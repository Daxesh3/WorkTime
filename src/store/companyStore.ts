import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Company, CompanyParameters } from '../shared/types'; // Assuming these types are defined in shared/types
import { defaultParameters } from '../pages/Company/AddEditCompanyModal';

// Define the store state and actions
interface CompanyStore {
    companies: Company[];
    currentCompanyId: string | null;
    addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateCompany: (id: string, updates: Partial<Company>) => void;
    deleteCompany: (id: string) => void;
    setCurrentCompany: (id: string) => void;
    getCurrentCompany: () => Company | undefined;
    getCurrentParameters: () => CompanyParameters;
}

const useCompanyStore = create<CompanyStore>()(
    persist(
        (set, get) => ({
            companies: [],
            currentCompanyId: null,

            // Add a new company
            addCompany: (company) => {
                const newCompany: Company = {
                    id: Date.now().toString(),
                    name: company.name,
                    parameters: company.parameters,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({
                    companies: [...state.companies, newCompany],
                    currentCompanyId: newCompany.id,
                }));
            },

            // Update an existing company
            updateCompany: (id, updates) => {
                set((state) => ({
                    companies: state.companies.map((company) =>
                        company.id === id
                            ? {
                                  ...company,
                                  ...updates,
                                  updatedAt: new Date(),
                              }
                            : company
                    ),
                }));
            },

            // Delete a company
            deleteCompany: (id) => {
                set((state) => {
                    const newCompanies = state.companies.filter((company) => company.id !== id);
                    return {
                        companies: newCompanies,
                        currentCompanyId: newCompanies.length > 0 ? newCompanies[0].id : null,
                    };
                });
            },

            // Set current company
            setCurrentCompany: (id) => {
                set({ currentCompanyId: id });
            },

            // Get current company
            getCurrentCompany: () => {
                const { companies, currentCompanyId } = get();
                return companies.find((company) => company.id === currentCompanyId);
            },

            // Get current company parameters
            getCurrentParameters: () => {
                const currentCompany = get().getCurrentCompany();
                return currentCompany?.parameters || defaultParameters;
            },
        }),
        {
            name: 'company-storage',
        }
    )
);

export default useCompanyStore;
