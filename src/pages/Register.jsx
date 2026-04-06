import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaLock } from 'react-icons/fa';
import { useProductContext } from '../context/ProductContext';
import Toast from '../components/Toast';

function Register() {
  const navigate = useNavigate();
  const { loginUser, registerUser } = useProductContext();
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [toast, setToast] = useState(null);

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name) return 'Name is required';
    if (!nameRegex.test(name)) return 'Name should contain only letters and spaces';
    return '';
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (!phone) return 'Phone number is required';
    if (!phoneRegex.test(phone)) return 'Phone number must be exactly 10 digits';
    if (/^0{10}$/.test(phone)) return 'Phone number cannot be all zeros';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email format';
    return '';
  };

  const validateAddress = (address) => {
    if (!address) return 'Address is required';
    if (address.length < 10) return 'Please enter a valid address (at least 10 characters)';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character';
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      const digitsOnly = value.replace(/\D/g, '');
      const limitedDigits = digitsOnly.slice(0, 10); // Limit to 10 digits
      setFormData({ ...formData, [name]: limitedDigits });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Handle blur for real-time validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';

    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'phoneNumber':
        error = validatePhoneNumber(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'address':
        error = validateAddress(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password);
        break;
      default:
        break;
    }

    if (error) {
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      name: validateName(formData.name),
      phoneNumber: validatePhoneNumber(formData.phoneNumber),
      email: validateEmail(formData.email),
      address: validateAddress(formData.address),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
    };

    const hasErrors = Object.values(newErrors).some((error) => error !== '');

    if (hasErrors) {
      setErrors(newErrors);
    } else {
      // Register user in the users database
      const result = await registerUser(formData);
      if (result.success) {
        console.log('Registration successful:', formData);
        setIsSubmitted(true);
      } else {
        setToast({ message: result.message, type: 'error' });
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className="register-page">
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h1>Registration Successful!</h1>
          <p>Thank you for registering with SanjuCart.</p>
          <p>You can now login to your account.</p>
          <Link to="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join SanjuCart and start shopping!</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <div className="input-with-icon">
              <FaPhone className="input-icon" />
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
              />
            </div>
            {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email ID</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <div className="input-with-icon">
              <FaMapMarkerAlt className="input-icon" />
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your address"
                rows="3"
              ></textarea>
            </div>
            {errors.address && <span className="error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter password"
              />
            </div>
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm your password"
              />
            </div>
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn-register">Register</button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>

        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
            position="center"
          />
        )}
      </div>
    </div>
  );
}

export default Register;
