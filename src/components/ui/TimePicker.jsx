import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const TimePicker = ({
    value,
    onChange,
    label,
    className = '',
    minTime = '00:00',
    maxTime = '23:59',
    step = 15, // in minutes
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const wrapperRef = useRef(null);

    // Update input value when prop changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Generate time options in intervals based on step
    const generateTimeOptions = () => {
        const options = [];
        const [minHour, minMinute] = minTime.split(':').map(Number);
        const [maxHour, maxMinute] = maxTime.split(':').map(Number);

        const minTotalMinutes = minHour * 60 + minMinute;
        const maxTotalMinutes = maxHour * 60 + maxMinute;

        for (let mins = minTotalMinutes; mins <= maxTotalMinutes; mins += step) {
            const hours = Math.floor(mins / 60);
            const minutes = mins % 60;
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

            options.push(timeString);
        }

        return options;
    };

    const timeOptions = generateTimeOptions();

    // Handle direct input change
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Allow partial input while typing
        if (newValue.length <= 5) {
            // Basic validation for time format
            if (/^([0-1]?[0-9]|2[0-3]):?[0-5]?[0-9]?$/.test(newValue)) {
                // Auto-format when user types a complete time
                if (newValue.length === 5 && newValue.includes(':')) {
                    onChange(newValue);
                }
            }
        }
    };

    // Handle input blur
    const handleBlur = () => {
        // Format the time when input loses focus
        if (inputValue) {
            const [hours, minutes] = inputValue.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
                const formattedHours = Math.min(23, Math.max(0, hours)).toString().padStart(2, '0');
                const formattedMinutes = Math.min(59, Math.max(0, minutes)).toString().padStart(2, '0');
                const formattedTime = `${formattedHours}:${formattedMinutes}`;
                setInputValue(formattedTime);
                onChange(formattedTime);
            }
        }
    };

    // Handle selection from dropdown
    const handleSelectTime = (time) => {
        setInputValue(time);
        onChange(time);
        setIsOpen(false);
    };

    return (
        <div className='relative' ref={wrapperRef}>
            {label && <label className='input-label'>{label}</label>}

            <div className={`relative flex items-center ${disabled ? 'opacity-60' : ''}`} onClick={() => !disabled && setIsOpen(!isOpen)}>
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

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className='absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-neutral-200 max-h-60 overflow-y-auto'
                    >
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TimePicker;
