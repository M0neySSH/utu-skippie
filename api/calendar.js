const axios = require('axios');

module.exports = async (req, res) => {
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

    // Better to allow GET for calendar
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

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
};
