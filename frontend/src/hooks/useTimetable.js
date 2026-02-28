import { useState, useEffect } from 'react';

const defaultTimetable = {
    Monday: { "09:00": "", "10:00": "", "11:00": "", "12:00": "", "14:00": "", "15:00": "", "16:00": "" },
    Tuesday: { "09:00": "", "10:00": "", "11:00": "", "12:00": "", "14:00": "", "15:00": "", "16:00": "" },
    Wednesday: { "09:00": "", "10:00": "", "11:00": "", "12:00": "", "14:00": "", "15:00": "", "16:00": "" },
    Thursday: { "09:00": "", "10:00": "", "11:00": "", "12:00": "", "14:00": "", "15:00": "", "16:00": "" },
    Friday: { "09:00": "", "10:00": "", "11:00": "", "12:00": "", "14:00": "", "15:00": "", "16:00": "" },
    Saturday: { "09:00": "", "10:00": "", "11:00": "", "12:00": "", "14:00": "", "15:00": "", "16:00": "" },
};

export function useTimetable() {
    const [timetable, setTimetable] = useState(() => {
        const saved = localStorage.getItem('uktech_timetable');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (!parsed.Saturday) {
                    parsed.Saturday = { "09:00": "", "10:00": "", "11:00": "", "12:00": "", "14:00": "", "15:00": "", "16:00": "" };
                }
                return parsed;
            } catch (e) {
                console.error("Failed to parse timetable from localStorage", e);
            }
        }
        return defaultTimetable;
    });

    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem('uktech_bunk_pref');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse preferences from localStorage", e);
            }
        }
        return { skipMorning: false, skipAfternoon: false };
    });

    useEffect(() => {
        localStorage.setItem('uktech_timetable', JSON.stringify(timetable));
    }, [timetable]);

    useEffect(() => {
        localStorage.setItem('uktech_bunk_pref', JSON.stringify(preferences));
    }, [preferences]);

    const updateCell = (day, time, subject) => {
        setTimetable(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [time]: subject
            }
        }));
    };

    const updatePreference = (key, value) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const importTimetable = (newTimetable) => {
        setTimetable(newTimetable);
    };

    return { timetable, updateCell, preferences, updatePreference, importTimetable };
}
