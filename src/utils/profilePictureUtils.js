// Utility function to get profile picture URL with proper fallbacks
export const getProfilePictureUrl = (user) => {
  if (!user) {
    return null;
  }

  // Priority order for profile picture sources (Google OAuth gets highest priority)
  const profilePic = user.profile_image_url ||  // Google OAuth profile image
                    user.profileImageUrl ||     // Alternative Google OAuth field
                    user.imageUrl ||            // Another Google OAuth field  
                    user.profile_pic ||         // Local profile picture
                    user.profile_picture ||     // Alternative local field
                    user.avatar ||              // Avatar field
                    user.user_avatar;          // User avatar field
  
  if (!profilePic) {
    // Return null when no profile picture is available
    return null;
  }

  let imageUrl = '';

  // Handle different URL formats
  if (profilePic.startsWith('uploads/')) {
    // Relative path - construct full URL using the correct base URL
    // If API base is like http://host/.../index.php/api → strip to base site root
    const rawBase = (process.env.REACT_APP_API_BASE_URL || 'http://localhost/scms_new_backup/index.php/api');
    const base = rawBase.replace('/index.php/api', '').replace('/api', '').replace(/\/$/, '');
    imageUrl = `${base}/${profilePic}`;
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
