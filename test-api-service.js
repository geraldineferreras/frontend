// Simple test to verify API service is working
import ApiService from './src/services/api.js';

console.log('🧪 Testing API Service...');

// Test if ApiService is properly imported
console.log('ApiService:', ApiService);
console.log('ApiService type:', typeof ApiService);

// Test if methods exist
console.log('get2FAStatus exists:', typeof ApiService.get2FAStatus);
console.log('enable2FA exists:', typeof ApiService.enable2FA);
console.log('validate2FACode exists:', typeof ApiService.validate2FACode);
console.log('disable2FA exists:', typeof ApiService.disable2FA);

// Test getToken method
console.log('getToken exists:', typeof ApiService.getToken);

console.log('✅ API Service test complete!');
