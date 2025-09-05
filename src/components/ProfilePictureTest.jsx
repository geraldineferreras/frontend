import React, { useState } from 'react';

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
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://scms-backend.up.railway.app';
      fullProfilePicUrl = `${baseUrl}/${hasProfilePic}`;
      console.log('🔗 Constructed full URL from relative path:', fullProfilePicUrl);
    } else if (hasProfilePic.startsWith('data:')) {
      // Data URL - use as is
      fullProfilePicUrl = hasProfilePic;
      console.log('✅ Using data URL:', fullProfilePicUrl);
    } else {
      // Assume it's a filename in uploads directory
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://scms-backend.up.railway.app';
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
  
  // Show profile picture with fallback initials (avoid flicker)
  const [isLoaded, setIsLoaded] = useState(false);
  const initialsText = user?.full_name ? 
    user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 
    'U';

  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
      {/* Placeholder initials shown until image loads or if it errors */}
      {!isLoaded && (
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.max(12, size / 3)}px`,
            fontWeight: 'bold',
            color: 'white'
          }}
        >
          {initialsText}
        </div>
      )}

      <img
        src={fullProfilePicUrl}
        alt={`${user?.full_name || 'User'}'s profile`}
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 150ms ease-out',
          ...style
        }}
        onError={() => {
          console.log('Profile image failed to load:', fullProfilePicUrl);
          setIsLoaded(false);
        }}
        onLoad={() => {
          setIsLoaded(true);
          console.log('✅ Profile image loaded successfully from:', fullProfilePicUrl);
        }}
      />
    </div>
  );
};

export default ProfilePictureTest;
