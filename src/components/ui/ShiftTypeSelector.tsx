import React, { FC } from 'react';
import useCompanyStore from '../../store/companyStore';

export type ShiftType = 'morning' | 'evening' | 'night' | 'regular' | 'hourly' | 'piecework';

interface ShiftTypeSelectorProps {
    value: ShiftType;
    onChange: (value: ShiftType) => void;
    className?: string;
    disabled?: boolean;
    label?: string;
    company?: string;
}

const shiftOptions: { value: ShiftType; label: string }[] = [
    { value: 'regular', label: 'Regular Shift' },
    { value: 'morning', label: 'Morning Shift' },
    { value: 'evening', label: 'Evening Shift' },
    { value: 'night', label: 'Night Shift' },
    { value: 'hourly', label: 'Hourly Work' },
    { value: 'piecework', label: 'Piecework Work' },
];

const ShiftTypeSelector: FC<ShiftTypeSelectorProps> = ({ value, onChange, className = '', disabled = false, label = 'Shift Type', company }) => {
    const { companies } = useCompanyStore();

    const filteredShiftOptions = React.useMemo(() => {
        if (company) {
            const companyData = companies.find((c) => c.name === company);
            const companyShiftNames = companyData?.shifts.map((s) => s.name) || [];
            return shiftOptions.filter((option) => companyShiftNames.includes(option.value));
        }
        return shiftOptions;
    }, [company, companies]);

    return (
        <div className='flex flex-col'>
            {label && <label className='input-label'>{label}</label>}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as ShiftType)}
                disabled={disabled}
                className={`time-input h-full bg-white w-full ${className}`}
            >
                {filteredShiftOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ShiftTypeSelector;
