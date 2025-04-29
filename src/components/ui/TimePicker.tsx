// TimePicker Component

import React, { FC, useState, useRef, useEffect } from 'react';
import { FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export interface TimePickerProps {
    value: string;
    onChange: (time: string) => void;
    label?: string;
    className?: string;
    minTime?: string;
    maxTime?: string;
    step?: number; // in minutes
    disabled?: boolean;
}

const TimePicker: FC<TimePickerProps> = ({
    value,
    onChange,
    label,
    className = '',
    minTime = '00:00',
    maxTime = '23:59',
    step = 15,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>(value);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync internal input with prop
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Generate selectable times
    const generateTimeOptions = (): string[] => {
        const options: string[] = [];
        const [minH, minM] = minTime.split(':').map(Number);
        const [maxH, maxM] = maxTime.split(':').map(Number);
        const start = minH * 60 + minM;
        const end = maxH * 60 + maxM;

        for (let mins = start; mins <= end; mins += step) {
            const h = Math.floor(mins / 60)
                .toString()
                .padStart(2, '0');
            const m = (mins % 60).toString().padStart(2, '0');
            options.push(`${h}:${m}`);
        }
        return options;
    };

    const timeOptions = generateTimeOptions();

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

    // Pick from dropdown
    const handleSelectTime = (time: string) => {
        setInputValue(time);
        onChange(time);
        setIsOpen(false);
    };

    return (
        <div className='relative' ref={wrapperRef}>
            {label && <label className='input-label'>{label}</label>}

            <div className={`relative flex items-center ${disabled ? 'opacity-60' : ''}`} onClick={() => !disabled && setIsOpen((o) => !o)}>
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

            {isOpen && (
                <div className='animate-fade-in-down animate-duration-300 absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-neutral-200 max-h-60 overflow-y-auto'>
                    <div className='py-1'>
                        {timeOptions.map((time) => (
                            <div
                                key={time}
                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-primary-50 ${
                                    time === value ? 'bg-primary-100 text-primary-800 font-medium' : 'text-neutral-700'
                                }`}
                                onClick={() => handleSelectTime(time)}
                            >
                                {time}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePicker;
