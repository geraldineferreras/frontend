import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfilePictureUrl, getUserInitials, getAvatarColor } from '../utils/profilePictureUtils';
import ApiService from '../services/api';

const ProfilePictureDebug = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        console.log('=== DEBUG: Fetching user profile ===');
        console.log('Auth user:', user);
        
        // Try getProfile
        const response = await ApiService.getProfile();
        console.log('getProfile response:', response);
        
        if (response && response.status) {
          setUserProfile(response.data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const currentUser = userProfile || user;
  const profilePictureUrl = getProfilePictureUrl(currentUser);
  const userInitials = getUserInitials(currentUser);
  const avatarColor = getAvatarColor(currentUser);

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', margin: '20px', borderRadius: '8px' }}>
      <h3>Profile Picture Debug</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Auth Context User:</h4>
        <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Fetched Profile:</h4>
        <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
          {JSON.stringify(userProfile, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Current User (used for display):</h4>
        <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
          {JSON.stringify(currentUser, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Profile Picture Analysis:</h4>
        <ul>
          <li><strong>Profile Picture URL:</strong> {profilePictureUrl || 'null'}</li>
          <li><strong>User Initials:</strong> {userInitials}</li>
          <li><strong>Avatar Color:</strong> {avatarColor}</li>
          <li><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Profile Picture Display:</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <h5>Profile Picture (if available):</h5>
            {profilePictureUrl ? (
              <img 
                src={profilePictureUrl} 
                alt="Profile" 
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: '2px solid #ccc'
                }}
                onError={(e) => {
                  console.log('Image failed to load:', e.target.src);
                  e.target.style.display = 'none';
                }}
                onLoad={(e) => {
                  console.log('Image loaded successfully:', e.target.src);
                }}
              />
            ) : (
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                backgroundColor: '#ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666'
              }}>
                No Image
              </div>
            )}
          </div>
          
          <div>
            <h5>Fallback Avatar:</h5>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              backgroundColor: avatarColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              {userInitials}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4>API Test Buttons:</h4>
        <button 
          onClick={async () => {
            try {
              const response = await ApiService.getProfile();
              console.log('Manual getProfile test:', response);
              alert('Check console for getProfile response');
            } catch (error) {
              console.error('Manual getProfile error:', error);
              alert('getProfile failed - check console');
            }
          }}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Test getProfile
        </button>
        
        {user && user.id && user.role && (
          <button 
            onClick={async () => {
              try {
                const response = await ApiService.getUserById(user.id, user.role);
                console.log('Manual getUserById test:', response);
                alert('Check console for getUserById response');
              } catch (error) {
                console.error('Manual getUserById error:', error);
                alert('getUserById failed - check console');
              }
            }}
            style={{ padding: '8px 16px' }}
          >
            Test getUserById
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePictureDebug;
