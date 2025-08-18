import React from 'react';

const ProfilePictureTest = ({ user, size = 40, className = "", style = {} }) => {
  // Check for profile picture in multiple possible field names
  const hasProfilePic = user?.profile_image_url || 
                       user?.profile_pic || 
                       user?.profileImageUrl || 
                       user?.imageUrl || 
                       user?.avatar || 
                       user?.user_avatar || 
                       user?.profile_picture;
  
  // Construct the full URL if we have a relative path
  let fullProfilePicUrl = null;
  if (hasProfilePic) {
    if (hasProfilePic.startsWith('http://') || hasProfilePic.startsWith('https://')) {
      // Full URL - use as is
      fullProfilePicUrl = hasProfilePic;
      console.log('✅ Using full URL:', fullProfilePicUrl);
    } else if (hasProfilePic.startsWith('uploads/')) {
      // Relative path - construct full URL
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost/scms_new_backup';
      fullProfilePicUrl = `${baseUrl}/${hasProfilePic}`;
      console.log('🔗 Constructed full URL from relative path:', fullProfilePicUrl);
    } else if (hasProfilePic.startsWith('data:')) {
      // Data URL - use as is
      fullProfilePicUrl = hasProfilePic;
      console.log('✅ Using data URL:', fullProfilePicUrl);
    } else {
      // Assume it's a filename in uploads directory
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost/scms_new_backup';
      fullProfilePicUrl = `${baseUrl}/uploads/profile/${hasProfilePic}`;
      console.log('🔗 Constructed full URL from filename:', fullProfilePicUrl);
    }
  }
  
  if (!fullProfilePicUrl) {
    // Show initials
    const initials = user?.full_name ? 
      user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 
      'U';
    
    return (
      <div 
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: '#5e72e4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${Math.max(12, size / 3)}px`,
          fontWeight: 'bold',
          color: 'white',
          ...style
        }}
      >
        {initials}
      </div>
    );
  }
  
  // Show profile picture with fallback initials
  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
      <img
        src={fullProfilePicUrl}
        alt={`${user?.full_name || 'User'}'s profile`}
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          ...style
        }}
        onError={(e) => {
          console.log('Profile image failed to load:', fullProfilePicUrl);
          // Hide the failed image and show initials
          e.target.style.display = 'none';
          const initialsDiv = e.target.parentElement.querySelector('.fallback-initials');
          if (initialsDiv) {
            initialsDiv.style.display = 'flex';
          }
        }}
        onLoad={() => {
          console.log('✅ Profile image loaded successfully from:', fullProfilePicUrl);
        }}
      />
      
      {/* Fallback initials (hidden by default, shown on image error) */}
      <div
        className="fallback-initials"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: '#5e72e4',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${Math.max(12, size / 3)}px`,
          fontWeight: 'bold',
          color: 'white'
        }}
      >
        {user?.full_name ? 
          user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 
          'U'
        }
      </div>
    </div>
  );
};

export default ProfilePictureTest;
