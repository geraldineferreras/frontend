import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login2FAModal from './Login2FAModal';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const { login: authLogin, complete2FALogin } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authLogin(formData.email, formData.password);
      console.log('🔐 Login: Login result:', result);
      
      if (result.success) {
        if (result.requires2FA) {
          console.log('🔐 Login: 2FA required, showing modal');
          // Store temporary user data and show 2FA modal
          setTempUserData(result.tempUser);
          setShow2FAModal(true);
        } else {
          console.log('🔐 Login: No 2FA required, login successful');
          // Normal login success
          if (onLoginSuccess) onLoginSuccess(result.data);
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handle2FASuccess = async (verificationData) => {
    console.log('🔐 Login: 2FA verification successful, completing login');
    try {
      const result = await complete2FALogin(formData.email, verificationData.code || verificationData);
      
      if (result.success) {
        console.log('🔐 Login: 2FA login completed successfully');
        setShow2FAModal(false);
        if (onLoginSuccess) onLoginSuccess(result.data);
      } else {
        console.error('🔐 Login: 2FA login completion failed:', result.message);
        setError(result.message || 'Failed to complete 2FA login');
      }
    } catch (error) {
      console.error('🔐 Login: Error completing 2FA login:', error);
      setError(error.message || 'Error completing 2FA verification');
    }
  };

  const handle2FACancel = () => {
    console.log('🔐 Login: 2FA cancelled, clearing temp data');
    setShow2FAModal(false);
    setTempUserData(null);
    // Clear any temporary data
    localStorage.removeItem('temp_token');
    localStorage.removeItem('temp_user');
  };

  return (
    <div className="login-container">
      <h2>Login to SCMS</h2>
      
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* 🔐 NEW: 2FA Verification Modal */}
      <Login2FAModal
        isOpen={show2FAModal}
        toggle={() => setShow2FAModal(!show2FAModal)}
        email={formData.email}
        onVerificationSuccess={handle2FASuccess}
        onCancel={handle2FACancel}
      />
    </div>
  );
};

export default Login; 