import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUserShield } from 'react-icons/fa';
import { useProductContext, ROLES } from '../context/ProductContext';
import Toast from '../components/Toast';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useProductContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Attempt to login with credentials
    const result = await loginUser(email, password);
    
    if (result.success) {
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }
      
      // Check user role and redirect accordingly
      if (result.user.role === ROLES.ADMIN) {
        setToast({ message: 'Admin login successful!', type: 'success' });
        setTimeout(() => navigate('/admin'), 1000);
      } else if (result.user.role === ROLES.PROFESSIONAL) {
        setToast({ message: 'Professional login successful!', type: 'success' });
        setTimeout(() => navigate('/professional'), 1000);
      } else {
        setToast({ message: 'Login successful!', type: 'success' });
        setTimeout(() => navigate(from, { replace: true }), 1000);
      }
    } else {
      setError(result.message || 'Invalid email or password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Please login to your account</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" className="btn-login">Login</button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Create one</Link></p>
        </div>

        <div className="social-login">
          <p>Or continue with</p>
          <div className="social-buttons">
            <button className="social-btn google">G</button>
            <button className="social-btn facebook">f</button>
            <button className="social-btn twitter">t</button>
          </div>
        </div>

        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
            position="center"
          />
        )}

        <div className="login-info">
          <div className="info-card">
            <FaUserShield className="info-icon" />
            <div className="info-content">
              <p><strong>Default Admin Account:</strong></p>
              <p>Email: admin@sanjucart.com</p>
              <p>Password: admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
