const axios = require('axios');

module.exports = async (req, res) => {
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
