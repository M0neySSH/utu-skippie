import { useState, useEffect } from 'react';

/**
 * LoginModal
 * 
 * Shown when:
 * - User has no saved session (first time)
 * - Session has expired (SESSION_EXPIRED from API)
 * 
 * Props:
 *   isOpen        - boolean
 *   onSuccess     - called with { sessionCookies, rft, token } when login succeeds
 *   onClose       - called when user dismisses (only if session already exists)
 *   hasExisting   - boolean, true if user already has a session (allows closing)
 */
export default function LoginModal({ isOpen, onSuccess, onClose, hasExisting }) {
    const [step, setStep] = useState('idle'); // idle | loading_captcha | captcha | logging_in | done
    const [captchaBase64, setCaptchaBase64] = useState(null);
    const [sessionCookiesTemp, setSessionCookiesTemp] = useState(null);
    const [rftTemp, setRftTemp] = useState(null);
    const [formData, setFormData] = useState(() => {
        try {
            const saved = localStorage.getItem('skippie_login_credentials');
            if (saved) {
                const { rollNo, dateOfBirth } = JSON.parse(saved);
                return { rollNo: rollNo || '', dateOfBirth: dateOfBirth || '', captcha: '' };
            }
        } catch (e) { /* ignore */ }
        return { rollNo: '', dateOfBirth: '', captcha: '' };
    });
    const [error, setError] = useState(null);

    // Reset and reload captcha every time the modal opens
    useEffect(() => {
        if (isOpen) {
            setStep('idle');
            setCaptchaBase64(null);
            setError(null);
            setFormData(prev => ({ ...prev, captcha: '' }));
            loadCaptcha();
        }
    }, [isOpen]);

    async function loadCaptcha() {
        setStep('loading_captcha');
        setError(null);
        try {
            const res = await fetch('/api/captcha');
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Failed to load captcha');
            setCaptchaBase64(data.captchaBase64);
            setSessionCookiesTemp(data.sessionCookies);
            setRftTemp(data.rft);
            setStep('captcha');
        } catch (e) {
            setError(e.message);
            setStep('idle');
        }
    }

    function refreshCaptcha() {
        setFormData(prev => ({ ...prev, captcha: '' }));
        setStep('idle');
        loadCaptcha();
    }

    function handleChange(e) {
        const value = e.target.name === 'captcha' ? e.target.value.toUpperCase() : e.target.value;
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
    }

    async function handleLogin(e) {
        e.preventDefault();
        setStep('logging_in');
        setError(null);
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionCookies: sessionCookiesTemp,
                    rft: rftTemp,
                    rollNo: formData.rollNo,
                    dateOfBirth: formData.dateOfBirth,
                    captcha: formData.captcha,
                }),
            });
            const data = await res.json();
            if (!data.success) {
                const msg = data.reason === 'INVALID_CAPTCHA'
                    ? 'Wrong captcha. Please try again.'
                    : 'Invalid Roll No or Date of Birth.';
                setError(msg);
                // Refresh captcha for next attempt
                await loadCaptcha();
                setFormData(prev => ({ ...prev, captcha: '' }));
                return;
            }
            // Login successful — save credentials for next re-login prefill
            localStorage.setItem('skippie_login_credentials', JSON.stringify({
                rollNo: formData.rollNo,
                dateOfBirth: formData.dateOfBirth,
            }));
            setStep('done');
            onSuccess({ sessionCookies: data.sessionCookies, rft: data.rft, token: data.token });
        } catch (e) {
            setError(e.message);
            setStep('captcha');
        }
    }

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
                border: '1px solid rgba(99,102,241,0.4)',
                boxShadow: '0 0 40px rgba(99,102,241,0.2)',
                animation: 'fadeIn 0.3s ease-out',
            }}>
                <h2 style={{ marginBottom: '0.25rem', textAlign: 'center' }}>
                    🔐 Login to UKTECH
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                    {hasExisting
                        ? 'Your session has expired. Please log in again.'
                        : 'Log in once. Skippie never stores your password.'}
                </p>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.15)', border: '1px solid var(--danger)',
                        borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem',
                        color: 'var(--danger)', fontSize: '0.875rem',
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {(step === 'idle' || step === 'loading_captcha') && (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div className="loader" style={{ margin: '0 auto' }} />
                        <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.9rem' }}>
                            Loading captcha from UKTECH...
                        </p>
                    </div>
                )}

                {(step === 'captcha' || step === 'logging_in') && (
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Roll No</label>
                            <input
                                type="text" name="rollNo" value={formData.rollNo}
                                onChange={handleChange} required
                                placeholder="E.g. 2200640100001"
                                disabled={step === 'logging_in'}
                            />
                        </div>
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                                type="text" name="dateOfBirth" value={formData.dateOfBirth}
                                onChange={handleChange} required
                                placeholder="DD/MM/YYYY"
                                disabled={step === 'logging_in'}
                            />
                        </div>

                        {/* Captcha Image */}
                        <div className="form-group">
                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Captcha</span>
                                <button
                                    type="button" onClick={refreshCaptcha}
                                    disabled={step === 'logging_in'}
                                    style={{
                                        background: 'none', border: 'none', color: '#38bdf8',
                                        cursor: 'pointer', fontSize: '0.8rem', padding: 0,
                                        textDecoration: 'underline',
                                    }}
                                >
                                    🔄 Refresh
                                </button>
                            </label>
                            {captchaBase64 && (
                                <img
                                    src={captchaBase64}
                                    alt="UKTECH Captcha"
                                    style={{
                                        display: 'block', width: '100%', borderRadius: '0.4rem',
                                        border: '1px solid var(--border)', marginBottom: '0.5rem',
                                        imageRendering: 'pixelated',
                                    }}
                                />
                            )}
                            <input
                                type="text" name="captcha" value={formData.captcha}
                                onChange={handleChange} required
                                placeholder="Type the characters above"
                                disabled={step === 'logging_in'}
                                autoComplete="off"
                                style={{ letterSpacing: '0.2rem', fontWeight: 'bold' }}
                            />
                        </div>

                        <button type="submit" disabled={step === 'logging_in'} style={{ marginTop: '0.5rem' }}>
                            {step === 'logging_in' ? <div className="loader" style={{ margin: '0 auto' }} /> : '🔓 Login & Continue'}
                        </button>

                        {hasExisting && (
                            <button
                                type="button" onClick={onClose}
                                style={{
                                    background: 'none', border: '1px solid var(--border)',
                                    marginTop: '0.5rem', color: 'var(--text-muted)',
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </form>
                )}

                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '1.5rem', lineHeight: '1.5' }}>
                    🔒 Your credentials are sent directly to UKTECH and never stored by Skippie. Only the session token is saved locally.
                </p>
            </div>
        </div>
    );
}
