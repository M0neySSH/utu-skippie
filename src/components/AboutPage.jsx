import React from 'react';

export default function AboutPage() {
    return (
        <div className="glass-card app-container" style={{ animation: 'fadeIn 0.5s ease-out', marginTop: '1rem', padding: '2rem' }}>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎓</div>
                <h2 style={{ fontSize: '2rem', background: 'linear-gradient(to right, #818CF8, #34D399)', WebkitBackgroundClip: 'text', color: 'transparent', marginBottom: '0.5rem' }}>
                    Welcome to Skippie
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    The Open-Source Attendance Manager for UKTECH Students.
                </p>
            </div>

            <div className="mb-2" style={{ lineHeight: '1.6', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--secondary)', fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🎯</span> The Motive
                </h3>
                <p style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>
                    Tracking university attendance shouldn't feel like a second job. Between calculating 75% thresholds, predicting safe days off, and navigating official portals, staying on top of your schedule can be a tedious manual process.
                </p>
                <p style={{ color: 'var(--text-main)' }}>
                    Skippie was engineered to automate this exact workflow. By bypassing the traditional UKTECH portal and directly parsing the core academic database, Skippie hands you the computational power to predict, simulate, and optimize your entire semester in milliseconds. Our mission is to automate the mundane calculations so you can focus your energy entirely on passing exams, building your career, and excelling at university.
                </p>
            </div>

            <div className="mb-2" style={{ lineHeight: '1.6', marginTop: '2rem' }}>
                <h3 style={{ color: 'var(--secondary)', fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>⚡</span> Elite Engine Features
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ color: '#818CF8', marginBottom: '0.5rem' }}>🧠 Smart Bunk Engine</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Tell Skippie your weekly timetable. The algorithm will mathematically compute an explicit action plan of exactly which classes you can skip today, tomorrow, and next week while safely remaining above the dangerous 75% red-line.
                        </p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ color: '#34D399', marginBottom: '0.5rem' }}>📅 Daily Simulator</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Wake up, open the app, and uncheck the classes you plan to sleep through. The simulator will instantly project your hypothetical final attendance percentage by 5:00 PM, taking the guesswork out of bunking.
                        </p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ color: '#F59E0B', marginBottom: '0.5rem' }}>📋 Deep History</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            No more blind data. The Subject History tab reconstructs your entire semester by plotting every single Present, Absent, and Official Leave marker directly onto an interactive calendar grid.
                        </p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ color: '#EF4444', marginBottom: '0.5rem' }}>🔒 100% Client-Side</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Your secret UKTECH tokens and passwords never touch our databases. Skippie operates entirely as a local Progressive Web App (PWA) right on your phone's processor.
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    Developed with ❤️ by <a href="https://github.com/M0neySSH" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8', textDecoration: 'none' }}>Manish</a>
                </p>
                <p style={{ fontSize: '0.9rem' }}>Empowering the Veer Madho Singh Bhandari Uttarakhand Technical University community.</p>
            </div>
        </div>
    );
}
