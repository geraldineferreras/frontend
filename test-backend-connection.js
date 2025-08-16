/**
 * Backend Connection Test Script
 * Use this to verify your backend Google OAuth endpoint is working
 */

const testBackendConnection = async () => {
  const API_BASE_URL = 'http://localhost/scms_new_backup/index.php/api';
  const GOOGLE_AUTH_ENDPOINT = `${API_BASE_URL}/auth/google`;
  
  // Test data matching your backend implementation
  const testData = {
    idToken: 'test_google_id_token_12345',
    email: 'test.user@gmail.com',
    name: 'Test Google User',
    firstName: 'Test',
    lastName: 'User',
    imageUrl: 'https://via.placeholder.com/150x150/4285f4/ffffff?text=TU',
    id: 'google_test_user_123'
  };
  
  console.log('🔍 Testing Backend Google OAuth Endpoint...');
  console.log('📍 Endpoint:', GOOGLE_AUTH_ENDPOINT);
  console.log('📤 Test Data:', testData);
  
  try {
    const response = await fetch(GOOGLE_AUTH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.json();
    console.log('📥 Response Data:', responseData);
    
    if (response.ok && responseData.status) {
      console.log('✅ SUCCESS: Backend endpoint is working!');
      console.log('🎫 Token received:', responseData.data?.token ? 'Yes' : 'No');
      console.log('👤 User data:', responseData.data?.user_id ? 'Yes' : 'No');
      console.log('🔐 Role assigned:', responseData.data?.role || 'None');
      
      return {
        success: true,
        data: responseData,
        message: 'Backend connection successful'
      };
    } else {
      console.log('❌ ERROR: Backend returned error');
      console.log('💬 Error message:', responseData.message);
      
      return {
        success: false,
        error: responseData.message || 'Unknown error',
        message: 'Backend error response'
      };
    }
  } catch (error) {
    console.log('💥 NETWORK ERROR:', error.message);
    console.log('🔧 Possible issues:');
    console.log('   - Backend server not running');
    console.log('   - CORS not configured properly');
    console.log('   - Endpoint URL incorrect');
    console.log('   - Network connectivity issues');
    
    return {
      success: false,
      error: error.message,
      message: 'Network or connection error'
    };
  }
};

// For browser console testing
if (typeof window !== 'undefined') {
  window.testBackendConnection = testBackendConnection;
  console.log('🧪 Backend test function loaded. Run: testBackendConnection()');
}

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testBackendConnection;
}

/**
 * Usage Instructions:
 * 
 * 1. In Browser Console:
 *    - Open Developer Tools (F12)
 *    - Go to Console tab
 *    - Copy and paste this entire script
 *    - Run: testBackendConnection()
 * 
 * 2. As Node.js Script:
 *    - Install node-fetch: npm install node-fetch
 *    - Run: node test-backend-connection.js
 * 
 * 3. Expected Success Response:
 *    {
 *      "status": true,
 *      "message": "Google sign-in successful",
 *      "data": {
 *        "token": "jwt_token_here",
 *        "user_id": "STU123456",
 *        "role": "student",
 *        "email": "test.user@gmail.com",
 *        "full_name": "Test Google User",
 *        "auth_provider": "google"
 *      }
 *    }
 * 
 * 4. Common Issues:
 *    - 500 Error: Backend endpoint not implemented
 *    - CORS Error: Missing CORS headers in backend
 *    - 404 Error: Incorrect endpoint URL
 *    - Network Error: Backend server not running
 */
