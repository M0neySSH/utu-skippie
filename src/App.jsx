import { useState, useEffect, useRef } from 'react';
import './index.css';
import TimeTable from './components/TimeTable';
import SmartBunking from './components/SmartBunking';
import DailyPlanner from './components/DailyPlanner';
import AcademicCalendar from './components/AcademicCalendar';
import SubjectHistory from './components/SubjectHistory';
import InstallPWA from './components/InstallPWA';
import AboutPage from './components/AboutPage';
import LoginModal from './components/LoginModal';
import { useConfig } from './hooks/useConfig';
import { useSession } from './hooks/useSession';

function App() {
  const { config, updateConfig } = useConfig();
  const { session, setSession, hasSession } = useSession();
  const [formData, setFormData] = useState(config);

  // Sync formData to hook config whenever it changes
  useEffect(() => {
    updateConfig(formData);
  }, [formData]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Login modal state
  const [showLogin, setShowLogin] = useState(false);
  // When session expires mid-fetch, we store the pending fetch params and retry after login
  const pendingFetchRef = useRef(null);

  // Daily Notifications
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const lastNotified = localStorage.getItem('skippie_last_notified');
    const todayStr = new Date().toDateString();

    if (lastNotified !== todayStr && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const cachedCalendar = localStorage.getItem('uktech_calendar');
        let holidayToday = null;

        if (cachedCalendar) {
          const holidays = JSON.parse(cachedCalendar);
          const todayStart = new Date().setHours(0, 0, 0, 0);
          holidayToday = holidays.find(h => new Date(h.Date).setHours(0, 0, 0, 0) === todayStart);
        }

        if (holidayToday) {
          new Notification('🎉 Skippie Holiday!', {
            body: `Today is ${holidayToday.Title}. Relax and safely bunk classes!`,
            icon: '/vite.svg'
          });
        } else {
          const messages = [
            "Good morning! Remember to check your Safe Bunks today.",
            "Don't let your attendance drop below 75%!",
            "Have a great day of classes! Check Skippie for your schedule."
          ];
          const randomMsg = messages[Math.floor(Math.random() * messages.length)];
          new Notification('Skippie Daily', {
            body: randomMsg,
            icon: '/vite.svg'
          });
        }
        localStorage.setItem('skippie_last_notified', todayStr);
      } catch (e) {
        console.error("Error setting notification", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateAttendance = (monthsData) => {
    let total_attended = 0;
    let total_conducted = 0;
    let leaves = 0;

    monthsData.forEach(month => {
      if (!month || !month.data) return;

      month.data.forEach(subject => {
        subject.attendance.forEach(val => {
          if (val !== null) {
            if (val === 3) {
              // P/A: 2 classes conducted, 1 attended
              total_attended += 1;
              total_conducted += 2;
            } else if (val === 4) {
              // P/L: 1 class conducted + 1 attended + 1 leave
              total_attended += 1;
              total_conducted += 1;
              leaves += 1;
            } else if (val === 5) {
              // A/L: 1 class conducted + 0 attended + 1 leave
              total_conducted += 1;
              leaves += 1;
            } else if (val === 6) {
              // L/L: 2 leaves
              leaves += 2;
            } else if (val > 0) {
              total_attended += val;
              total_conducted += val;
            } else if (val < 0) {
              total_conducted += Math.abs(val);
            } else if (val === 0) {
              leaves += 1;
            }
          }
        });
      });
    });

    return { total_attended, total_conducted, leaves };
  };

  /**
   * Core fetch function — uses session tokens.
   * Returns resultsArray on success, or throws/signals session expired.
   */
  async function fetchAttendanceWithSession(activeSession, startMonth, endMonth, sessionYear, courseBranchDurationId) {
    const requests = [];
    for (let m = startMonth; m <= endMonth; m++) {
      requests.push(
        fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionCookies: activeSession.sessionCookies,
            rft: activeSession.rft,
            token: activeSession.token,
            SessionYear: sessionYear,
            CourseBranchDurationId: courseBranchDurationId,
            Year: sessionYear,
            MonthId: m.toString(),
          }),
        }).then(res => {
          if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
          return res.json().then(data => ({ ...data, monthId: m, yearId: parseInt(sessionYear) }));
        })
      );
    }
    return await Promise.all(requests);
  }

  function processResults(resultsArray, name) {
    const { total_attended, total_conducted, leaves } = calculateAttendance(resultsArray);
    if (total_conducted === 0) {
      throw new Error("No attendance data found for the selected timeline. Try different months.");
    }
    const percentage = (total_attended / total_conducted) * 100;
    setResults({ total_attended, total_conducted, leaves, percentage, monthsData: resultsArray });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResults(null);

    const start = parseInt(formData.StartMonth);
    const end = parseInt(formData.EndMonth);
    if (start > end) {
      setError("Start month cannot be after end month");
      return;
    }

    // No session yet — show login first, then we'll auto-fetch
    if (!hasSession) {
      pendingFetchRef.current = { start, end };
      setShowLogin(true);
      return;
    }

    setLoading(true);
    try {
      const resultsArray = await fetchAttendanceWithSession(
        session, start, end, formData.SessionYear, formData.CourseBranchDurationId
      );

      // Check if any month returned SESSION_EXPIRED
      const expired = resultsArray.find(r => r.reason === 'SESSION_EXPIRED');
      if (expired) {
        pendingFetchRef.current = { start, end };
        setShowLogin(true);
        setLoading(false);
        return;
      }

      processResults(resultsArray, formData.Name);
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance data.');
    } finally {
      setLoading(false);
    }
  };

  // Called after successful login — save session and auto-retry pending fetch
  const handleLoginSuccess = async (newSession) => {
    setSession(newSession);
    setShowLogin(false);

    if (!pendingFetchRef.current) return;

    const { start, end } = pendingFetchRef.current;
    pendingFetchRef.current = null;

    setLoading(true);
    setError(null);
    try {
      const resultsArray = await fetchAttendanceWithSession(
        newSession, start, end, formData.SessionYear, formData.CourseBranchDurationId
      );
      const expired = resultsArray.find(r => r.reason === 'SESSION_EXPIRED');
      if (expired) {
        setError("Session still invalid after login. Please try logging in again.");
        return;
      }
      processResults(resultsArray, formData.Name);
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance data after login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">

      <LoginModal
        isOpen={showLogin}
        onSuccess={handleLoginSuccess}
        onClose={() => setShowLogin(false)}
        hasExisting={hasSession}
      />

      <div className="header">
        <h1 style={{ marginBottom: '0.2rem' }}>Skippie</h1>
        <p style={{ color: 'var(--text-muted)' }}>Predictive Intelligence for UTU Attendance Planning</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'Dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('Dashboard')}
        >
          📊 Dashboard
        </button>
        {results && (
          <button
            className={`tab-btn ${activeTab === 'History' ? 'active' : ''}`}
            onClick={() => setActiveTab('History')}
          >
            📋 Subject History
          </button>
        )}
        <button
          className={`tab-btn ${activeTab === 'Daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('Daily')}
        >
          📅 Daily Simulator
        </button>
        <button
          className={`tab-btn ${activeTab === 'Timetable' ? 'active' : ''}`}
          onClick={() => setActiveTab('Timetable')}
        >
          🗓️ Timetable Editor
        </button>
        <button
          className={`tab-btn ${activeTab === 'Calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('Calendar')}
        >
          📚 Academic Calendar
        </button>
      </div>

      {activeTab === 'Timetable' && <TimeTable />}
      {activeTab === 'Daily' && <DailyPlanner results={results} />}
      {activeTab === 'Calendar' && <AcademicCalendar />}
      {activeTab === 'History' && <SubjectHistory results={results} />}
      {activeTab === 'About' && <AboutPage />}

      <>
        <div className="glass-card" style={{ display: activeTab === 'Dashboard' ? 'block' : 'none' }}>
          <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              Student Details
              {hasSession && (
                <span title="Session active" style={{
                  display: 'inline-block', width: '10px', height: '10px',
                  borderRadius: '50%', background: 'var(--secondary)',
                  boxShadow: '0 0 6px var(--secondary)', flexShrink: 0,
                }} />
              )}
            </span>
            {hasSession && (
              <button
                type="button"
                title="Logout"
                onClick={() => { setSession(null); setShowLogin(true); }}
                style={{
                  width: 'auto', margin: 0, padding: '0.35rem 0.7rem',
                  fontSize: '1.1rem', lineHeight: 1,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  color: 'var(--danger)', borderRadius: '0.4rem', cursor: 'pointer',
                }}
              >
                🚪
              </button>
            )}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" name="Name" value={formData.Name} onChange={handleChange} required placeholder="E.g. Rahul" />
              </div>
              <div className="form-group">
                <label>Duration ID (CourseBranchDurationId)</label>
                <input type="number" name="CourseBranchDurationId" value={formData.CourseBranchDurationId} onChange={handleChange} required placeholder="E.g. 6" />
              </div>
              <div className="form-group">
                <label>Session Year</label>
                <input type="number" name="SessionYear" value={formData.SessionYear} onChange={handleChange} required placeholder="E.g. 2025" />
              </div>
              <div className="form-group">
                <label>Start Month (1-12)</label>
                <input type="number" min="1" max="12" name="StartMonth" value={formData.StartMonth} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>End Month (1-12)</label>
                <input type="number" min="1" max="12" name="EndMonth" value={formData.EndMonth} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Classes per Day</label>
                <input type="number" step="0.5" name="ClassesPerDay" value={formData.ClassesPerDay} onChange={handleChange} placeholder="For accurate predictions" />
              </div>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? <div className="loader"></div> : (hasSession ? 'Fetch & Analyze' : '🔐 Login & Fetch')}
            </button>
          </form>
        </div>

        {error && activeTab === 'Dashboard' && (
          <div className="glass-card" style={{ borderColor: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
            <h3 style={{ color: 'var(--danger)' }}>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {results && !loading && activeTab === 'Dashboard' && (
          <div className="glass-card app-container" style={{ gap: '1.5rem', animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ textAlign: 'center' }}>Attendance Report for {formData.Name.toUpperCase()}</h2>

            <div
              className="percentage-circle"
              style={{
                '--percentage': `${results.percentage}%`,
                '--state-color': results.percentage >= 75 ? 'var(--secondary)' : 'var(--danger)'
              }}
            >
              <span>{results.percentage.toFixed(2)}%</span>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{results.total_conducted}</div>
                <div className="stat-label">Total Conducted</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--secondary)' }}>{results.total_attended}</div>
                <div className="stat-label">Total Attended</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--danger)' }}>{results.total_conducted - results.total_attended - results.leaves}</div>
                <div className="stat-label">Total Missed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--warning)' }}>{results.leaves}</div>
                <div className="stat-label">Official Leaves</div>
              </div>
            </div>

            <SmartBunking results={results} formData={formData} />
          </div>
        )}
      </>

      <InstallPWA />

      <div style={{ textAlign: 'center', marginTop: '1rem', padding: '1rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <p>Built for UTU Students</p>
        <p>
          Developed with ❤️ by <a href="https://github.com/M0neySSH" target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8', textDecoration: 'none' }}>Manish</a>
        </p>
        <button
          type="button"
          onClick={() => { setActiveTab('About'); window.scrollTo(0, 0); }}
          style={{
            background: 'none', border: 'none', color: '#38bdf8',
            textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem', padding: 0,
            textUnderlineOffset: '4px', marginTop: '0.5rem'
          }}
        >
          About Skippie
        </button>
      </div>
    </div>
  );
}

export default App;
