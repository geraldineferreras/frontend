// Utility functions for user management

/**
 * Get the current user ID from localStorage
 * @returns {string|null} The user ID or null if not found
 */
export const getCurrentUserId = () => {
  try {
    const storedUser = localStorage.getItem('user');
    console.log('🔍 [getCurrentUserId] Raw storedUser from localStorage:', storedUser);
    
    if (!storedUser) {
      console.error('❌ [getCurrentUserId] User not found in localStorage');
      return null;
    }
    
    const user = JSON.parse(storedUser);
    console.log('🔍 [getCurrentUserId] Parsed user object:', user);
    
    const userId = user.user_id || user.id;
    console.log('🔍 [getCurrentUserId] Extracted userId:', userId);
    
    if (!userId) {
      console.error('❌ [getCurrentUserId] User ID not found in user object');
      return null;
    }
    
    console.log('✅ [getCurrentUserId] Successfully returning userId:', userId);
    return userId;
  } catch (error) {
    console.error('❌ [getCurrentUserId] Error parsing user data from localStorage:', error);
    return null;
  }
};

/**
 * Get the current user object from localStorage
 * @returns {object|null} The user object or null if not found
 */
export const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      console.error('User not found in localStorage');
      return null;
    }
    
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isUserAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  return !!(token && user);
};
