import React, { useState } from 'react';

const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function SubjectHistory({ results }) {
    if (!results || !results.monthsData) return null;

    const [selectedMonth, setSelectedMonth] = useState(results.monthsData[0]?.monthId || null);

    const monthData = results.monthsData.find(m => m.monthId === selectedMonth);

    return (
        <div className="glass-card app-container" style={{ animation: 'fadeIn 0.5s ease-out', marginTop: '1rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Detailed Subject History</h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                View your exact dates for presence (P), absence (A), and official leave (L) for every subject.
            </p>

            <div className="tabs" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                {results.monthsData.map(m => (
                    <button
                        key={m.monthId}
                        className={`tab-btn ${selectedMonth === m.monthId ? 'active' : ''}`}
                        onClick={() => setSelectedMonth(m.monthId)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', flex: '1 1 auto' }}
                    >
                        {monthNames[m.monthId]} {m.yearId}
                    </button>
                ))}
            </div>

            {monthData && monthData.data && monthData.data.map((subjectData, sIdx) => (
                <div key={sIdx} className="glass-card mb-2" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                        {subjectData.subject}
                        <span style={{ float: 'right', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{subjectData.percentage}</span>
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(45px, 1fr))', gap: '0.5rem' }}>
                        {subjectData.attendance.map((status, dayIndex) => {
                            if (status === null) return null;
                            const dayNumber = dayIndex + 1;

                            let bgColor = 'rgba(255, 255, 255, 0.05)';
                            let borderColor = 'rgba(255, 255, 255, 0.1)';
                            let textColor = 'var(--text-muted)';
                            let label = '-';

                            if (status > 0) {
                                bgColor = 'rgba(16, 185, 129, 0.15)';
                                borderColor = 'var(--secondary)';
                                textColor = 'var(--secondary)';
                                label = 'P';
                            } else if (status < 0) {
                                bgColor = 'rgba(239, 68, 68, 0.15)';
                                borderColor = 'var(--danger)';
                                textColor = 'var(--danger)';
                                label = 'A';
                            } else if (status === 0) {
                                bgColor = 'rgba(245, 158, 11, 0.15)';
                                borderColor = 'var(--warning)';
                                textColor = 'var(--warning)';
                                label = 'L';
                            }

                            return (
                                <div key={dayIndex} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.3rem',
                                    borderRadius: '0.4rem',
                                    background: bgColor,
                                    border: `1px solid ${borderColor}`,
                                }}>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>{dayNumber}</span>
                                    <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: textColor }}>
                                        {label}{Math.abs(status) > 1 ? `x${Math.abs(status)}` : ''}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
