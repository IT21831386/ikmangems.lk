// Test script for verification endpoints
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123'
};

async function testVerificationEndpoints() {
  console.log('🧪 Testing Verification Endpoints...\n');

  try {
    // Test 1: Login to get auth token
    console.log('1. Testing login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed - make sure user exists');
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');

    // Test 2: Get verification status
    console.log('\n2. Testing verification status...');
    const statusResponse = await fetch(`${API_BASE}/verification/status`, {
      method: 'GET',
      headers: {
        'Cookie': loginResponse.headers.get('set-cookie') || '',
        'Content-Type': 'application/json',
      },
    });

    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ Verification status retrieved:', statusData);
    } else {
      console.log('❌ Failed to get verification status');
    }

    // Test 3: Test NIC status
    console.log('\n3. Testing NIC status...');
    const nicResponse = await fetch(`${API_BASE}/nic/status`, {
      method: 'GET',
      headers: {
        'Cookie': loginResponse.headers.get('set-cookie') || '',
        'Content-Type': 'application/json',
      },
    });

    if (nicResponse.ok) {
      const nicData = await nicResponse.json();
      console.log('✅ NIC status retrieved:', nicData);
    } else {
      console.log('❌ Failed to get NIC status');
    }

    console.log('\n🎉 Verification endpoints test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testVerificationEndpoints();

