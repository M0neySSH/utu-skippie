import { useState, useEffect } from 'react';
import './index.css';
import TimeTable from './components/TimeTable';
import SmartBunking from './components/SmartBunking';
import DailyPlanner from './components/DailyPlanner';
import AcademicCalendar from './components/AcademicCalendar';
import SubjectHistory from './components/SubjectHistory';
import InstallPWA from './components/InstallPWA';
import { useConfig } from './hooks/useConfig';

function App() {
  const { config, updateConfig } = useConfig();
  const [formData, setFormData] = useState(config);

  // Sync formData to hook config whenever it changes
  useEffect(() => {
    updateConfig(formData);
  }, [formData]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showGuide, setShowGuide] = useState(false);

  // Theme Management
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('skippie_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('skippie_theme', theme);
  }, [theme]);

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

  const bookmarkletCode = `javascript:(function(){var a=document.querySelector('[name=CourseBranchDurationId]'),b=document.querySelector('[name=StudentAdmissionId]'),c=document.querySelector('[name=BranchId]');var v1=a&&a.selectedOptions&&a.selectedOptions[0]?a.selectedOptions[0].value:null,v2=b?b.value:null,v3=c?c.value:null;if(!v1||!v2||!v3){alert('Please fill out all the values on the attendance page and then try again.');}else{alert('Skippie Config\\nCourseBranchDurationId: '+v1+'\\nStudentAdmissionId: '+v2+'\\nBranchId: '+v3);}})();`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`"${bookmarkletCode}"`);
    alert("Copied to clipboard! (Remember to remove the quotes before pasting into your browser url bar)");
  };

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
            if (val > 0) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const start = parseInt(formData.StartMonth);
      const end = parseInt(formData.EndMonth);

      if (start > end) {
        throw new Error("Start month cannot be after end month");
      }

      const requests = [];
      for (let m = start; m <= end; m++) {
        requests.push(
          fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              MonthId: m.toString()
            })
          }).then(res => {
            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
            return res.json().then(data => ({
              ...data,
              monthId: m,
              yearId: parseInt(formData.SessionYear)
            }));
          })
        );
      }

      const resultsArray = await Promise.all(requests);

      const { total_attended, total_conducted, leaves } = calculateAttendance(resultsArray);

      if (total_conducted === 0) {
        throw new Error("No attendance data found for the selected timeline.");
      }

      const percentage = (total_attended / total_conducted) * 100;

      setResults({
        total_attended,
        total_conducted,
        leaves,
        percentage,
        monthsData: resultsArray
      });

    } catch (err) {
      setError(err.message || 'Failed to fetch attendance data.');
    } finally {
      setLoading(false);
    }
  };

  // Replaced by SmartBunking component

  return (
    <div className="app-container">

      <div className="header" style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            position: 'absolute', top: 0, right: 0,
            background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)',
            borderRadius: '50%', width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', cursor: 'pointer'
          }}
          title="Toggle Light/Dark Mode"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <h1>Skippie</h1>
        <p style={{ color: 'var(--text-muted)' }}>The Ultimate UTU Attendance App</p>
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

      <>
        <div className="glass-card" style={{ display: activeTab === 'Dashboard' ? 'block' : 'none' }}>
          <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span>Student Details</span>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              style={{ width: 'auto', margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)' }}
            >
              ❓ How to find my IDs?
            </button>
          </h2>

          {showGuide && (
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <h4 style={{ color: '#38bdf8', marginBottom: '0.5rem' }}>Auto-Extractor Guide</h4>
              <ol style={{ marginLeft: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                <li>Go to your official UKTECH student dashboard.</li>
                <li>Navigate to the <strong>Student Attendance System</strong> page.</li>
                <li>Select your Semester/Year/Session dropdowns on that page.</li>
                <li>Copy the special code below.</li>
                <li>Paste it into your browser's URL address bar on the UKTECH page and hit Enter. <em>(Note: You MUST remove the quotation marks at the start and end of the pasted text!)</em></li>
                <li>A popup will flash with your exact IDs!</li>
              </ol>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <textarea
                  readOnly
                  value={`"${bookmarkletCode}"`}
                  style={{ flex: 1, height: '60px', fontSize: '0.75rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.5)', color: '#34D399', border: '1px solid var(--border)', borderRadius: '0.3rem', padding: '0.5rem', resize: 'none' }}
                />
                <button type="button" onClick={copyToClipboard} style={{ width: 'auto', margin: 0, padding: '0.5rem', background: 'var(--secondary)' }}>
                  📋 Copy
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="Name" value={formData.Name} onChange={handleChange} required placeholder="E.g. Rahul" />
              </div>
              <div className="form-group">
                <label>Roll No</label>
                <input type="text" name="RollNo" value={formData.RollNo} onChange={handleChange} required placeholder="E.g. 123456789012" />
              </div>
              <div className="form-group">
                <label>Student Admission ID</label>
                <input type="text" name="StudentAdmissionId" value={formData.StudentAdmissionId} onChange={handleChange} required placeholder="E.g. 123456789012" />
              </div>
              <div className="form-group">
                <label>Branch ID</label>
                <input type="number" name="BranchId" value={formData.BranchId} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Duration ID</label>
                <input type="number" name="CourseBranchDurationId" value={formData.CourseBranchDurationId} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Session Year</label>
                <input type="number" name="SessionYear" value={formData.SessionYear} onChange={handleChange} required />
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
              {loading ? <div className="loader"></div> : 'Fetch & Analyze'}
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
              <span>{results.percentage.toFixed(1)}%</span>
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

      <div style={{ textAlign: 'center', marginTop: '1rem', padding: '1rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <p>Built for UTU Students</p>
        <p>Developed with ❤️ by Manish</p>
      </div>
    </div>
  );
}

export default App;
