import React, { FC } from 'react';

export type ShiftType = 'morning' | 'evening' | 'night' | 'regular';

interface ShiftTypeSelectorProps {
    value: ShiftType;
    onChange: (value: ShiftType) => void;
    className?: string;
    disabled?: boolean;
    label?: string;
}

const shiftOptions: { value: ShiftType; label: string }[] = [
    { value: 'regular', label: 'Regular Shift' },
    { value: 'morning', label: 'Morning Shift' },
    { value: 'evening', label: 'Evening Shift' },
    { value: 'night', label: 'Night Shift' },
];

const ShiftTypeSelector: FC<ShiftTypeSelectorProps> = ({ value, onChange, className = '', disabled = false, label = 'Shift Type' }) => {
    return (
        <div className='flex flex-col'>
            {label && <label className='input-label'>{label}</label>}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as ShiftType)}
                disabled={disabled}
                className={`time-input w-full ${className}`}
            >
                {shiftOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ShiftTypeSelector;
