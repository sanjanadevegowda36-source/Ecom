import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProductContext, getProductIcon } from '../context/ProductContext';
import { FaShippingFast, FaShieldAlt, FaHeadset, FaUndo, FaPlus, FaSearch, FaBriefcase, FaTruck, FaUserPlus } from 'react-icons/fa';
import Toast from '../components/Toast';
import './Home.css';

function Home() {
  const { products, getBrands, getProductsByBrand, calculateFinalPrice, registerUser } = useProductContext();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Get brands for the brands section
  const brands = getBrands();

  // Business Agent Form State
  const [businessForm, setBusinessForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    businessName: '',
    businessType: ''
  });
  const [businessErrors, setBusinessErrors] = useState({});

  // Delivery Agent Form State
  const [deliveryForm, setDeliveryForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    vehicleType: '',
    licenseNumber: ''
  });
  const [deliveryErrors, setDeliveryErrors] = useState({});

  // Validation functions
  const validateBusinessForm = () => {
    const errors = {};
    
    // Name validation
    if (!businessForm.name.trim()) {
      errors.name = 'Name is required';
    } else if (businessForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(businessForm.name)) {
      errors.name = 'Name must contain only letters and spaces';
    }
    
    // Email validation
    if (!businessForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (!businessForm.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(businessForm.phoneNumber)) {
      errors.phoneNumber = 'Phone must be exactly 10 digits';
    } else if (/^0{10}$/.test(businessForm.phoneNumber)) {
      errors.phoneNumber = 'Phone number cannot be all zeros';
    }
    
    // Password validation (strong)
    if (!businessForm.password) {
      errors.password = 'Password is required';
    } else if (businessForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(businessForm.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(businessForm.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(businessForm.password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(businessForm.password)) {
      errors.password = 'Password must contain at least one special character';
    }
    
    // Business Name validation
    if (!businessForm.businessName.trim()) {
      errors.businessName = 'Business name is required';
    } else if (businessForm.businessName.trim().length < 3) {
      errors.businessName = 'Business name must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9\s&'-]+$/.test(businessForm.businessName)) {
      errors.businessName = 'Business name can only contain letters, numbers, spaces, & and -';
    }
    
    // Business Type validation
    if (!businessForm.businessType) {
      errors.businessType = 'Please select a business type';
    }
    
    // Address validation
    if (!businessForm.address.trim()) {
      errors.address = 'Address is required';
    } else if (businessForm.address.trim().length < 10) {
      errors.address = 'Please enter a complete address (at least 10 characters)';
    } else if (businessForm.address.trim().length > 500) {
      errors.address = 'Address is too long (max 500 characters)';
    }
    
    return errors;
  };

  const validateDeliveryForm = () => {
    const errors = {};
    
    // Name validation
    if (!deliveryForm.name.trim()) {
      errors.name = 'Name is required';
    } else if (deliveryForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(deliveryForm.name)) {
      errors.name = 'Name must contain only letters and spaces';
    }
    
    // Email validation
    if (!deliveryForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (!deliveryForm.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(deliveryForm.phoneNumber)) {
      errors.phoneNumber = 'Phone must be exactly 10 digits';
    } else if (/^0{10}$/.test(deliveryForm.phoneNumber)) {
      errors.phoneNumber = 'Phone number cannot be all zeros';
    }
    
    // Password validation (strong)
    if (!deliveryForm.password) {
      errors.password = 'Password is required';
    } else if (deliveryForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(deliveryForm.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(deliveryForm.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(deliveryForm.password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(deliveryForm.password)) {
      errors.password = 'Password must contain at least one special character';
    }
    
    // Vehicle Type validation
    if (!deliveryForm.vehicleType) {
      errors.vehicleType = 'Please select a vehicle type';
    }
    
    // License Number validation
    if (!deliveryForm.licenseNumber.trim()) {
      errors.licenseNumber = 'License number is required';
    } else if (deliveryForm.licenseNumber.trim().length < 5) {
      errors.licenseNumber = 'License number must be at least 5 characters';
    } else if (!/^[a-zA-Z0-9-]+$/.test(deliveryForm.licenseNumber)) {
      errors.licenseNumber = 'License number can only contain letters, numbers, and dashes';
    }
    
    // Address validation
    if (!deliveryForm.address.trim()) {
      errors.address = 'Address is required';
    } else if (deliveryForm.address.trim().length < 10) {
      errors.address = 'Please enter a complete address (at least 10 characters)';
    } else if (deliveryForm.address.trim().length > 500) {
      errors.address = 'Address is too long (max 500 characters)';
    }
    
    return errors;
  };

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    const errors = validateBusinessForm();
    setBusinessErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const result = await registerUser(businessForm, 'business_agent');
      if (result.success) {
        setToast({ message: 'Business agent registration submitted! Waiting for admin approval.', type: 'success' });
        setBusinessForm({ name: '', email: '', phoneNumber: '', address: '', password: '', businessName: '', businessType: '' });
        setBusinessErrors({});
      } else {
        setToast({ message: result.message || 'Registration failed', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Registration failed. Please try again.', type: 'error' });
    }
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    const errors = validateDeliveryForm();
    setDeliveryErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const result = await registerUser(deliveryForm, 'delivery_agent');
      if (result.success) {
        setToast({ message: 'Delivery agent registration submitted! Waiting for admin approval.', type: 'success' });
        setDeliveryForm({ name: '', email: '', phoneNumber: '', address: '', password: '', vehicleType: '', licenseNumber: '' });
        setDeliveryErrors({});
      } else {
        setToast({ message: result.message || 'Registration failed', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Registration failed. Please try again.', type: 'error' });
    }
  };

  return (
    <div className="home-page">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Home
        </button>
        <button 
          className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
          onClick={() => setActiveTab('business')}
        >
          <FaBriefcase /> Add Business
        </button>
        <button 
          className={`tab-btn ${activeTab === 'delivery' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivery')}
        >
          <FaTruck /> Transferred Agent
        </button>
      </div>

      {/* Home Tab Content */}
      {activeTab === 'home' && (
        <>
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <h1>Welcome to SanjuCart</h1>
              <p>Your One-Stop Shop for Quality Products at Amazing Prices!</p>
              <div className="hero-buttons">
                <Link to="/products" className="btn-primary">Shop Now</Link>
                <Link to="/about" className="btn-primary">Learn More</Link>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section">
            <div className="feature">
              <FaShippingFast className="feature-icon" />
              <h3>Free Shipping</h3>
              <p>On orders over $50</p>
            </div>
            <div className="feature">
              <FaShieldAlt className="feature-icon" />
              <h3>Secure Payment</h3>
              <p>100% Secure Payment</p>
            </div>
            <div className="feature">
              <FaHeadset className="feature-icon" />
              <h3>24/7 Support</h3>
              <p>Dedicated Support</p>
            </div>
            <div className="feature">
              <FaUndo className="feature-icon" />
              <h3>Easy Returns</h3>
              <p>30-Day Returns</p>
            </div>
          </section>

          {/* Brands Section */}
          <section className="brands-section">
            <h2>Shop by Brand</h2>
            <p>Click on a brand to see products</p>
            <div className="brands-grid">
              {brands.map((brand) => (
                <div 
                  key={brand} 
                  className={`brand-card ${selectedBrand === brand ? 'selected' : ''}`}
                  onClick={() => handleBrandClick(brand)}
                >
                  <div className="brand-icon">{brand.charAt(0)}</div>
                  <h3>{brand}</h3>
                  <p>{getProductsByBrand(brand).length} products</p>
                </div>
              ))}
            </div>
          </section>

          {/* Products by Brand */}
          {selectedBrand && (
            <section className="brand-products-section">
              <div className="section-header">
                <h2>{selectedBrand} Products</h2>
                <button className="view-all-btn" onClick={() => navigate('/products')}>
                  View All <FaSearch />
                </button>
              </div>
              <div className="brand-products-grid">
                {getProductsByBrand(selectedBrand).map((product) => (
                  <div key={product.id} className="product-card" onClick={() => handleViewProduct(product)}>
                    <div className="product-image">
                      <span className="discount-tag">{product.discount}% OFF</span>
                      <div className="product-icon">
                        {getProductIcon(product.iconName)}
                      </div>
                    </div>
                    <div className="product-info">
                      <span className="product-category">{product.brand}</span>
                      <h3>{product.name}</h3>
                      <div className="product-price">
                        <span className="current-price">₹{calculateFinalPrice(product.price, product.discount, product.profit, product.gst).toFixed(2)}</span>
                        <span className="original-price">₹{product.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Products Preview */}
          <section className="products-preview-section">
            <div className="section-header">
              <h2>Featured Products</h2>
              <button className="view-all-btn" onClick={() => navigate('/products')}>
                View All Products <FaSearch />
              </button>
            </div>
            <div className="products-grid">
              {products.slice(0, 4).map((product) => (
                <div key={product.id} className="product-card" onClick={() => handleViewProduct(product)}>
                  <div className="product-image">
                    <span className="discount-tag">{product.discount}% OFF</span>
                    <div className="product-icon">
                      {getProductIcon(product.iconName)}
                    </div>
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.brand}</span>
                    <h3>{product.name}</h3>
                    <div className="product-price">
                      <span className="current-price">₹{calculateFinalPrice(product.price, product.discount, product.profit, product.gst).toFixed(2)}</span>
                      <span className="original-price">₹{product.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Add Product CTA (Admin) */}
          <section className="admin-cta-section">
            <div className="admin-cta-content">
              <h2>Are you an Admin?</h2>
              <p>Add new products to your store</p>
              <Link to="/products" className="btn-admin">
                <FaPlus /> Add Products
              </Link>
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="newsletter-section">
            <h2>Subscribe to Our Newsletter</h2>
            <p>Get the latest updates on new products and upcoming sales</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email" />
              <button type="submit">Subscribe</button>
            </form>
          </section>
        </>
      )}

      {/* Business Agent Tab Content */}
      {activeTab === 'business' && (
        <section className="agent-registration-section">
          <div className="registration-container">
            <div className="registration-header">
              <FaBriefcase className="registration-icon" />
              <h2>Register as Business Agent</h2>
              <p>Add your products to SanjuCart and reach more customers</p>
            </div>
            
            <form onSubmit={handleBusinessSubmit} className="registration-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={businessForm.name}
                    onChange={(e) => setBusinessForm({...businessForm, name: e.target.value})}
                    placeholder="Enter your full name"
                    className={businessErrors.name ? 'error-input' : ''}
                  />
                  {businessErrors.name && <span className="error-text">{businessErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={businessForm.email}
                    onChange={(e) => setBusinessForm({...businessForm, email: e.target.value})}
                    placeholder="Enter your email"
                    className={businessErrors.email ? 'error-input' : ''}
                  />
                  {businessErrors.email && <span className="error-text">{businessErrors.email}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={businessForm.phoneNumber}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '');
                      const limitedDigits = digitsOnly.slice(0, 10);
                      setBusinessForm({...businessForm, phoneNumber: limitedDigits});
                    }}
                    placeholder="10-digit phone number"
                    maxLength={10}
                    className={businessErrors.phoneNumber ? 'error-input' : ''}
                  />
                  {businessErrors.phoneNumber && <span className="error-text">{businessErrors.phoneNumber}</span>}
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={businessForm.password}
                    onChange={(e) => setBusinessForm({...businessForm, password: e.target.value})}
                    placeholder="Create a password"
                    className={businessErrors.password ? 'error-input' : ''}
                  />
                  {businessForm.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div 
                          className={`strength-segment ${businessForm.password.length >= 8 ? 'active' : ''}`}
                          style={{backgroundColor: businessForm.password.length >= 8 ? '#ff4444' : '#ddd'}}
                        />
                        <div 
                          className={`strength-segment ${businessForm.password.length >= 8 && /[A-Z]/.test(businessForm.password) && /[a-z]/.test(businessForm.password) ? 'active' : ''}`}
                          style={{backgroundColor: businessForm.password.length >= 8 && /[A-Z]/.test(businessForm.password) && /[a-z]/.test(businessForm.password) ? '#ffaa00' : '#ddd'}}
                        />
                        <div 
                          className={`strength-segment ${businessForm.password.length >= 8 && /[A-Z]/.test(businessForm.password) && /[a-z]/.test(businessForm.password) && /[0-9]/.test(businessForm.password) && /[!@#$%^&*(),.?":{}|<>]/.test(businessForm.password) ? 'active' : ''}`}
                          style={{backgroundColor: businessForm.password.length >= 8 && /[A-Z]/.test(businessForm.password) && /[a-z]/.test(businessForm.password) && /[0-9]/.test(businessForm.password) && /[!@#$%^&*(),.?":{}|<>]/.test(businessForm.password) ? '#00cc00' : '#ddd'}}
                        />
                      </div>
                      <span className="strength-text">
                        {businessForm.password.length >= 8 && /[A-Z]/.test(businessForm.password) && /[a-z]/.test(businessForm.password) && /[0-9]/.test(businessForm.password) && /[!@#$%^&*(),.?":{}|<>]/.test(businessForm.password) 
                          ? 'Strong' 
                          : businessForm.password.length >= 8 && /[A-Z]/.test(businessForm.password) && /[a-z]/.test(businessForm.password)
                            ? 'Medium'
                            : 'Weak'}
                      </span>
                    </div>
                  )}
                  {businessErrors.password && <span className="error-text">{businessErrors.password}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  value={businessForm.businessName}
                  onChange={(e) => setBusinessForm({...businessForm, businessName: e.target.value})}
                  placeholder="Enter your business name"
                  className={businessErrors.businessName ? 'error-input' : ''}
                />
                {businessErrors.businessName && <span className="error-text">{businessErrors.businessName}</span>}
              </div>
              
              <div className="form-group">
                <label>Business Type</label>
                <select
                  value={businessForm.businessType}
                  onChange={(e) => setBusinessForm({...businessForm, businessType: e.target.value})}
                  className={businessErrors.businessType ? 'error-input' : ''}
                >
                  <option value="">Select business type</option>
                  <option value="retail">Retail Store</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="online">Online Store</option>
                  <option value="other">Other</option>
                </select>
                {businessErrors.businessType && <span className="error-text">{businessErrors.businessType}</span>}
              </div>
              
              <div className="form-group">
                <label>Business Address</label>
                <textarea
                  value={businessForm.address}
                  onChange={(e) => setBusinessForm({...businessForm, address: e.target.value})}
                  placeholder="Enter your business address"
                  rows="3"
                  className={businessErrors.address ? 'error-input' : ''}
                />
                {businessErrors.address && <span className="error-text">{businessErrors.address}</span>}
              </div>
              
              <button type="submit" className="btn-submit">
                <FaUserPlus /> Submit for Approval
              </button>
              
              <p className="approval-notice">
                * Your account will be reviewed and approved by admin before you can add products.
              </p>
            </form>
          </div>
        </section>
      )}

      {/* Delivery Agent Tab Content */}
      {activeTab === 'delivery' && (
        <section className="agent-registration-section">
          <div className="registration-container">
            <div className="registration-header">
              <FaTruck className="registration-icon" />
              <h2>Register as Delivery Agent</h2>
              <p>Join our delivery network and deliver products to customers</p>
            </div>
            
            <form onSubmit={handleDeliverySubmit} className="registration-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={deliveryForm.name}
                    onChange={(e) => setDeliveryForm({...deliveryForm, name: e.target.value})}
                    placeholder="Enter your full name"
                    className={deliveryErrors.name ? 'error-input' : ''}
                  />
                  {deliveryErrors.name && <span className="error-text">{deliveryErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={deliveryForm.email}
                    onChange={(e) => setDeliveryForm({...deliveryForm, email: e.target.value})}
                    placeholder="Enter your email"
                    className={deliveryErrors.email ? 'error-input' : ''}
                  />
                  {deliveryErrors.email && <span className="error-text">{deliveryErrors.email}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={deliveryForm.phoneNumber}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '');
                      const limitedDigits = digitsOnly.slice(0, 10);
                      setDeliveryForm({...deliveryForm, phoneNumber: limitedDigits});
                    }}
                    placeholder="10-digit phone number"
                    maxLength={10}
                    className={deliveryErrors.phoneNumber ? 'error-input' : ''}
                  />
                  {deliveryErrors.phoneNumber && <span className="error-text">{deliveryErrors.phoneNumber}</span>}
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={deliveryForm.password}
                    onChange={(e) => setDeliveryForm({...deliveryForm, password: e.target.value})}
                    placeholder="Create a password"
                    className={deliveryErrors.password ? 'error-input' : ''}
                  />
                  {deliveryForm.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div 
                          className={`strength-segment ${deliveryForm.password.length >= 8 ? 'active' : ''}`}
                          style={{backgroundColor: deliveryForm.password.length >= 8 ? '#ff4444' : '#ddd'}}
                        />
                        <div 
                          className={`strength-segment ${deliveryForm.password.length >= 8 && /[A-Z]/.test(deliveryForm.password) && /[a-z]/.test(deliveryForm.password) ? 'active' : ''}`}
                          style={{backgroundColor: deliveryForm.password.length >= 8 && /[A-Z]/.test(deliveryForm.password) && /[a-z]/.test(deliveryForm.password) ? '#ffaa00' : '#ddd'}}
                        />
                        <div 
                          className={`strength-segment ${deliveryForm.password.length >= 8 && /[A-Z]/.test(deliveryForm.password) && /[a-z]/.test(deliveryForm.password) && /[0-9]/.test(deliveryForm.password) && /[!@#$%^&*(),.?":{}|<>]/.test(deliveryForm.password) ? 'active' : ''}`}
                          style={{backgroundColor: deliveryForm.password.length >= 8 && /[A-Z]/.test(deliveryForm.password) && /[a-z]/.test(deliveryForm.password) && /[0-9]/.test(deliveryForm.password) && /[!@#$%^&*(),.?":{}|<>]/.test(deliveryForm.password) ? '#00cc00' : '#ddd'}}
                        />
                      </div>
                      <span className="strength-text">
                        {deliveryForm.password.length >= 8 && /[A-Z]/.test(deliveryForm.password) && /[a-z]/.test(deliveryForm.password) && /[0-9]/.test(deliveryForm.password) && /[!@#$%^&*(),.?":{}|<>]/.test(deliveryForm.password) 
                          ? 'Strong' 
                          : deliveryForm.password.length >= 8 && /[A-Z]/.test(deliveryForm.password) && /[a-z]/.test(deliveryForm.password)
                            ? 'Medium'
                            : 'Weak'}
                      </span>
                    </div>
                  )}
                  {deliveryErrors.password && <span className="error-text">{deliveryErrors.password}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Vehicle Type</label>
                  <select
                    value={deliveryForm.vehicleType}
                    onChange={(e) => setDeliveryForm({...deliveryForm, vehicleType: e.target.value})}
                    className={deliveryErrors.vehicleType ? 'error-input' : ''}
                  >
                    <option value="">Select vehicle type</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="bike">Bike</option>
                    <option value="car">Car</option>
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                  </select>
                  {deliveryErrors.vehicleType && <span className="error-text">{deliveryErrors.vehicleType}</span>}
                </div>
                <div className="form-group">
                  <label>License Number</label>
                  <input
                    type="text"
                    value={deliveryForm.licenseNumber}
                    onChange={(e) => setDeliveryForm({...deliveryForm, licenseNumber: e.target.value})}
                    placeholder="Enter license number"
                    className={deliveryErrors.licenseNumber ? 'error-input' : ''}
                  />
                  {deliveryErrors.licenseNumber && <span className="error-text">{deliveryErrors.licenseNumber}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>Current Address / Service Area</label>
                <textarea
                  value={deliveryForm.address}
                  onChange={(e) => setDeliveryForm({...deliveryForm, address: e.target.value})}
                  placeholder="Enter your current address and service area"
                  rows="3"
                  className={deliveryErrors.address ? 'error-input' : ''}
                />
                {deliveryErrors.address && <span className="error-text">{deliveryErrors.address}</span>}
              </div>
              
              <button type="submit" className="btn-submit">
                <FaUserPlus /> Submit for Approval
              </button>
              
              <p className="approval-notice">
                * Your account will be reviewed and approved by admin before you can start delivering.
              </p>
            </form>
          </div>
        </section>
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}

export default Home;
