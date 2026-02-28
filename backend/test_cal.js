const axios = require('axios');

async function testPayload() {
    try {
        const res = await axios.post('https://uktech.ac.in/Services/Service.asmx/GetAllEventCalendar', { WebDeptId: 1 }, {
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
        console.log("SUCCESS");
        console.log(JSON.stringify(res.data).substring(0, 500));
        return true;
    } catch (e) {
        console.log("FAIL");
        console.log(e.response ? e.response.status : e.message);
        return false;
    }
}
testPayload();
