import React, { useMemo } from 'react';
import Shift from '../Shifts/Shift';
import useCompanyStore from '../../store/companyStore';
import { useParams } from 'react-router-dom';
import { ShiftTiming } from '../Shifts/Shift.types';

const CompanyDetails: React.FC = () => {
    const { companyId } = useParams<{ companyId: string }>();
    const { companies, updateCompany } = useCompanyStore();

    const currentCompany = useMemo(() => companies.find((c) => c.id === companyId), [companyId, companies]) || null;

    if (!currentCompany || !companyId) {
        return <div>Company not found</div>;
    }

    const handleShiftCreate = async (shift: ShiftTiming) => {
        // Implement shift creation logic
        const updatedShifts = [...currentCompany.shifts, { ...shift, id: Date.now().toString() }];
        await updateCompany(companyId, { ...currentCompany, shifts: updatedShifts });
    };

    const handleShiftDelete = async (shiftId: string) => {
        // Implement shift deletion logic
        const updatedShifts = currentCompany.shifts.filter((s) => s.id !== shiftId);
        await updateCompany(companyId, { ...currentCompany, shifts: updatedShifts });
    };

    const handleShiftUpdate = async (updatedShift: ShiftTiming) => {
        // Implement shift update logic
        const updatedShifts = currentCompany.shifts.map((s) => (s.id === updatedShift.id ? updatedShift : s));
        await updateCompany(companyId, { ...currentCompany, shifts: updatedShifts });
    };

    return (
        <Shift
            companyName={currentCompany.name}
            shifts={currentCompany.shifts}
            onShiftCreate={handleShiftCreate}
            onShiftDelete={handleShiftDelete}
            onShiftUpdate={handleShiftUpdate}
        />
    );
};

export default CompanyDetails;
