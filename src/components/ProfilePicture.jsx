import React from 'react';
import { getProfilePictureUrl, getUserInitials, getAvatarColor } from '../utils/profilePictureUtils';

/**
 * Reusable ProfilePicture component that handles Google OAuth and local profile pictures
 * @param {Object} user - User object containing profile information
 * @param {number} size - Size of the profile picture in pixels (default: 40)
 * @param {string} className - Additional CSS classes
 * @param {Object} style - Additional inline styles
 * @param {boolean} showFallback - Whether to show initials fallback (default: true)
 */
const ProfilePicture = ({ 
  user, 
  size = 40, 
  className = "", 
  style = {}, 
  showFallback = true 
}) => {
  const profilePictureUrl = getProfilePictureUrl(user);
  const userInitials = getUserInitials(user);
  const avatarColor = getAvatarColor(user);

  // Debug logging
  console.log('🖼️ ProfilePicture Component:', {
    user: user?.email || user?.full_name,
    profile_image_url: user?.profile_image_url,
    profilePictureUrl: profilePictureUrl,
    userInitials: userInitials,
    avatarColor: avatarColor,
    hasRealProfilePic: profilePictureUrl && profilePictureUrl !== '',
    size: size
  });

  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'inline-block',
    position: 'relative',
    ...style
  };

  // Check if we have a real profile picture
  const hasRealProfilePic = profilePictureUrl && profilePictureUrl !== '';

  // If no real profile picture, show initials directly
  if (!hasRealProfilePic && showFallback) {
    console.log('🔄 No real profile picture, showing initials directly:', {
      profilePictureUrl,
      userInitials,
      avatarColor
    });
    return (
      <div className={`profile-picture ${className}`} style={containerStyle}>
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: avatarColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.max(12, size / 3)}px`,
            fontWeight: 'bold',
            color: 'white',
            borderRadius: '50%'
          }}
        >
          {userInitials}
        </div>
      </div>
    );
  }

  // If we have a real profile picture, try to load it with fallback
  console.log('🔄 Has real profile picture, trying to load:', profilePictureUrl);
  return (
    <div className={`profile-picture ${className}`} style={containerStyle}>
      <img
        alt={`${user?.full_name || user?.name || 'User'}'s profile`}
        src={profilePictureUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
        onError={(e) => {
          console.log('❌ Profile image failed, showing initials fallback');
          // Hide the failed image and show initials
          e.target.style.display = 'none';
          if (e.target.nextSibling) {
            e.target.nextSibling.style.display = 'flex';
          }
        }}
        onLoad={() => {
          console.log('✅ Profile image loaded successfully');
        }}
      />
      
      {/* Fallback initials (hidden by default, shown on image error) */}
      {showFallback && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: avatarColor,
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.max(12, size / 3)}px`,
            fontWeight: 'bold',
            color: 'white',
            borderRadius: '50%'
          }}
        >
          {userInitials}
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
