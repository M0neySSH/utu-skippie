/**
 * /api/attendance.js  (Vercel Serverless Function)
 *
 * POST /api/attendance
 *
 * Body (JSON):
 * {
 *   sessionCookies: "...",              // from localStorage (set after login)
 *   rft: "...",                         // __RequestVerificationToken (from localStorage)
 *   token: "...",                       // student Token (from localStorage, stable)
 *   SessionYear: "2025",
 *   CourseBranchDurationId: "6",
 *   Year: "2026",
 *   MonthId: "5",
 * }
 *
 * Returns on SUCCESS:
 * { success: true, data: [...] }
 *
 * Returns on SESSION EXPIRED:
 * { success: false, reason: "SESSION_EXPIRED" }
 * --> Frontend should trigger re-login flow then retry
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

const ENDPOINT = 'https://online.uktech.ac.in/ums/Student/Public/ShowStudentAttendanceListByRollNoDOB';
const CORS_HEADERS = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Content-Type, Date',
};

// Shared HTML parser — unchanged attendance cell logic
function parseAttendanceHTML(html, monthId) {
    const $ = cheerio.load(html);
    const month = parseInt(monthId);
    const month_total_days = [1, 3, 5, 7, 8, 10, 12].includes(month) ? 31 : (month === 2 ? 28 : 30);

    const parsedData = [];

    $('table tbody tr').each((i, row) => {
        const cells = $(row).find('td');
        if (cells.length < month_total_days + 3) return;

        const rawCells = [];
        cells.each((j, cell) => rawCells.push($(cell).text().trim()));

        const subject = rawCells[0];
        const attendance = rawCells.slice(1, -3);
        const total_taken = rawCells.slice(-3, -1);
        const percentage = rawCells[rawCells.length - 1];

        const mapped_attendance = attendance.map(a => {
            if (a === 'P') return 1;
            if (a === 'A') return -1;
            if (a === 'L') return 0;
            if (a === 'P, P' || a === 'P,P') return 2;
            if (a === 'A, A' || a === 'A,A') return -2;
            if (a === 'P, A' || a === 'P,A' || a === 'A, P' || a === 'A,P') return 3;
            if (a === 'P, L' || a === 'P,L' || a === 'L, P' || a === 'L,P') return 4;
            if (a === 'A, L' || a === 'A,L' || a === 'L, A' || a === 'L,A') return 5;
            if (a === 'L, L' || a === 'L,L') return 6;
            return null;
        });

        parsedData.push({ subject, attendance: mapped_attendance, total: total_taken, percentage });
    });

    return parsedData;
}

// Checks if the HTML response is a valid attendance table (not a redirect/error page)
function isValidAttendanceResponse(html) {
    const $ = cheerio.load(html);
    // If UKTECH session expired it typically redirects to login page or shows no table
    const hasTable = $('table tbody tr').length > 0;
    const isLoginPage = $('input[name="RollNo"]').length > 0 || html.includes('btnSubmit');
    return hasTable && !isLoginPage;
}

export default async function handler(req, res) {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        let payload = req.body;
        if (typeof payload === 'string') payload = JSON.parse(payload);
        payload = payload || {};

        const { sessionCookies, rft, token, SessionYear, CourseBranchDurationId, Year, MonthId } = payload;

        if (!sessionCookies || !rft || !token || !SessionYear || !CourseBranchDurationId || !MonthId) {
            return res.status(400).json({
                error: 'Missing required fields: sessionCookies, rft, token, SessionYear, CourseBranchDurationId, MonthId'
            });
        }

        const formData = new URLSearchParams({
            '__RequestVerificationToken': rft,
            'Token': token,
            'SessionYear': SessionYear,
            'CourseBranchDurationId': CourseBranchDurationId,
            'Year': Year || SessionYear,
            'MonthId': MonthId,
        });

        const response = await axios.post(ENDPOINT, formData.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://online.uktech.ac.in/ums/Student/Public/ViewDetail',
                'Cookie': sessionCookies,
            },
            maxRedirects: 5,
            validateStatus: () => true,
        });

        const html = response.data;

        // Check if session has expired
        if (!isValidAttendanceResponse(html)) {
            return res.json({ success: false, reason: 'SESSION_EXPIRED' });
        }

        const data = parseAttendanceHTML(html, MonthId);
        return res.json({ success: true, data });

    } catch (error) {
        console.error('[attendance] Error:', error.message);
        return res.status(500).json({ error: 'Failed to fetch attendance data from UKTECH', details: error.message });
    }
}
