// TimePicker Component

import React, { FC, useState, useRef, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

export interface TimePickerProps {
    value: string;
    onChange: (time: string) => void;
    label?: string;
    className?: string;
    step?: number; // in minutes
    disabled?: boolean;
}

const TimePicker: FC<TimePickerProps> = ({ value, onChange, label, className = '', disabled = false }) => {
    const [inputValue, setInputValue] = useState<string>(value);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync internal input with prop
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Handle typing in input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        if (newValue.length <= 5 && /^([0-1]?[0-9]|2[0-3]):?[0-5]?[0-9]?$/.test(newValue)) {
            if (newValue.length === 5 && newValue.includes(':')) {
                onChange(newValue);
            }
        }
    };

    // Format on blur
    const handleBlur = () => {
        if (inputValue) {
            const [hStr, mStr] = inputValue.split(':');
            const hours = Number(hStr);
            const minutes = Number(mStr);
            if (!isNaN(hours) && !isNaN(minutes)) {
                const hh = Math.min(23, Math.max(0, hours)).toString().padStart(2, '0');
                const mm = Math.min(59, Math.max(0, minutes)).toString().padStart(2, '0');
                const formatted = `${hh}:${mm}`;
                setInputValue(formatted);
                onChange(formatted);
            }
        }
    };

    return (
        <div className='relative' ref={wrapperRef}>
            {label && <label className='input-label'>{label}</label>}

            <div className={`relative flex items-center ${disabled ? 'opacity-60' : ''}`}>
                <input
                    type='text'
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`time-input pr-10 ${className}`}
                    placeholder='HH:MM'
                    disabled={disabled}
                />
                <div className='absolute right-2 text-neutral-500'>
                    <FiClock />
                </div>
            </div>
        </div>
    );
};

export default TimePicker;
