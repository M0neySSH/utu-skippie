import { useState, useCallback } from 'react';

const SESSION_KEY = 'skippie_session';

function loadSession() {
    try {
        const saved = localStorage.getItem(SESSION_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return null;
}

function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

/**
 * Manages the UKTECH browser session (cookies, RFT token, student Token).
 * 
 * session = { sessionCookies: "...", rft: "...", token: "..." } | null
 */
export function useSession() {
    const [session, setSessionState] = useState(() => loadSession());

    const setSession = useCallback((newSession) => {
        if (newSession) {
            saveSession(newSession);
        } else {
            clearSession();
        }
        setSessionState(newSession);
    }, []);

    const hasSession = !!(session?.sessionCookies && session?.rft && session?.token);

    return { session, setSession, hasSession };
}
