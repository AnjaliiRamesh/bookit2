const axios = require('axios');

// 1. CONFIGURE YOUR LOCAL ENVIRONMENT PATH VARIABLES HERE:
const API_URL = 'http://localhost:5000/api/v1';

// PASTE YOUR COLLECTED DATA HERE:
const TARGET_EVENT_ID = '2fb210a0-7d39-4803-84e8-3391a35b4c5e'; 
const USER_A_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMmJmM2UzNy0yMGM2LTRmZTAtYjE5Ni1lZmU4ZThiMzUyZTEiLCJlbWFpbCI6ImF0dGVuZGVlQHVzZXIuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3ODI2NDE0ODksImV4cCI6MTc4MjcyNzg4OX0.5u-zvgzg46ntMEueW-pe6bfKP2d1yFjvEIjvWdpRoSY';
const USER_B_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NTRkMGRhZS1iMGYxLTQ0MDktOTBiZS1hNzU1ZDM5NWQwZDQiLCJlbWFpbCI6ImNvZGV0YW5rczkxMUBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc4MjY0MTQzNSwiZXhwIjoxNzgyNzI3ODM1fQ.gD95nPCCrRozACYREaNpmly_iLnrzcIjog3ogOZ5RVk';

async function fireSimultaneousBookings() {
  console.log('🚀 Preparing to fire concurrent race condition booking requests...');

  // Setup separate request configurations representing distinct authenticated users
  const requestA = axios.post(
    `${API_URL}/bookings`, 
    { eventId: TARGET_EVENT_ID }, 
    { headers: { Authorization: `Bearer ${USER_A_TOKEN}` } }
  );

  const requestB = axios.post(
    `${API_URL}/bookings`, 
    { eventId: TARGET_EVENT_ID }, 
    { headers: { Authorization: `Bearer ${USER_B_TOKEN}` } }
  );

  console.log('⚡ Firing both requests simultaneously to the server pool...');
  
  // Promise.all settled forces Node to release both requests down the network channel at the same instant
  const results = await Promise.allSettled([requestA, requestB]);

  console.log('\n📊 --- CONCURRENCY RESULT REPORT ---');
  results.forEach((result, idx) => {
    const userLabel = idx === 0 ? 'User A (Attendee 1)' : 'User B (Attendee 2)';
    
    if (result.status === 'fulfilled') {
      console.log(`✅ ${userLabel}: SUCCESSFUL BOOKING!`);
      console.log(`   Status Code: ${result.value.status}`);
      console.log(`   Payload Details:`, JSON.stringify(result.value.data.data || result.value.data));
    } else {
      console.log(`❌ ${userLabel}: REJECTED BARS APPLIED!`);
      console.log(`   Status Code: ${result.reason.response?.status}`);
      console.log(`   Server Message Error:`, JSON.stringify(result.reason.response?.data || result.reason.message));
    }
  });
}

fireSimultaneousBookings();