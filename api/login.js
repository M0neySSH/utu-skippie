/**
 * /api/login.js  (Vercel Serverless Function)
 *
 * POST /api/login
 *
 * Body (JSON):
 * {
 *   sessionCookies: "...",    // from /api/captcha response
 *   rft: "...",               // from /api/captcha response
 *   rollNo: "...",
 *   dateOfBirth: "DD/MM/YYYY",
 *   captcha: "...",           // user-entered captcha text
 * }
 *
 * Returns JSON on SUCCESS:
 * {
 *   success: true,
 *   sessionCookies: "...",   // NEW cookies — save to localStorage
 *   rft: "...",              // NEW __RequestVerificationToken — save to localStorage
 *   token: "...",            // student Token — save to localStorage (stable per student)
 * }
 *
 * Returns JSON on CAPTCHA/CREDENTIAL ERROR:
 * {
 *   success: false,
 *   reason: "INVALID_CAPTCHA" | "INVALID_CREDENTIALS"
 * }
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

const LOGIN_URL = 'https://online.uktech.ac.in/ums/Student/Public/ViewDetail';
const CORS_HEADERS = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Content-Type, Date',
};

export default async function handler(req, res) {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        let body = req.body;
        if (typeof body === 'string') body = JSON.parse(body);

        const { sessionCookies, rft, rollNo, dateOfBirth, captcha } = body;
        if (!sessionCookies || !rft || !rollNo || !dateOfBirth || !captcha) {
            return res.status(400).json({ error: 'Missing required fields: sessionCookies, rft, rollNo, dateOfBirth, captcha' });
        }

        // POST login form
        const formData = new URLSearchParams({
            '__RequestVerificationToken': rft,
            'RollNo': rollNo,
            'DateOfBirth': dateOfBirth,
            'Captcha': captcha,
            'btnSubmit': 'Login',
        });

        const loginRes = await axios.post(LOGIN_URL, formData.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': LOGIN_URL,
                'Cookie': sessionCookies,
            },
            maxRedirects: 5,
            validateStatus: () => true, // don't throw on non-2xx
        });

        // UKTECH returns 200 even on failure, need to inspect HTML
        const $ = cheerio.load(loginRes.data);

        // Check for error messages (wrong captcha / wrong credentials)
        const errorMsg = $('.alert-danger, .validation-summary-errors, .field-validation-error').text().trim();
        if (errorMsg) {
            // Determine what went wrong
            const reason = errorMsg.toLowerCase().includes('captcha') ? 'INVALID_CAPTCHA' : 'INVALID_CREDENTIALS';
            return res.json({ success: false, reason, message: errorMsg });
        }

        // Extract the new RFT and Token from the logged-in page
        const newRft = $('input[name="__RequestVerificationToken"]').first().val();
        const token = $('input#Token').val() || $('input[name="Token"]').val();

        if (!token) {
            // If no token found, login likely failed silently
            return res.json({ success: false, reason: 'INVALID_CREDENTIALS', message: 'Login failed — Token not found in response.' });
        }

        // Collect new session cookies from login response
        const newCookies = loginRes.headers['set-cookie'] || [];

        // Merge with old cookies (login response may not re-set all cookies)
        const cookieMap = {};
        sessionCookies.split(';').forEach(c => {
            const [k, ...rest] = c.trim().split('=');
            if (k) cookieMap[k.trim()] = rest.join('=').trim();
        });
        newCookies.forEach(c => {
            const part = c.split(';')[0];
            const [k, ...rest] = part.split('=');
            cookieMap[k.trim()] = rest.join('=').trim();
        });
        const mergedCookies = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join('; ');

        return res.json({
            success: true,
            sessionCookies: mergedCookies,
            rft: newRft,
            token,
        });

    } catch (error) {
        console.error('[login] Error:', error.message);
        return res.status(500).json({ error: 'Login request failed', details: error.message });
    }
}
