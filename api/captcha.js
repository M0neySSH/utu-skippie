/**
 * /api/captcha.js  (Vercel Serverless Function)
 *
 * GET /api/captcha
 *
 * Starts a fresh login session for one student:
 *   1. GET /ViewDetail  → get __RequestVerificationToken (form field) + set __RequestVerificationToken_XXXXXX cookie
 *   2. GET /GetCaptchaimage → set ASP.NET_SessionId cookie + get captcha PNG bytes
 *
 * Returns JSON:
 * {
 *   success: true,
 *   captchaBase64: "data:image/jpeg;base64,...",   // show this to user
 *   sessionCookies: "...",   // raw Set-Cookie string, save in localStorage & send back on /api/login
 *   rft: "..."               // __RequestVerificationToken hidden field value, needed for login POST
 * }
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE = 'https://online.uktech.ac.in/ums/Student/Public';
const CORS_HEADERS = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Content-Type, Date',
};

export default async function handler(req, res) {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        // Step 1: GET /ViewDetail to get the initial CSRF token & cookie
        const viewDetailRes = await axios.get(`${BASE}/ViewDetail`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            maxRedirects: 5,
        });

        // Collect Set-Cookie headers from step 1
        const cookiesStep1 = viewDetailRes.headers['set-cookie'] || [];

        // Parse the RFT from the HTML form
        const $ = cheerio.load(viewDetailRes.data);
        const rft = $('input[name="__RequestVerificationToken"]').first().val();
        if (!rft) {
            return res.status(502).json({ error: 'Could not extract __RequestVerificationToken from UKTECH page.' });
        }

        // Build cookie string to send in next request
        const cookieHeader1 = cookiesStep1.map(c => c.split(';')[0]).join('; ');

        // Step 2: GET /GetCaptchaimage using step1 cookies → get ASP.NET_SessionId + captcha bytes
        const captchaRes = await axios.get(`https://online.uktech.ac.in/ums/Student/Master/GetCaptchaimage`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': `${BASE}/ViewDetail`,
                'Cookie': cookieHeader1,
            },
            responseType: 'arraybuffer',
            maxRedirects: 5,
        });

        const cookiesStep2 = captchaRes.headers['set-cookie'] || [];

        // Merge cookies from both steps: step2 may add ASP.NET_SessionId
        const allCookieMap = {};
        [...cookiesStep1, ...cookiesStep2].forEach(c => {
            const part = c.split(';')[0];
            const [name, ...rest] = part.split('=');
            allCookieMap[name.trim()] = rest.join('=').trim();
        });
        const mergedCookies = Object.entries(allCookieMap)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');

        // Encode captcha image to base64 data URL
        const captchaBase64 = `data:image/jpeg;base64,${Buffer.from(captchaRes.data).toString('base64')}`;

        return res.json({
            success: true,
            captchaBase64,
            sessionCookies: mergedCookies,
            rft,
        });

    } catch (error) {
        console.error('[captcha] Error:', error.message);
        return res.status(500).json({ error: 'Failed to initiate login session', details: error.message });
    }
}
