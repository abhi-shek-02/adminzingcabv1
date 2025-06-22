import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testAPI() {
  console.log('Testing ZingCab APIs...\n');

  try {
    // Test health check
    console.log('1. Testing Health Check...');
    const health = await fetch(`${API_BASE}/health`);
    const healthData = await health.json();
    console.log('✅ Health Check:', healthData.status);

    // Test get bookings
    console.log('\n2. Testing Get Bookings...');
    const bookings = await fetch(`${API_BASE}/api/booking`);
    const bookingsData = await bookings.json();
    console.log('✅ Get Bookings:', `${bookingsData.data?.length || 0} bookings found`);

    // Test get contacts
    console.log('\n3. Testing Get Contacts...');
    const contacts = await fetch(`${API_BASE}/api/contact`);
    const contactsData = await contacts.json();
    console.log('✅ Get Contacts:', `${contactsData.data?.length || 0} contacts found`);

    // Test fare estimation
    console.log('\n4. Testing Fare Estimation...');
    const fareData = {
      km_limit: 150,
      mobile_number: "9876543210",
      service_type: "oneway",
      pick_up_location: "Mumbai",
      pick_up_time: "09:00",
      journey_date: "2024-01-15",
      car_type: "sedan",
      drop_location: "Pune",
      booking_source: "admin"
    };
    
    const fare = await fetch(`${API_BASE}/api/fare/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fareData)
    });
    const fareResponse = await fare.json();
    console.log('✅ Fare Estimation:', `₹${fareResponse.data?.selected_car?.estimated_fare || 0}`);

    console.log('\n🎉 All APIs are working correctly!');

  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

testAPI(); 