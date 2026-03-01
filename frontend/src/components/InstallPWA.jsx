import React, { useState, useEffect } from 'react';

const InstallPWA = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState(null);

    useEffect(() => {
        const handler = e => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("transitionend", handler);
    }, []);

    const onClick = evt => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
    };

    if (!supportsPWA) {
        return null;
    }

    return (
        <div style={{
            background: 'linear-gradient(to right, #4F46E5, #10B981)',
            padding: '1rem',
            borderRadius: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            color: 'white'
        }}>
            <div>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Install YouTu App</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>Add it to your home screen</p>
            </div>
            <button
                onClick={onClick}
                style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    padding: '0.5rem 1rem',
                    width: 'auto',
                    marginTop: 0,
                    color: 'white',
                    backdropFilter: 'blur(4px)'
                }}
            >
                Install
            </button>
        </div>
    );
};

export default InstallPWA;
