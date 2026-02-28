import React, { useState, useEffect } from 'react';
import { useTimetable } from '../hooks/useTimetable';

export default function SmartBunking({ results, formData }) {
    const { timetable, preferences } = useTimetable();
    const { total_conducted, total_attended, percentage } = results;

    const [holidays, setHolidays] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/api/calendar')
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    setHolidays(data.data);
                }
            })
            .catch(console.error);
    }, []);

    if (!results) return null;

    const isSafe = percentage >= 75;
    const classesPerDay = parseFloat(formData.ClassesPerDay) || 0;

    // Calculate raw bunkable/required
    let bunkable = 0;
    let required = 0;

    if (isSafe) {
        bunkable = Math.floor((total_attended - 0.75 * total_conducted) / 0.75);
    } else {
        required = Math.ceil(3 * total_conducted - 4 * total_attended);
    }

    // Generate rolling dates starting from Today
    const today = new Date();
    // Start from today, unless it's Sunday, then start tomorrow (Monday)
    let startDate = new Date(today);
    if (startDate.getDay() === 0) {
        startDate.setDate(startDate.getDate() + 1);
    }

    const rollingDays = [];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Build next 6 valid working days
    let daysAdded = 0;
    let currDate = new Date(startDate);

    while (daysAdded < 6) {
        if (currDate.getDay() !== 0) { // Skip Sundays implicitly
            const dateStr = `${String(currDate.getDate()).padStart(2, '0')}/${String(currDate.getMonth() + 1).padStart(2, '0')}/${currDate.getFullYear()}`;

            // Check if this date exists in the fetched holidays array
            const isHoliday = holidays.find(h => h.FromDate === dateStr);

            rollingDays.push({
                dateObj: new Date(currDate),
                dayName: dayNames[currDate.getDay()],
                dateStr: currDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                holidayMatch: isHoliday || null
            });
            daysAdded++;
        }
        currDate.setDate(currDate.getDate() + 1);
    }

    const times = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];

    let actionPlan = [];
    let remainingBunks = bunkable;
    let remainingRequired = required;

    // Running tallies for projection
    let runningAttended = total_attended;
    let runningConducted = total_conducted;

    // Dynamic projection
    rollingDays.forEach(dayInfo => {
        let dayPlan = {
            day: `${dayInfo.dayName}, ${dayInfo.dateStr}`,
            isHoliday: dayInfo.holidayMatch !== null,
            holidayName: dayInfo.holidayMatch ? dayInfo.holidayMatch.Title : '',
            classesToAttend: [],
            classesToBunk: [],
            noClasses: true
        };

        if (!dayPlan.isHoliday) {
            times.forEach(time => {
                const subject = timetable[dayInfo.dayName][time];
                if (!subject || subject.trim() === '') return;
                dayPlan.noClasses = false;

                const isMorning = time === "09:00" || time === "10:00";
                const isAfternoon = time === "14:00" || time === "15:00" || time === "16:00";
                let preferToSkip = (preferences.skipMorning && isMorning) || (preferences.skipAfternoon && isAfternoon);

                // Predict what happens if bunked versus attended for this specific generic step
                const pctIfAttend = ((runningAttended + 1) / (runningConducted + 1) * 100).toFixed(2);
                const pctIfBunk = ((runningAttended) / (runningConducted + 1) * 100).toFixed(2);

                if (isSafe) {
                    if (remainingBunks > 0 && preferToSkip) {
                        dayPlan.classesToBunk.push({ time, subject, reason: 'Preference', pctIfBunk, pctIfAttend });
                        remainingBunks--;
                        // Simulate having bunked it
                        runningConducted++;
                    } else if (remainingBunks > 0) {
                        dayPlan.classesToAttend.push({ time, subject, note: 'Can skip if needed', pctIfAttend, pctIfBunk });
                        // Assume attendance
                        runningAttended++;
                        runningConducted++;
                    } else {
                        dayPlan.classesToAttend.push({ time, subject, note: 'Must attend', pctIfAttend, pctIfBunk });
                        runningAttended++;
                        runningConducted++;
                    }
                } else {
                    // Danger zone
                    if (remainingRequired > 0) {
                        dayPlan.classesToAttend.push({ time, subject, note: 'CRITICAL: Must attend', pctIfAttend, pctIfBunk });
                        remainingRequired--;
                        runningAttended++;
                        runningConducted++;
                    } else {
                        // Reached exactly 75% target within the week!
                        if (preferToSkip) {
                            dayPlan.classesToBunk.push({ time, subject, reason: 'Target Reached & Preference', pctIfBunk, pctIfAttend });
                            runningConducted++;
                        } else {
                            dayPlan.classesToAttend.push({ time, subject, note: 'Safe padding', pctIfAttend, pctIfBunk });
                            runningAttended++;
                            runningConducted++;
                        }
                    }
                }
            });
        }

        if (!dayPlan.noClasses || dayPlan.isHoliday) {
            // Include days that either have classes, or are an explicitly caught holiday
            actionPlan.push(dayPlan);
        }
    });

    return (
        <div className="glass-card mt-2 mb-2">
            <h2>🧠 Smart Action Plan</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                Based on your live attendance, your configured timetable, and your bunking preferences.
            </p>

            {/* Primary status display */}
            {isSafe ? (
                <div className="bunk-status status-safe mb-2">
                    <h3>Status: SAFE 🟢</h3>
                    <p>You have an exact surplus of <strong>{bunkable}</strong> classes to safely skip.</p>
                </div>
            ) : (
                <div className="bunk-status status-danger mb-2">
                    <h3>Status: DANGER 🔴</h3>
                    <p>You must attend <strong>{required}</strong> consecutive classes to reach exactly 75%.</p>
                </div>
            )}

            {/* Detailed Action Plan */}
            <div className="action-plan-grid">
                {actionPlan.length === 0 ? (
                    <p className="p-warning">No subjects added to your timetable yet! Switch to the Timetable tab to configure it.</p>
                ) : (
                    actionPlan.map(day => (
                        <div key={day.day} className="day-action-card">
                            <h4>{day.day}</h4>

                            {day.isHoliday ? (
                                <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
                                    <h5 style={{ margin: 0, color: '#38bdf8' }}>🎉 Official Holiday Avoided!</h5>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>This day is <strong>{day.holidayName}</strong>. Bunk predictions safely skipped.</p>
                                </div>
                            ) : (
                                <>
                                    {day.classesToBunk.length > 0 && (
                                        <div className="action-group bunk-group">
                                            <div className="ag-title">❌ Bunk Recommendations</div>
                                            <ul>
                                                {day.classesToBunk.map((c, i) => (
                                                    <li key={i} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                                            <span><strong>{c.time}</strong> - {c.subject}</span>
                                                            <span className="reason">({c.reason})</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                                            📉 Resulting Overall if Bunked: <strong style={{ color: 'var(--danger)' }}>{c.pctIfBunk}%</strong> | If Attended: {c.pctIfAttend}%
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {day.classesToAttend.length > 0 && (
                                        <div className="action-group attend-group">
                                            <div className="ag-title">✅ Attend Schedule</div>
                                            <ul>
                                                {day.classesToAttend.map((c, i) => (
                                                    <li key={i} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                                            <span><strong>{c.time}</strong> - {c.subject}</span>
                                                            <span className="reason">({c.note})</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                                            📈 Resulting Overall if Attended: <strong style={{ color: 'var(--secondary)' }}>{c.pctIfAttend}%</strong> | If Bunked: {c.pctIfBunk}%
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
