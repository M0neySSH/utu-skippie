# YouTu (UTU Skippie) 🎓✨

**Your Own Utility for Technical University**

YouTu (formerly Aura Campus / UTU Skippie) is a smart, localized attendance forecasting and scheduling Progressive Web App (PWA) built specifically for students of Uttarakhand Technical University (UTU).

## 🚀 Features

- **Live Attendance Sync:** Bypasses university portal restrictions to fetch your real-time attendance data.
- **Dynamic Bunk Calculator:** Instantly mathematically calculates exactly how many classes you can afford to bunk (or must attend) to maintain the golden 75% threshold.
- **Smart Action Plan:** Generates a personalized rolling 6-day schedule predicting your attendance percentage class-by-class.
- **Calendar-Aware Scheduling:** Automatically syncs with the live UTU Academic Calendar API to safely skip official holidays (like Republic Day or Second Saturday) in your bunking projections.
- **Daily Simulator:** A daily checklist to toggle classes you plan to attend or skip, showing the real-time impact on your overall percentage by the end of the day.
- **PWA Ready:** Installable directly to your Android or iOS home screen for a native app experience.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Vanilla CSS (Glassmorphism UI)
- **Backend:** Node.js, Express, Axios, Cheerio (for HTML parsing and API proxying)
- **Storage:** Browser `localStorage` for auto-saving config and timetable data.

## 💻 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/M0neySSH/utu-skippie.git
   ```
2. Install dependencies for both the frontend and backend:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Start the backend proxy server:
   ```bash
   cd backend
   node server.js
   ```
4. Start the frontend Vite development server:
   ```bash
   cd frontend
   npm run dev
   ```

## 👨‍💻 Developer

Developed with ❤️ by Manish for UTU Students.
