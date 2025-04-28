import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCompanyStore = create(
    persist(
        (set, get) => ({
            companies: [],
            currentCompanyId: null,

            // Add a new company
            addCompany: (company) => {
                const newCompany = {
                    id: Date.now().toString(),
                    name: company.name,
                    parameters: company.parameters,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
                set(state => ({
                    companies: [...state.companies, newCompany],
                    currentCompanyId: newCompany.id
                }))
            },

            // Update an existing company
            updateCompany: (id, updates) => {
                set(state => ({
                    companies: state.companies.map(company =>
                        company.id === id ? {
                            ...company,
                            ...updates,
                            updatedAt: new Date().toISOString()
                        } : company
                    )
                }))
            },

            // Delete a company
            deleteCompany: (id) => {
                set(state => {
                    const newCompanies = state.companies.filter(company => company.id !== id)
                    return {
                        companies: newCompanies,
                        currentCompanyId: newCompanies.length > 0 ? newCompanies[0].id : null
                    }
                })
            },

            // Set current company
            setCurrentCompany: (id) => {
                set({ currentCompanyId: id })
            },

            // Get current company
            getCurrentCompany: () => {
                const { companies, currentCompanyId } = get()
                return companies.find(company => company.id === currentCompanyId)
            },

            // Get current company parameters
            getCurrentParameters: () => {
                const currentCompany = get().getCurrentCompany()
                return currentCompany?.parameters || null
            }
        }),
        {
            name: 'company-storage'
        }
    )
)

export default useCompanyStore 