import { useState, useEffect } from 'react';
import './index.css';
import TimeTable from './components/TimeTable';
import SmartBunking from './components/SmartBunking';
import DailyPlanner from './components/DailyPlanner';
import AcademicCalendar from './components/AcademicCalendar';
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
          fetch('http://localhost:3000/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              MonthId: m.toString()
            })
          }).then(res => {
            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
            return res.json();
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
        percentage
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
      <div className="header">
        <h1>UKTECH Attendance</h1>
        <p style={{ color: 'var(--text-muted)' }}>Bypass Restrictions & Calculate Exact Bunks</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'Dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('Dashboard')}
        >
          📊 Dashboard
        </button>
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

      {activeTab === 'Dashboard' && (
        <>
          <div className="glass-card">
            <h2>Student Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" name="Name" value={formData.Name} onChange={handleChange} required placeholder="E.g. Manish" />
                </div>
                <div className="form-group">
                  <label>Roll No</label>
                  <input type="text" name="RollNo" value={formData.RollNo} onChange={handleChange} required placeholder="2316..." />
                </div>
                <div className="form-group">
                  <label>Student Admission ID</label>
                  <input type="text" name="StudentAdmissionId" value={formData.StudentAdmissionId} onChange={handleChange} required placeholder="E.g. 29820" />
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

          {error && (
            <div className="glass-card" style={{ borderColor: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
              <h3 style={{ color: 'var(--danger)' }}>Error</h3>
              <p>{error}</p>
            </div>
          )}

          {results && !loading && (
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
      )}
    </div>
  );
}

export default App;
