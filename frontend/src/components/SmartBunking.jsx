import React from 'react';
import { useTimetable } from '../hooks/useTimetable';

export default function SmartBunking({ results, formData }) {
    const { timetable, preferences } = useTimetable();
    const { total_conducted, total_attended, percentage } = results;

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

    // Generate specific action plan for the current/upcoming week
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const times = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];

    let actionPlan = [];
    let remainingBunks = bunkable;
    let remainingRequired = required;

    // Simple sequential planner mapping over the week timetable
    days.forEach(day => {
        let dayPlan = { day, classesToAttend: [], classesToBunk: [], noClasses: true };

        times.forEach(time => {
            const subject = timetable[day][time];
            if (!subject || subject.trim() === '') return;
            dayPlan.noClasses = false;

            const isMorning = time === "09:00" || time === "10:00";
            const isAfternoon = time === "14:00" || time === "15:00" || time === "16:00";

            let preferToSkip = (preferences.skipMorning && isMorning) || (preferences.skipAfternoon && isAfternoon);

            if (isSafe) {
                if (remainingBunks > 0 && preferToSkip) {
                    dayPlan.classesToBunk.push({ time, subject, reason: 'Preference' });
                    remainingBunks--;
                } else if (remainingBunks > 0) {
                    // If we have extra bunks but no preference to skip, we attend, but we theoretically *could* bunk
                    dayPlan.classesToAttend.push({ time, subject, note: 'Can skip if needed' });
                } else {
                    dayPlan.classesToAttend.push({ time, subject, note: 'Must attend' });
                }
            } else {
                // Danger zone
                if (remainingRequired > 0) {
                    dayPlan.classesToAttend.push({ time, subject, note: 'CRITICAL: Must attend' });
                    remainingRequired--;
                } else {
                    // Reached exactly 75% target within the week!
                    if (preferToSkip) {
                        dayPlan.classesToBunk.push({ time, subject, reason: 'Target Reached & Preference' });
                    } else {
                        dayPlan.classesToAttend.push({ time, subject, note: 'Safe padding' });
                    }
                }
            }
        });

        if (!dayPlan.noClasses) {
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

                            {day.classesToBunk.length > 0 && (
                                <div className="action-group bunk-group">
                                    <div className="ag-title">❌ Bunk Recommendations</div>
                                    <ul>
                                        {day.classesToBunk.map((c, i) => (
                                            <li key={i}><strong>{c.time}</strong> - {c.subject} <span className="reason">({c.reason})</span></li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {day.classesToAttend.length > 0 && (
                                <div className="action-group attend-group">
                                    <div className="ag-title">✅ Attend Schedule</div>
                                    <ul>
                                        {day.classesToAttend.map((c, i) => (
                                            <li key={i}><strong>{c.time}</strong> - {c.subject} <span className="reason">({c.note})</span></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
