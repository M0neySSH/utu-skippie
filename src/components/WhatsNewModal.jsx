import { useState, useEffect } from 'react';

export default function WhatsNewModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const seenVersion = localStorage.getItem('skippie_seen_v2');
        if (!seenVersion) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('skippie_seen_v2', 'true');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            padding: '1.2rem',
            background: 'var(--card-bg)',
            border: '1px solid rgba(79, 70, 229, 0.4)',
            borderRadius: '0.6rem',
            position: 'relative',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ 
                    color: '#818CF8', 
                    margin: 0,
                    fontSize: '1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    lineHeight: 1
                }}>
                    ✨ What's New in v2.0
                </h3>
                <button 
                    onClick={handleClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '1.3rem',
                        cursor: 'pointer',
                        padding: '0',
                        lineHeight: '0.005',
                        display: 'flex',
                        alignItems: 'right',
                        justifyContent: 'right',
                        transform: 'translateY(-2px)'
                    }}
                    title="Close"
                >
                    ✕
                </button>
            </div>

            <ul style={{
                margin: '0',
                paddingLeft: '1.5rem',
                color: 'var(--text-main)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.9rem',
                lineHeight: '1.5'
            }}>
                <li>Skippie is now more user-friendly and authentic</li>
                <li>Attendance now displays up to 2 accurate decimal places</li>
                <li>Auto session refresh / re-login when session expires</li>
                <li>Drop your feedback, suggestions and feature requests at Skippie's GitHub Issues tab!</li>
            </ul>
        </div>
    );
}
