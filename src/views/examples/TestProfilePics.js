import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api';

const TestProfilePics = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        console.log('=== TEST: Fetching Teachers ===');
        
        const response = await ApiService.getTeachers();
        console.log('Raw API response:', response);
        console.log('Response type:', typeof response);
        console.log('Response is array:', Array.isArray(response));
        
        // Handle different response structures
        const teachersData = response.data || response.data?.data || response || [];
        console.log('Processed teachers data:', teachersData);
        
        // Normalize teacher data
        const normalizedTeachers = teachersData.map(teacher => {
          console.log('=== Processing Teacher ===');
          console.log('Original teacher:', teacher);
          console.log('All keys:', Object.keys(teacher));
          console.log('Profile pic value:', teacher.profile_pic);
          console.log('Profile pic type:', typeof teacher.profile_pic);
          
          const normalized = {
            ...teacher,
            id: teacher.id || teacher.user_id || teacher.userId || '',
            full_name: teacher.full_name || teacher.name || '',
            email: teacher.email || '',
            profile_pic: teacher.profile_pic || teacher.profileImageUrl || teacher.avatar || '',
          };
          
          console.log('Normalized teacher:', normalized);
          console.log('Final profile_pic:', normalized.profile_pic);
          console.log('========================');
          
          return normalized;
        });
        
        setTeachers(normalizedTeachers);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const getAvatarUrl = (teacher) => {
    console.log('=== Getting Avatar URL ===');
    console.log('Teacher:', teacher);
    console.log('Profile pic:', teacher.profile_pic);
    
    let avatarUrl = 'https://via.placeholder.com/50x50?text=Default';
    
    if (teacher.profile_pic) {
      if (teacher.profile_pic.startsWith('uploads/')) {
        avatarUrl = `http://localhost/scms_new/${teacher.profile_pic}`;
        console.log('Constructed uploads URL:', avatarUrl);
      } else {
        avatarUrl = teacher.profile_pic;
        console.log('Using original profile_pic:', avatarUrl);
      }
    } else {
      console.log('No profile_pic found, using default');
    }
    
    console.log('Final avatar URL:', avatarUrl);
    console.log('========================');
    
    return avatarUrl;
  };

  if (loading) return <div>Loading teachers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test Profile Pictures</h2>
      <p>Total teachers: {teachers.length}</p>
      
      {teachers.map((teacher, index) => (
        <div key={teacher.id || index} style={{ 
          border: '1px solid #ccc', 
          margin: '10px 0', 
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <img
            src={getAvatarUrl(teacher)}
            alt={teacher.full_name}
            style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
            onLoad={() => console.log(`Image loaded successfully for ${teacher.full_name}:`, getAvatarUrl(teacher))}
            onError={(e) => {
              console.log(`Image failed to load for ${teacher.full_name}:`, getAvatarUrl(teacher));
              e.target.src = 'https://via.placeholder.com/50x50?text=Error';
            }}
          />
          <div>
            <h4>{teacher.full_name}</h4>
            <p>{teacher.email}</p>
            <p><strong>Profile Pic:</strong> {teacher.profile_pic || 'None'}</p>
            <p><strong>Avatar URL:</strong> {getAvatarUrl(teacher)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestProfilePics; 