import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const SimpleProfileTest = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px', borderRadius: '8px' }}>
      <h3>Simple Profile Test</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <h4>User Data Check:</h4>
        <p><strong>User ID:</strong> {user?.id || user?.user_id || 'Not found'}</p>
        <p><strong>User Name:</strong> {user?.full_name || user?.name || 'Not found'}</p>
        <p><strong>User Role:</strong> {user?.role || 'Not found'}</p>
        <p><strong>Profile Pic Field:</strong> {user?.profile_pic || 'Not found'}</p>
        <p><strong>Profile Picture Field:</strong> {user?.profile_picture || 'Not found'}</p>
        <p><strong>Avatar Field:</strong> {user?.avatar || 'Not found'}</p>
        <p><strong>Profile Image URL Field:</strong> {user?.profileImageUrl || 'Not found'}</p>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4>All User Fields:</h4>
        <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px', fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4>Profile Picture Test:</h4>
        {user?.profile_pic ? (
          <div>
            <p>✅ Profile picture found: {user.profile_pic}</p>
            <img 
              src={user.profile_pic.startsWith('http') ? user.profile_pic : `${process.env.REACT_APP_API_BASE_URL || 'https://scms-backend.up.railway.app'}/${user.profile_pic}`}
              alt="Profile" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', border: '2px solid #ccc' }}
              onError={(e) => {
                console.log('❌ Image failed to load:', e.target.src);
                e.target.style.border = '2px solid red';
                e.target.alt = 'Failed to load';
              }}
              onLoad={(e) => {
                console.log('✅ Image loaded successfully:', e.target.src);
                e.target.style.border = '2px solid green';
              }}
            />
          </div>
        ) : (
          <p>❌ No profile picture found in user data</p>
        )}
      </div>

      <div>
        <h4>Quick Actions:</h4>
        <button 
          onClick={() => {
            console.log('=== USER DATA DUMP ===');
            console.log('User object:', user);
            console.log('User keys:', Object.keys(user || {}));
            console.log('Profile pic:', user?.profile_pic);
            console.log('Profile picture:', user?.profile_picture);
            console.log('Avatar:', user?.avatar);
            alert('Check console for user data dump');
          }}
          style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Dump User Data to Console
        </button>
        
        <button 
          onClick={() => {
            const storedUser = localStorage.getItem('user');
            const scmsUser = localStorage.getItem('scms_logged_in_user');
            console.log('=== LOCAL STORAGE CHECK ===');
            console.log('user key:', storedUser);
            console.log('scms_logged_in_user key:', scmsUser);
            alert('Check console for localStorage data');
          }}
          style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Check LocalStorage
        </button>
      </div>
    </div>
  );
};

export default SimpleProfileTest;
