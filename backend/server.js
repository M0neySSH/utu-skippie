const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static React files directly from backend proxy
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const ENDPOINT = "https://online.uktech.ac.in/ums/Student/Public/ShowStudentAttendanceListByRollNoDOB";

app.post('/api/attendance', async (req, res) => {
    try {
        const payload = req.body;

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
});

app.get('/api/calendar', async (req, res) => {
    try {
        const response = await axios.post('https://uktech.ac.in/Services/Service.asmx/GetAllEventCalendar', { WebDeptId: 1 }, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });

        let events = [];
        if (response.data && response.data.d) {
            events = JSON.parse(response.data.d);
        }
        res.json({ success: true, data: events });
    } catch (error) {
        console.error("Error fetching academic calendar:", error.message);
        res.status(500).json({ error: 'Failed to fetch academic calendar from UKTECH', details: error.message });
    }
});

// Any unmatched routes should serve index.html (Local Dev Fallback)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`UKTECH proxy server and App running on http://127.0.0.1:${PORT} and http://localhost:${PORT}`);
    });
}

module.exports = app;
