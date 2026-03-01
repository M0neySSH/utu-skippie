import { useState, useEffect } from 'react';

const CACHE_KEY = 'aura_calendar_cache';
const CACHE_TIME_KEY = 'aura_calendar_last_fetch';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                const now = new Date().getTime();
                const cachedData = localStorage.getItem(CACHE_KEY);
                const lastFetch = localStorage.getItem(CACHE_TIME_KEY);

                if (cachedData && lastFetch && (now - parseInt(lastFetch) < CACHE_DURATION_MS)) {
                    // Use cached data
                    setEvents(JSON.parse(cachedData));
                    setLoading(false);
                    return;
                }

                // Fetch fresh data
                const res = await fetch('/api/calendar');
                const data = await res.json();

                if (data.success && Array.isArray(data.data)) {
                    setEvents(data.data);
                    localStorage.setItem(CACHE_KEY, JSON.stringify(data.data));
                    localStorage.setItem(CACHE_TIME_KEY, now.toString());
                } else {
                    setError('Invalid data format received from server.');
                }
            } catch (err) {
                console.error('Failed to fetch calendar:', err);

                // Fallback to cache if request fails but we have old data
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    setEvents(JSON.parse(cachedData));
                    console.log('Using expired cache due to network error.');
                } else {
                    setError('Failed to fetch the academic calendar.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCalendar();
    }, []);

    return { events, loading, error };
}
