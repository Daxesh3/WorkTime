import { addMinutes, format } from 'date-fns';

export function timeToMinutes(timeStr: string) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

export function minutesToHHmm(totalMinutes: number) {
    const date = addMinutes(new Date(0), totalMinutes);
    return format(date, 'HH:mm');
}

export function adjustForOvernight(startMin: number, endMin: number) {
    return endMin < startMin ? endMin + 1440 : endMin; // add 24 hours in minutes
}

export function formatDurationManually(totalMinutes: number) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
