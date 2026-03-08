import React, { useState, useEffect } from 'react';
import { useCalendar } from '../hooks/useCalendar';

export default function AcademicCalendar() {
    const { events: calendarEvents, loading, error } = useCalendar();
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (calendarEvents && calendarEvents.length > 0) {
            const currentYear = new Date().getFullYear();

            // Sort events chronologically and filter out previous years
            const parsed = calendarEvents.map(ev => {
                const [day, month, year] = ev.FromDate.split('/');
                return {
                    ...ev,
                    dateObj: new Date(`${year}-${month}-${day}`)
                };
            }).filter(ev => ev.dateObj.getFullYear() >= currentYear);

            parsed.sort((a, b) => a.dateObj - b.dateObj);
            setEvents(parsed);
        }
    }, [calendarEvents]);

    if (loading) {
        return (
            <div className="glass-card mt-2 text-center">
                <h2>📅 Academic Calendar</h2>
                <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>
                <p>Fetching latest schedule from Skippie...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card mt-2 text-center">
                <h2>📅 Academic Calendar</h2>
                <p className="p-warning">{error}</p>
            </div>
        );
    }

    // Group by Month and Year
    const grouped = {};
    events.forEach(ev => {
        const dateStr = ev.dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!grouped[dateStr]) grouped[dateStr] = [];
        grouped[dateStr].push(ev);
    });

    const isToday = (dateObj) => {
        const today = new Date();
        return dateObj.getDate() === today.getDate() &&
            dateObj.getMonth() === today.getMonth() &&
            dateObj.getFullYear() === today.getFullYear();
    };

    const isPast = (dateObj) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dateObj < today;
    };

    return (
        <div className="glass-card mt-2 mb-2">
            <h2>📅 Official Skippie Calendar</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                All officially declared holidays and events, synchronized LIVE from the university server.
            </p>

            <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {Object.keys(grouped).map(monthYear => (
                    <div key={monthYear} className="month-card" style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '1rem', padding: '1rem', border: '1px solid var(--border)' }}>
                        <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>
                            {monthYear}
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {grouped[monthYear].map(ev => {
                                const past = isPast(ev.dateObj);
                                const today = isToday(ev.dateObj);
                                return (
                                    <li key={ev.EventCalendarID} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        opacity: past ? 0.5 : 1,
                                        background: today ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                                        padding: today ? '0.5rem' : '0',
                                        borderRadius: '0.5rem',
                                        border: today ? '1px solid var(--secondary)' : 'none'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{ev.Title}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{ev.SubjectH}</div>
                                        </div>
                                        <div style={{ fontWeight: '500', color: today ? 'var(--secondary)' : 'inherit', textAlign: 'right' }}>
                                            {ev.dateObj.getDate()} {ev.dateObj.toLocaleString('default', { month: 'short' })}
                                            {today && <div style={{ fontSize: '0.7rem' }}>TODAY</div>}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
