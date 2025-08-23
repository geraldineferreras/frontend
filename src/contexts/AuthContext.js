import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';
import googleAuthService from '../services/googleAuth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const refreshUserData = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    // const legacyUser = localStorage.getItem('scms_logged_in_user');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    } else {
      setUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    refreshUserData();
    setLoading(false);
  }, []);

  // Listen for session timeout events
  useEffect(() => {
    const handleSessionTimeout = () => {
      console.log('Session timeout detected, logging out user');
      logout();
    };

    window.addEventListener('sessionTimeout', handleSessionTimeout);
    return () => window.removeEventListener('sessionTimeout', handleSessionTimeout);
  }, []);

  // Listen for localStorage changes (user switching)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'scms_logged_in_user' || e.key === 'user' || e.key === 'token') {
        refreshUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await ApiService.login(email, password);

      if (response && response.status) {
        // Enhanced token extraction with better error handling
        let user, token;
        
        // Check for token in various possible locations
        if (response.data && response.data.token) {
          token = response.data.token;
          // Extract user data, excluding the token
          user = { ...response.data };
          delete user.token;
        } else if (response.token) {
          token = response.token;
          user = { ...response };
          delete user.token;
        } else if (response.data && response.data.user && response.data.user.token) {
          token = response.data.user.token;
          user = { ...response.data.user };
          delete user.token;
        } else {
          // If no token found, this is a critical error
          console.error('No authentication token received from server');
          return { success: false, message: 'Authentication failed: No token received' };
        }

        // Validate token exists and is not empty
        if (!token || token.trim() === '') {
          console.error('Empty or invalid token received');
          return { success: false, message: 'Authentication failed: Invalid token' };
        }

        // 🔐 NEW: Check if user has 2FA enabled
        // Store temporary token to check 2FA status
        localStorage.setItem('temp_token', token);
        
        try {
          console.log('🔐 AuthContext: Checking 2FA status for user');
          console.log('🔐 AuthContext: Using token:', token ? `${token.substring(0, 20)}...` : 'No token');
          console.log('🔐 AuthContext: User email:', email);
          
          const twoFAResponse = await ApiService.get2FAStatus();
          console.log('🔐 AuthContext: 2FA status response:', twoFAResponse);
          console.log('🔐 AuthContext: 2FA response success:', twoFAResponse.success);
          console.log('🔐 AuthContext: 2FA response data:', twoFAResponse.data);
          console.log('🔐 AuthContext: 2FA is_enabled:', twoFAResponse.data?.is_enabled);
          
          if (twoFAResponse.success && twoFAResponse.data.is_enabled) {
            console.log('🔐 AuthContext: User has 2FA enabled, requiring verification');
            // Store temporary user data for 2FA completion
            localStorage.setItem('temp_user', JSON.stringify(user));
            // Return special response indicating 2FA is required
            return { 
              success: true, 
              requires2FA: true, 
              message: '2FA verification required',
              tempUser: user,
              tempToken: token
            };
          } else {
            console.log('🔐 AuthContext: User does not have 2FA enabled, proceeding with normal login');
            console.log('🔐 AuthContext: 2FA check result - success:', twoFAResponse.success, 'enabled:', twoFAResponse.data?.is_enabled);
            // Proceed with normal login (no 2FA required)
            return await completeLogin(user, token);
          }
        } catch (twoFAError) {
          console.error('🔐 AuthContext: Error checking 2FA status:', twoFAError);
          // If we can't check 2FA status, proceed with normal login for now
          console.log('🔐 AuthContext: Proceeding with normal login due to 2FA check error');
          return await completeLogin(user, token);
        }
      } else {
        return { success: false, message: response?.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed. Please try again.' };
    }
  };

  // 🔐 NEW: Complete login after 2FA verification
  const completeLogin = async (user, token) => {
    try {
      console.log('🔐 AuthContext: completeLogin called with:', { user: user?.email || 'no email', token: !!token });
      console.log('🔐 AuthContext: User object:', user);
      console.log('🔐 AuthContext: Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('scms_logged_in_user', JSON.stringify(user));
      
      // Remove temporary token
      localStorage.removeItem('temp_token');
      localStorage.removeItem('temp_user');
      
      console.log('🔐 AuthContext: Stored token and user data in localStorage');
      
      // Update state
      setUser(user);
      setToken(token);
      
      console.log('🔐 AuthContext: Updated React state with user and token');
      console.log('🔐 AuthContext: Current user state:', user);
      console.log('🔐 AuthContext: Current token state:', !!token);
      
      return { success: true, data: user };
    } catch (error) {
      console.error('🔐 AuthContext: Error completing login:', error);
      return { success: false, message: 'Error completing login' };
    }
  };

  // 🔐 NEW: Complete 2FA verification and finish login
  const complete2FALogin = async (email, verificationCode) => {
    console.log('🔐 AuthContext: complete2FALogin called with:', { email, verificationCode });
    
    // Get the temporary data stored during initial login
    const tempToken = localStorage.getItem('temp_token');
    console.log('🔐 AuthContext: tempToken exists:', !!tempToken);
    console.log('🔐 AuthContext: tempToken preview:', tempToken ? `${tempToken.substring(0, 20)}...` : 'No token');
    
    const tempUser = localStorage.getItem('temp_user');
    console.log('🔐 AuthContext: tempUser exists:', !!tempUser);
    console.log('🔐 AuthContext: tempUser data:', tempUser);
    
    if (!tempToken || !tempUser) {
      console.error('🔐 AuthContext: Missing temporary data for 2FA completion');
      return {
        success: false,
        message: 'Missing temporary login data. Please try logging in again.'
      };
    }
    
    try {
      // Parse the temp user data
      const userData = JSON.parse(tempUser);
      console.log('🔐 AuthContext: Parsed user data:', userData);
      
      // Complete the login with the temporary data
      // No need to call verify2FALogin again - it was already successful in the modal
      console.log('🔐 AuthContext: Completing login with verified 2FA user');
      
      // Complete the login process
      const result = await completeLogin(userData, tempToken);
      console.log('🔐 AuthContext: Login completed successfully:', result);
      
      return result;
      
    } catch (error) {
      console.error('🔐 AuthContext: Error completing 2FA login:', error);
      return {
        success: false,
        message: 'Failed to complete login. Please try again.'
      };
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Sign in with Google (this uses demo mode currently)
      const googleUser = await googleAuthService.signIn();
      
      // Always call your backend API for real authentication
      console.log('🚀 Calling backend API for Google OAuth authentication');
      console.log('📤 Google user data received:', googleUser);
      console.log('📤 Sending to backend:', {
        google_id: googleUser.id,
        email: googleUser.email,
        full_name: googleUser.name
      });

      const response = await ApiService.googleAuth({
        google_id: googleUser.id,
        email: googleUser.email,
        full_name: googleUser.name
      });

      console.log('🔍 Backend response received:', response);
      console.log('🔍 Response type:', typeof response);
      console.log('🔍 Response keys:', Object.keys(response || {}));
      console.log('🔍 Response.status:', response?.status);
      console.log('🔍 Response.success:', response?.success);
      console.log('🔍 Response.message:', response?.message);

      // Check for your backend's response structure
      // Your backend returns: { "status": true, "message": "...", "data": {...} }
      if (response && (response.status === true || response.success === true)) {
        // Handle your backend response format
        console.log('🔍 Extracting data from response...');
        const { data } = response;
        console.log('🔍 Response data:', data);
        
        if (!data || !data.token) {
          console.error('❌ Missing token or data in response');
          return { success: false, message: 'Invalid response format from backend' };
        }
        
        const token = data.token;
        const user = {
          user_id: data.user_id,
          email: data.email,
          full_name: data.full_name,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          role: data.role,
          profile_image_url: data.profile_image_url,
          auth_provider: data.auth_provider || data.account_type,
          status: data.status,
          last_login: data.last_login
        };
        
        console.log('🔍 Constructed user object:', user);

        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('scms_logged_in_user', JSON.stringify(user));
        
        // Update state
        setUser(user);
        setToken(token);
        
        console.log('✅ Backend authentication successful');
        console.log('👤 User role:', user.role);
        console.log('🎫 Token received');
        
        return { success: true, data: user };
      } else {
        console.log('❌ Backend authentication failed:', response?.message);
        console.log('🔍 Response structure:', response);
        return { success: false, message: response?.message || 'Google authentication failed' };
      }
    } catch (error) {
      console.error('Google login error:', error);
      // Sign out from Google if backend authentication fails
      try {
        await googleAuthService.signOut();
      } catch (signOutError) {
        console.error('Failed to sign out from Google:', signOutError);
      }
      return { success: false, message: error.message || 'Google authentication failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        try {
          await ApiService.logout();
        } catch (apiErr) {
          console.warn('Logout API call failed or unavailable, proceeding to clear session:', apiErr?.message || apiErr);
        }
      }
      // Also sign out from Google
      try { await googleAuthService.signOut(); } catch (_) {}
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('scms_logged_in_user');
      setUser(null);
      setToken(null);
      // Navigate to login page (use replace to avoid back navigation into protected pages)
      try {
        window.location.replace('/auth/login');
      } catch (_) {
        window.location.href = '/auth/login';
      }
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await ApiService.updateProfile(userData);
      
      if (response.status) {
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('scms_logged_in_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, data: updatedUser };
      } else {
        return { success: false, message: response.message || 'Update failed' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: error.message || 'Update failed. Please try again.' };
    }
  };

  const isAuthenticated = () => {
    const storedToken = localStorage.getItem('token');
    return !!user && !!storedToken;
  };

  const hasValidToken = () => {
    const storedToken = localStorage.getItem('token');
    return !!storedToken && storedToken.trim() !== '';
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const value = {
    user,
    token,
    loading,
    login,
    loginWithGoogle,
    logout,
    updateProfile,
    refreshUserData,
    isAuthenticated,
    hasValidToken,
    hasRole,
    complete2FALogin, // Add complete2FALogin to the context value
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 