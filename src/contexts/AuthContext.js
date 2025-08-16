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

        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('scms_logged_in_user', JSON.stringify(user));
        
        // Update state
        setUser(user);
        setToken(token);
        
        return { success: true, data: user };
      } else {
        return { success: false, message: response?.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed. Please try again.' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Sign in with Google (this uses demo mode currently)
      const googleUser = await googleAuthService.signIn();
      
      // Always call your backend API for real authentication
      console.log('🚀 Calling backend API for Google OAuth authentication');
      console.log('📤 Sending user data:', {
        email: googleUser.email,
        name: googleUser.name,
        provider: googleUser.provider
      });

      const response = await ApiService.googleAuth({
        idToken: googleUser.idToken,
        email: googleUser.email,
        name: googleUser.name,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        imageUrl: googleUser.imageUrl,
        id: googleUser.id // Add Google user ID for backend
      });

      if (response && response.status) {
        // Handle your backend response format
        const { data } = response;
        const token = data.token;
        const user = {
          user_id: data.user_id,
          email: data.email,
          full_name: data.full_name,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          role: data.role,
          profile_image_url: data.profile_image_url,
          auth_provider: data.auth_provider,
          status: data.status,
          last_login: data.last_login
        };

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
        await ApiService.logout();
      }
      // Also sign out from Google
      await googleAuthService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('scms_logged_in_user');
      setUser(null);
      setToken(null);
      // Navigate to login page
      window.location.href = '/auth/login';
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 