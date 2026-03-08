import React from 'react';

export default function AboutPage() {
    return (
        <div className="glass-card app-container" style={{ animation: 'fadeIn 0.5s ease-out', marginTop: '1rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'linear-gradient(to right, #818CF8, #34D399)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                About Skippie
            </h2>

            <div className="mb-2" style={{ lineHeight: '1.6' }}>
                <h3 style={{ color: 'var(--secondary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>🎯 Our Motive</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                    Skippie was built with one core mission: to give UKTECH students total control over their academic lives.
                    We believe that maintaining a 75% attendance requirement shouldn't require complex math or guesswork.
                    Skippie empowers you to easily track your history, safely plan your breaks, and focus on what matters most—your education and well-being.
                </p>
            </div>

            <div className="mb-2" style={{ lineHeight: '1.6' }}>
                <h3 style={{ color: 'var(--secondary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>✨ Key Features</h3>
                <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Smart Action Plan:</strong> Uses your personal timetable to tell you exactly which classes are safe to bunk.</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Subject History:</strong> Instantly view an explicit calendar of your Present, Absent, and Leave dates.</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Daily Simulator:</strong> Check off the classes you actually attended today to see your live projected percentage.</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Live University Calendar:</strong> Automatically syncs official holidays to warn you before you accidentally try to attend on a day off!</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>100% Private:</strong> Skippie runs entirely in your browser. We never store your passwords or your data on external servers.</li>
                </ul>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>Developed with ❤️ by Manish</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Built for UTU Students</p>
            </div>
        </div>
    );
}
