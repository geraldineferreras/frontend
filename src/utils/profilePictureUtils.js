// Utility function to get profile picture URL with proper fallbacks
export const getProfilePictureUrl = (user) => {
  console.log('=== PROFILE PICTURE UTILITY ===');
  console.log('Input user:', user);
  
  if (!user) {
    console.log('❌ No user provided');
    return null;
  }

  // Check for profile picture in various possible fields
  const profilePic = user.profile_pic || user.profile_picture || user.avatar || user.profileImageUrl;
  
  console.log('Profile picture field found:', profilePic);
  console.log('Profile pic type:', typeof profilePic);
  
  if (!profilePic) {
    console.log('❌ No profile picture found in user data');
    return null;
  }

  let imageUrl = '';

  // Handle different URL formats
  if (profilePic.startsWith('uploads/')) {
    // Relative path - construct full URL using the correct base URL
    imageUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost/scms_new_backup'}/${profilePic}`;
    console.log('📁 Relative path detected, constructed URL:', imageUrl);
  } else if (profilePic.startsWith('http://') || profilePic.startsWith('https://')) {
    // Full URL
    imageUrl = profilePic;
    console.log('🌐 Full URL detected:', imageUrl);
  } else if (profilePic.startsWith('data:')) {
    // Data URL (base64)
    imageUrl = profilePic;
    console.log('📄 Data URL detected (base64)');
  } else {
    // Assume it's a filename in the uploads directory
    imageUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost/scms_new_backup'}/uploads/profile/${profilePic}`;
    console.log('📂 Filename detected, constructed URL:', imageUrl);
  }

  console.log('✅ Final image URL:', imageUrl);
  return imageUrl;
};

// Function to get user initials for fallback avatar
export const getUserInitials = (user) => {
  if (!user) {
    return 'U';
  }

  const name = user.full_name || user.name || user.user_name || '';
  if (!name) {
    return 'U';
  }

  const names = name.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }

  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

// Function to get fallback avatar color based on user name
export const getAvatarColor = (user) => {
  if (!user) {
    return '#5e72e4'; // Default blue
  }

  const name = user.full_name || user.name || user.user_name || '';
  if (!name) {
    return '#5e72e4';
  }

  // Simple hash function to generate consistent colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate a color from the hash
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
};
