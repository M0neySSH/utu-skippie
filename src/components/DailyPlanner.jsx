import React, { useState, useEffect } from 'react';
import { useTimetable } from '../hooks/useTimetable';
import { useCalendar } from '../hooks/useCalendar';

export default function DailyPlanner({ results }) {
    const { timetable } = useTimetable();
    const { events: holidays } = useCalendar();
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Default to today if it's a weekday, otherwise Monday
    const todayDate = new Date();
    const todayIndex = todayDate.getDay() - 1;
    const initialDay = (todayIndex >= 0 && todayIndex < 6) ? days[todayIndex] : "Monday";

    const [selectedDay, setSelectedDay] = useState(initialDay);

    // Store checklist state: { "09:00": true, "10:00": false, ... }
    // true = attended (default for scheduled classes), false = bunked
    const [checklist, setChecklist] = useState({});
    const [holidayToday, setHolidayToday] = useState(null);

    // Determine if today is an official holiday based on fetched calendar
    useEffect(() => {
        if (holidays && holidays.length > 0) {
            const todayStr = `${String(todayDate.getDate()).padStart(2, '0')}/${String(todayDate.getMonth() + 1).padStart(2, '0')}/${todayDate.getFullYear()}`;
            const foundHoliday = holidays.find(ev => ev.FromDate === todayStr);
            if (foundHoliday) {
                setHolidayToday(foundHoliday);
            }
        }
    }, [holidays]);

    // Reset checklist when day changes or when holiday array loads
    useEffect(() => {
        const defaultChecklist = {};
        if (timetable[selectedDay]) {
            Object.keys(timetable[selectedDay]).forEach(time => {
                const subject = timetable[selectedDay][time];
                if (subject && subject.trim() !== '') {
                    // Default to True (attending), but if it's today and today is a holiday, default to false
                    if (selectedDay === initialDay && holidayToday) {
                        defaultChecklist[time] = false;
                    } else {
                        defaultChecklist[time] = true;
                    }
                }
            });
        }
        setChecklist(defaultChecklist);
    }, [selectedDay, timetable, initialDay, holidayToday]);

    const handleToggle = (time) => {
        setChecklist(prev => ({
            ...prev,
            [time]: !prev[time]
        }));
    };

    if (!results) {
        return (
            <div className="glass-card mt-2 mb-2 text-center">
                <h3>Daily Simulator</h3>
                <p className="p-warning" style={{ marginTop: '1rem' }}>
                    Please go to the Dashboard and <strong>Fetch & Analyze</strong> your live attendance first, so we have a baseline to simulate from!
                </p>
            </div>
        );
    }

    const { total_conducted, total_attended, percentage: currentPercentage } = results;

    // Calculate simulated totals
    let simulatedConducted = total_conducted;
    let simulatedAttended = total_attended;

    const scheduledClasses = Object.keys(checklist);

    scheduledClasses.forEach(time => {
        simulatedConducted++; // Every scheduled class happens today
        if (checklist[time]) {
            simulatedAttended++; // You only get attended credit if checked
        }
    });

    const simulatedPercentage = simulatedConducted > 0
        ? ((simulatedAttended / simulatedConducted) * 100).toFixed(2)
        : currentPercentage.toFixed(2);

    const isSafe = simulatedPercentage >= 75;
    const diff = (simulatedPercentage - currentPercentage).toFixed(2);
    const diffColor = diff > 0 ? 'var(--secondary)' : (diff < 0 ? 'var(--danger)' : 'var(--text-muted)');

    return (
        <div className="glass-card mt-2 mb-2">
            <h2>📅 Daily Simulator</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                Select a day to load your scheduled classes. Uncheck classes you plan to bunk today to see the real-time impact on your overall attendance by tonight!
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ marginRight: '1rem' }}>Select Day:</label>
                <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    style={{ width: 'auto', display: 'inline-block' }}
                >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            {selectedDay === initialDay && holidayToday && (
                <div className="status-safe mb-2 text-center" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'var(--secondary)' }}>
                    <h3 style={{ margin: 0, color: 'var(--secondary)' }}>🎉 YouTu Holiday!</h3>
                    <p style={{ margin: '0.5rem 0 0' }}>Today is officially <strong>{holidayToday.Title} ({holidayToday.SubjectH})</strong>. Your classes have defaulted to being unchecked (bunked) to protect you!</p>
                </div>
            )}

            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{currentPercentage.toFixed(2)}%</div>
                    <div className="stat-label">Current Overall</div>
                </div>
                <div className="stat-card" style={{ borderColor: isSafe ? 'var(--secondary)' : 'var(--danger)' }}>
                    <div className="stat-value" style={{ fontSize: '1.5rem', color: isSafe ? 'var(--secondary)' : 'var(--danger)' }}>
                        {simulatedPercentage}%
                    </div>
                    <div className="stat-label">
                        Tonight's Projection
                        <span style={{ color: diffColor, marginLeft: '0.5rem', fontWeight: 'bold' }}>
                            ({diff > 0 ? '+' : ''}{diff}%)
                        </span>
                    </div>
                </div>
            </div>

            {scheduledClasses.length === 0 ? (
                <p className="p-warning text-center" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
                    No classes scheduled for {selectedDay}. Enjoy your day off! 🏖️
                </p>
            ) : (
                <div className="checklist-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                        {selectedDay}'s Classes
                    </h3>

                    {scheduledClasses.map(time => {
                        const subject = timetable[selectedDay][time];
                        const attending = checklist[time];

                        return (
                            <label
                                key={time}
                                className="pref-label"
                                style={{
                                    background: attending ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    border: `1px solid ${attending ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={attending}
                                    onChange={() => handleToggle(time)}
                                    style={{ width: '1.5rem', height: '1.5rem' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{time}</div>
                                    <div style={{ color: 'var(--text-muted)' }}>{subject}</div>
                                </div>
                                <div style={{ fontWeight: 'bold', color: attending ? 'var(--secondary)' : 'var(--danger)' }}>
                                    {attending ? 'Attending ✅' : 'Bunking ❌'}
                                </div>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
