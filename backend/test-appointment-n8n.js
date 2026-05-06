#!/usr/bin/env node

// Simple test script to create appointment and trigger n8n workflow
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testAppointmentWithN8n() {
  try {
    console.log('🧪 Testing appointment creation with n8n integration...');

    // Step 1: Create a test patient account
    console.log('\n📝 Creating test patient account...');
    const patientData = {
      email: 'patient@test.com',
      password: 'Patient123!',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      dateOfBirth: '1990-01-01',
      address: '123 Test Street'
    };

    try {
      const patientResponse = await axios.post(`${API_BASE_URL}/patients`, patientData);
      console.log('✅ Patient account created successfully');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️  Patient account already exists');
      } else {
        console.log('⚠️  Patient creation failed:', error.response?.data || error.message);
      }
    }

    // Step 2: Login as patient
    console.log('\n🔐 Logging in as patient...');
    let authToken;
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/patient-login`, {
        email: 'patient@test.com',
        password: 'Patient123!'
      });
      authToken = loginResponse.data.access_token;
      console.log('✅ Login successful');
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data || error.message);
      return;
    }

    // Step 3: Create appointment
    console.log('\n📅 Creating appointment...');
    const appointmentData = {
      doctorId: '507f1f77bcf86cd799439013',
      doctorName: 'Dr. Smith',
      title: 'Regular Checkup',
      date: '2026-05-15',
      time: '10:30',
      type: 'checkup',
      reason: 'Annual physical examination',
      notes: 'Patient reports mild headaches',
      location: 'Main Clinic',
      requestedDate: '2026-05-15',
      requestedTime: '10:30',
      patientMessage: 'Need regular checkup'
    };

    try {
      const appointmentResponse = await axios.post(
        `${API_BASE_URL}/appointments`,
        appointmentData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Appointment created successfully!');
      console.log('📋 Appointment ID:', appointmentResponse.data._id);
      console.log('📊 Status:', appointmentResponse.data.status);
      
      // Step 4: Check n8n connection
      console.log('\n🔗 Testing n8n connection...');
      try {
        const n8nResponse = await axios.get(`${API_BASE_URL}/n8n/status`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        console.log('✅ n8n connection status:', n8nResponse.data);
      } catch (error) {
        console.log('⚠️  n8n connection test failed:', error.response?.data || error.message);
      }

      console.log('\n🎉 Test completed! Check your n8n dashboard for workflow executions.');
      
    } catch (error) {
      console.log('❌ Appointment creation failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAppointmentWithN8n();
