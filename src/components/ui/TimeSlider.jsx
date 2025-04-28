import React from 'react';
import { useState, useEffect, useRef } from 'react';

const TimeSlider = ({ startTime, endTime, value, onChange, step = 15, markers = [], label }) => {
    const sliderRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startValue, endValue] = value;

    // Convert time string (HH:MM) to minutes since midnight
    const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // Convert minutes since midnight to time string (HH:MM)
    const minutesToTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const totalMinutes = endMinutes - startMinutes;

    // Convert value to percentage position
    const getPosition = (timeValue) => {
        const minutes = timeToMinutes(timeValue);
        return ((minutes - startMinutes) / totalMinutes) * 100;
    };

    // Calculate start and end positions as percentages
    const startPos = getPosition(startValue);
    const endPos = getPosition(endValue);

    // Handle dragging of handles
    const handleMouseDown = (isStartHandle) => (e) => {
        e.preventDefault();
        setIsDragging({ isStartHandle });

        const handleMouseMove = (moveEvent) => {
            if (!sliderRef.current) return;

            const rect = sliderRef.current.getBoundingClientRect();
            const pos = (moveEvent.clientX - rect.left) / rect.width;

            // Constrain position between 0 and 1
            const clampedPos = Math.max(0, Math.min(1, pos));

            // Convert position to minutes
            const minutes = Math.round((clampedPos * totalMinutes + startMinutes) / step) * step;

            // Make sure minutes is within range
            const clampedMinutes = Math.max(startMinutes, Math.min(endMinutes, minutes));

            // Convert back to time
            const newTime = minutesToTime(clampedMinutes);

            // Update the appropriate handle
            if (isStartHandle) {
                // Ensure start handle doesn't move past end handle
                if (clampedMinutes < timeToMinutes(endValue)) {
                    onChange([newTime, endValue]);
                }
            } else {
                // Ensure end handle doesn't move before start handle
                if (clampedMinutes > timeToMinutes(startValue)) {
                    onChange([startValue, newTime]);
                }
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Generate time markers
    const timeMarkers = [];
    for (let min = startMinutes; min <= endMinutes; min += step * 2) {
        timeMarkers.push({
            time: minutesToTime(min),
            position: ((min - startMinutes) / totalMinutes) * 100,
        });
    }

    return (
        <div className='mb-8'>
            {label && <label className='input-label'>{label}</label>}
            <div className='time-slider' ref={sliderRef}>
                {/* Track */}
                <div className='time-slider-track'></div>

                {/* Filled range */}
                <div className='time-slider-range' style={{ left: `${startPos}%`, right: `${100 - endPos}%` }}></div>

                {/* Time markers */}
                {timeMarkers.map((marker, i) => (
                    <div key={i} className='time-marker' style={{ left: `${marker.position}%` }}>
                        |<div className='time-marker-label'>{marker.time}</div>
                    </div>
                ))}

                {/* Special markers */}
                {markers.map((marker, i) => (
                    <div
                        key={`custom-${i}`}
                        className='absolute w-1 h-4 bg-warning-500 rounded-full'
                        style={{
                            left: `${getPosition(marker.time)}%`,
                            top: '12px',
                            zIndex: 1,
                        }}
                        title={marker.label}
                    ></div>
                ))}

                {/* Start handle */}
                <div
                    className='time-slider-handle animate-fade-in-down animate-duration-300'
                    style={{ left: `${startPos}%` }}
                    onMouseDown={handleMouseDown(true)}
                    whileTap={{ scale: 1.1 }}
                    whileHover={{ scale: 1.05 }}
                    animate={{ y: isDragging?.isStartHandle ? -2 : 0 }}
                >
                    <div className='absolute -mt-7 -ml-4 bg-primary-100 px-2 py-0.5 rounded text-xs font-medium text-primary-700'>{startValue}</div>
                </div>

                {/* End handle */}
                <div
                    className='time-slider-handle animate-fade-in-down animate-duration-300'
                    style={{ left: `${endPos}%` }}
                    onMouseDown={handleMouseDown(false)}
                    whileTap={{ scale: 1.1 }}
                    whileHover={{ scale: 1.05 }}
                    animate={{ y: isDragging && !isDragging.isStartHandle ? -2 : 0 }}
                >
                    <div className='absolute -mt-7 -ml-4 bg-primary-100 px-2 py-0.5 rounded text-xs font-medium text-primary-700'>{endValue}</div>
                </div>
            </div>
        </div>
    );
};

export default TimeSlider;
