import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Company } from '../shared/types'; // Assuming these types are defined in shared/types
import { ShiftTiming } from '../pages/Shifts/Shift.types';

// Define the store state and actions
interface CompanyStore {
    companies: Company[];
    addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'shifts'>) => void;
    updateCompany: (id: string, updates: Partial<Company>) => void;
    deleteCompany: (id: string) => void;
    getCurrentCompany: (id: string) => Company | undefined;
    getCurrentParameters: (company: string, id: string) => ShiftTiming;
}

const useCompanyStore = create<CompanyStore>()(
    persist(
        (set, get) => ({
            companies: [],

            // Add a new company
            addCompany: (company) => {
                const newCompany: Company = {
                    id: Date.now().toString(),
                    name: company.name,
                    shifts: [],
                    parameters: company.parameters,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({
                    companies: [...state.companies, newCompany],
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
                    };
                });
            },

            // Get current company
            getCurrentCompany: (id) => {
                const { companies } = get();
                return companies.find((company) => company.name === id);
            },

            // Get current company parameters
            getCurrentParameters: (companyName, shiftId) => {
                const currentCompany = get().getCurrentCompany(companyName);
                const shifts = currentCompany?.shifts.find((s) => s.id === shiftId) || [];

                return shifts as ShiftTiming;
            },
        }),
        {
            name: 'company-storage',
        }
    )
);

export default useCompanyStore;
