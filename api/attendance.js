import axios from 'axios';
import * as cheerio from 'cheerio';

const ENDPOINT = "https://online.uktech.ac.in/ums/Student/Public/ShowStudentAttendanceListByRollNoDOB";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests for this endpoint
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        let payload = req.body;
        if (typeof payload === 'string') {
            payload = JSON.parse(payload);
        }
        payload = payload || {};

        // Basic validation
        const requiredFields = [
            'BranchId', 'CourseBranchDurationId', 'StudentAdmissionId',
            'SessionYear', 'RollNo', 'MonthId'
        ];

        for (const field of requiredFields) {
            if (!payload[field]) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        // Full Payload mapping
        const requestPayload = {
            "CollegeId": 67, // Dr. APJ AKIT, Tanakpur
            "CourseId": 1, // B.Tech
            "BranchId": parseInt(payload.BranchId),
            "CourseBranchDurationId": parseInt(payload.CourseBranchDurationId),
            "StudentAdmissionId": parseInt(payload.StudentAdmissionId),
            "DateOfBirth": "",
            "SessionYear": parseInt(payload.SessionYear),
            "RollNo": payload.RollNo,
            "Year": parseInt(payload.SessionYear),
            "MonthId": parseInt(payload.MonthId)
        };

        const response = await axios.post(ENDPOINT, requestPayload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        const month = parseInt(payload.MonthId);
        const month_total_days = [1, 3, 5, 7, 8, 10, 12].includes(month) ? 31 : (month === 2 ? 28 : 30);

        const parsedData = [];

        $('table tbody tr').each((i, row) => {
            const cells = $(row).find('td');
            if (cells.length < month_total_days + 3) return;

            const rawCells = [];
            cells.each((j, cell) => {
                rawCells.push($(cell).text().trim());
            });

            const subject = rawCells[0];
            const attendance = rawCells.slice(1, -3);
            const total_taken = rawCells.slice(-3, -1);
            const percentage = rawCells[rawCells.length - 1];

            const mapped_attendance = attendance.map(a => {
                if (a === "P") return 1;
                if (a === "A") return -1;
                if (a === "L") return 0;
                if (a === "P, P" || a === "P,P") return 2;
                if (a === "A, A" || a === "A,A") return -2;
                return null;
            });

            parsedData.push({
                subject,
                attendance: mapped_attendance,
                total: total_taken,
                percentage
            });
        });

        res.json({ success: true, data: parsedData });
    } catch (error) {
        console.error("Error fetching attendance:", error.message);
        res.status(500).json({ error: 'Failed to fetch attendance data from UKTECH', details: error.message });
    }
};
