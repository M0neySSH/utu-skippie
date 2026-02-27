import { useTimetable } from '../hooks/useTimetable';

export default function TimeTable() {
    const { timetable, updateCell, preferences, updatePreference } = useTimetable();

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const times = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];

    return (
        <div className="glass-card mt-2">
            <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🗓️ Your Weekly Timetable</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                Fill out your subjects. Leave blank for free periods. 1:00 PM - 2:00 PM is Lunch Break.
            </p>

            <div className="timetable-wrapper">
                <table className="timetable">
                    <thead>
                        <tr>
                            <th>Day / Time</th>
                            {times.map(t => (
                                <th key={t}>{t} {t === '12:00' && <span className="break-indicator">→ LUNCH AFTER</span>}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {days.map(day => (
                            <tr key={day}>
                                <td className="day-label">{day}</td>
                                {times.map(time => (
                                    <td key={`${day}-${time}`}>
                                        <input
                                            type="text"
                                            className="tt-input"
                                            placeholder="Subject"
                                            value={timetable[day][time] || ''}
                                            onChange={(e) => updateCell(day, time, e.target.value)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pref-section mt-2">
                <h3>Bunking Preferences</h3>
                <div className="pref-toggles">
                    <label className="pref-label">
                        <input
                            type="checkbox"
                            checked={preferences.skipMorning}
                            onChange={(e) => updatePreference('skipMorning', e.target.checked)}
                        />
                        Skip Morning Classes (9:00 - 10:00)
                    </label>
                    <label className="pref-label">
                        <input
                            type="checkbox"
                            checked={preferences.skipAfternoon}
                            onChange={(e) => updatePreference('skipAfternoon', e.target.checked)}
                        />
                        Skip Afternoon Classes (14:00 onwards)
                    </label>
                </div>
            </div>
        </div>
    );
}
