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
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
        }}>
            <div className="glass-card" style={{
                width: '100%', maxWidth: '420px', padding: '2rem',
                border: '1px solid rgba(16,185,129,0.4)',
                boxShadow: '0 0 40px rgba(16,185,129,0.15)',
                animation: 'fadeIn 0.3s ease-out',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <span style={{
                        background: 'linear-gradient(135deg, #4F46E5, #10B981)',
                        color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem',
                        fontSize: '0.8rem', fontWeight: 'bold'
                    }}>v2.0</span>
                    <h2 style={{ margin: 0, fontSize: '1.4rem' }}>What's New!</h2>
                </div>

                <ul style={{ 
                    listStyle: 'none', padding: 0, margin: '0 0 2rem 0', 
                    display: 'flex', flexDirection: 'column', gap: '1rem' 
                }}>
                    <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem' }}>🍪</span>
                        <div>
                            <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '0.2rem' }}>Auto Session Handling</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Direct cookie auth replaces manual ID fetching. Just log in once!</span>
                        </div>
                    </li>
                    <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem' }}>🔐</span>
                        <div>
                            <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '0.2rem' }}>Secure Captcha Login</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Integrated official UKTECH captcha flow directly into Skippie.</span>
                        </div>
                    </li>
                    <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem' }}>🔄</span>
                        <div>
                            <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '0.2rem' }}>Auto Re-login</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>If your session expires in the background, Skippie seamlessly prompts for a quick resume.</span>
                        </div>
                    </li>
                    <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem' }}>🎯</span>
                        <div>
                            <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '0.2rem' }}>Pinpoint Accuracy</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Attendance is now calculated down to 2 decimal places.</span>
                        </div>
                    </li>
                </ul>

                <button 
                    onClick={handleClose} 
                    style={{ width: '100%', background: 'var(--secondary)', color: 'white' }}
                >
                    Awesome, let's go!
                </button>
            </div>
        </div>
    );
}
