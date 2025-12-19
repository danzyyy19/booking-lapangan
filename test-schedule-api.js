// Debug script to test schedule API response
const API_URL = 'https://fields.danzyy.my.id/api/schedule';

async function testScheduleAPI() {
    // Get all fields first
    const fieldsRes = await fetch('https://fields.danzyy.my.id/api/fields');
    const fieldsData = await fieldsRes.json();

    console.log('=== TESTING SCHEDULE API ===\n');

    // Test each field for today's date
    const today = new Date().toISOString().split('T')[0];

    for (const field of fieldsData.fields.slice(0, 3)) { // Test first 3 fields
        console.log(`\n--- ${field.name} ---`);
        console.log(`Field ID: ${field.id}`);
        console.log(`Date: ${today}`);

        const url = `${API_URL}?fieldId=${field.id}&date=${today}`;
        const res = await fetch(url);
        const data = await res.json();

        console.log(`\nBookings array length: ${data.bookings?.length || 0}`);
        console.log(`Bookings:`, data.bookings);

        console.log(`\nSchedule array length: ${data.schedule?.length || 0}`);
        const availableSlots = data.schedule?.filter(s => s.available).length || 0;
        const unavailableSlots = data.schedule?.filter(s => !s.available).length || 0;

        console.log(`Available slots: ${availableSlots}`);
        console.log(`Unavailable slots: ${unavailableSlots}`);

        // Show first 5 unavailable slots
        const unavailable = data.schedule?.filter(s => !s.available).slice(0, 5);
        if (unavailable?.length > 0) {
            console.log(`\n First ${unavailable.length} unavailable slots:`);
            unavailable.forEach(slot => {
                console.log(`  - ${slot.time}: available=${slot.available}, isPast=${slot.isPast}, booking=${JSON.stringify(slot.booking)}`);
            });
        }

        console.log('\n' + '='.repeat(50));
    }
}

testScheduleAPI().catch(console.error);
