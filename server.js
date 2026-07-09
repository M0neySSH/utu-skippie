/**
 * Local dev server — mimics Vercel's /api routes so you can test locally.
 * Run: node server.js
 * Then in another terminal: npm run dev
 * Vite proxies /api requests to this server (localhost:3000).
 */

import express from 'express';
import attendanceHandler from './api/attendance.js';
import calendarHandler from './api/calendar.js';
import captchaHandler from './api/captcha.js';
import loginHandler from './api/login.js';

const app = express();
app.use(express.json());

app.all('/api/attendance', (req, res) => attendanceHandler(req, res));
app.all('/api/calendar', (req, res) => calendarHandler(req, res));
app.all('/api/captcha', (req, res) => captchaHandler(req, res));
app.all('/api/login', (req, res) => loginHandler(req, res));

app.listen(3000, () => {
    console.log('✅ Local API server running at http://localhost:3000');
    console.log('   Now run "npm run dev" in another terminal to start the frontend.');
});
