// Quick test script to debug notification issues
// Run this in your browser console on your SCMS app

console.log('🔍 Starting notification debug test...');

// Step 1: Check localStorage
console.log('📱 Step 1: Checking localStorage...');
const user = localStorage.getItem('user');
const token = localStorage.getItem('token');

console.log('User data:', user);
console.log('Token:', token ? token.substring(0, 50) + '...' : 'NOT FOUND');

if (!user || !token) {
    console.error('❌ Missing user data or token in localStorage');
    console.log('Please make sure you are logged in properly');
} else {
    // Step 2: Parse user data
    console.log('📱 Step 2: Parsing user data...');
    try {
        const userObj = JSON.parse(user);
        const userId = userObj.user_id || userObj.id;
        console.log('Parsed user object:', userObj);
        console.log('Extracted user ID:', userId);
        
        if (!userId) {
            console.error('❌ No user ID found in user object');
            console.log('User object keys:', Object.keys(userObj));
        } else {
            // Step 3: Test API call
            console.log('📡 Step 3: Testing API call...');
            
            fetch(`https://scms-backend.up.railway.app/api/notifications?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                console.log('API Response Status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('API Response Data:', data);
                
                if (data.success && data.data) {
                    const notifications = Array.isArray(data.data) ? data.data : [];
                    console.log(`✅ Found ${notifications.length} notifications`);
                    
                    if (notifications.length > 0) {
                        console.log('📋 Notifications:');
                        notifications.forEach((n, i) => {
                            console.log(`${i+1}. [${n.is_read ? 'READ' : 'UNREAD'}] ${n.title}`);
                            console.log(`   Message: ${n.message}`);
                            console.log(`   Type: ${n.type}`);
                            console.log(`   Created: ${n.created_at}`);
                        });
                        
                        console.log('🎯 CONCLUSION: Backend has notifications, frontend issue!');
                        console.log('🔧 Check your notification components for bugs');
                    } else {
                        console.log('⚠️  No notifications found in response');
                        console.log('🔧 Check if user ID matches database records');
                    }
                } else {
                    console.log('❌ API returned success: false or no data');
                    console.log('Response:', data);
                }
            })
            .catch(error => {
                console.error('❌ API call failed:', error);
                console.log('🔧 Check network connection and backend status');
            });
        }
    } catch (error) {
        console.error('❌ Error parsing user data:', error);
    }
}

console.log('🔍 Debug test complete. Check the results above.');

