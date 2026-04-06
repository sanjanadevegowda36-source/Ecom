import React, { useState, useEffect } from 'react';
import './App.css';
import './pages/Pages.css';
import './components/SearchStyles.css';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaSignInAlt, FaSignOutAlt, FaUser, FaBox, FaChevronDown, FaChevronUp, FaCog, FaTachometerAlt, FaClipboardList, FaBriefcase, FaHeart, FaSearch } from 'react-icons/fa';
import { useProductContext, ROLES, isAdmin, isProfessional, hasPageAccess } from './context/ProductContext';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot';
import Toast from './components/Toast';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import ProductDetail from './pages/ProductDetail';
import OrderTracking from './pages/OrderTracking';
import UserForm from './pages/userform';

function App() {
  const { cartCount, user, logoutUser, getUserOrders, wishlistCount, products, showToast, toast } = useProductContext();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close menu when resizing to desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);


  const location = useLocation();

  useEffect(() => {
    if (user?.email) {
      const orders = getUserOrders(user.email);
      setUserOrders(orders.slice(-5).reverse());
    }
  }, [user, getUserOrders]);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (window.scrollY > 50) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setShowProfileDropdown(false);
    showToast('Logged out successfully!', 'success');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Confirmed': return '#2196f3';
      case 'Processing': return '#ff9800';
      case 'Out for Delivery': return '#9c27b0';
      case 'Delivered in 2 Days': return '#4caf50';
      case 'Delivered': return '#4caf50';
      case 'Cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const userIsAdmin = isAdmin(user);
  const userIsProfessional = isProfessional(user);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <Link to="/">
            <FaShoppingCart className="logo-icon" /> SanjuCart
          </Link>
        </div>
        
        <button
          className="menu-toggle active"
          aria-label="Menu"
          style={{
            display: 'none',
          }}
        >
          ☰
        </button>
        

        <ul className="nav-links">
          {/* Show nav links only for non-admin users */}
          {!userIsAdmin ? (
            <>
              <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
              <li><Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>Products</Link></li>
              <li><Link to="/blog" className={location.pathname === '/blog' ? 'active' : ''}>Blog</Link></li>
              <li><Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link></li>
              <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link></li>
            </>
          ) : (
            <li className="products-link"><Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>Products</Link></li>
          )}
          
          {/* Admin/Professional links - only show if user has access */}
          {userIsAdmin && hasPageAccess(user, 'admin') && (
            <li className="admin-link">
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                <FaCog /> Admin Panel
              </Link>
            </li>
          )}
          {userIsProfessional && hasPageAccess(user, 'professional') && (
            <li className="professional-link">
              <Link to="/professional" onClick={() => setMobileMenuOpen(false)}>
                <FaBriefcase /> My Tasks
              </Link>
            </li>
          )}
        </ul>
        
        <div className="nav-icons">
          {/* Search Icon and Dropdown */}
          <div className="search-container">
            <button 
              className="search-trigger"
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Search"
            >
              <FaSearch />
            </button>
            {showSearch && (
              <div className="search-dropdown">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <div className="search-results">
                    {products
                      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
                      .slice(0, 5)
                      .map(product => (
                        <Link 
                          key={product.id} 
                          to={`/products?id=${product.id}`}
                          className="search-result-item"
                          onClick={() => {
                            setShowSearch(false);
                            setSearchQuery('');
                          }}
                        >
                          <span className="result-name">{product.name}</span>
                          <span className="result-brand">{product.brand}</span>
                        </Link>
                      ))}
                    {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <div className="no-results">No products found</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {user ? (
            <div className="user-profile">
              <div 
                className="profile-trigger" 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <FaUser className="profile-icon" />
                <span className="user-name-nav">{user.name || user.email.split('@')[0]}</span>
                {showProfileDropdown ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {/* Profile Dropdown - Shows only when clicked */}
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div className="user-info-header">
                    <FaUser className="user-avatar" />
                    <div className="user-details">
                      <strong>{user.name || user.email.split('@')[0]}</strong>
                      <span>{user.email}</span>
                      {userIsAdmin && <span className="admin-badge">Admin</span>}
                      {userIsProfessional && <span className="professional-badge">Professional</span>}
                    </div>
                  </div>
                  
                  {/* Show My Orders only for non-admin users */}
                  {!userIsAdmin && (
                    <div className="dropdown-section">
                      <div className="section-title">
                        <FaBox /> My Orders
                      </div>
                      {userOrders.length === 0 ? (
                        <div className="no-orders-msg">No orders yet</div>
                      ) : (
                        <div className="orders-list-mini">
                          {userOrders.map(order => (
                            <div key={order.id} className="order-item-mini">
                              <div className="order-mini-header">
                                <span className="order-id">Order #{order.id}</span>
                                <span 
                                  className="order-status-badge" 
                                  style={{ backgroundColor: getStatusColor(order.status) }}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <div className="order-mini-info">
                                <span>{order.items?.length || 0} items</span>
                                <span className="order-total">₹{order.total?.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="dropdown-links">
                    {/* Show My Dashboard and Order Tracking only for non-admin users */}
                    {!userIsAdmin && (
                      <>
                        {hasPageAccess(user, 'dashboard') && (
                          <Link 
                            to="/dashboard" 
                            className="dropdown-link"
                            onClick={() => setShowProfileDropdown(false)}
                          >
                            <FaTachometerAlt /> My Dashboard
                          </Link>
                        )}
                        {hasPageAccess(user, 'orders') && (
                          <Link 
                            to="/orders" 
                            className="dropdown-link"
                            onClick={() => setShowProfileDropdown(false)}
                          >
                            <FaBox /> Order Tracking
                          </Link>
                        )}
                      </>
                    )}
                    {userIsAdmin && hasPageAccess(user, 'admin') && (
                      <Link 
                        to="/admin" 
                        className="dropdown-link admin-link"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaCog /> Admin Panel
                      </Link>
                    )}
                    {userIsProfessional && hasPageAccess(user, 'professional') && (
                      <Link 
                        to="/professional" 
                        className="dropdown-link professional-link"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaBriefcase /> My Tasks
                      </Link>
                    )}
                    <button onClick={handleLogout} className="dropdown-link logout-link">
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="icon-link" title="Login">
                <FaSignInAlt /> Login
              </Link>
              <Link to="/register" className="icon-link" title="Register">
                <FaSignInAlt /> Register
              </Link>
            </div>
          )}
          <Link to="/cart" className="icon-link cart-icon" title="Cart">
            <FaShoppingCart />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
          <Link to="/wishlist" className="icon-link wishlist-icon" title="Wishlist">
            <FaHeart />
            {wishlistCount > 0 && <span className="cart-count">{wishlistCount}</span>}
          </Link>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          
          {/* Protected routes - User role */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole={ROLES.USER} pageName="dashboard">
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute requiredRole={ROLES.USER} pageName="orders">
                <OrderTracking />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected routes - Admin role */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN} pageName="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected routes - Professional role */}
          <Route 
            path="/professional" 
            element={
              <ProtectedRoute requiredRole={ROLES.PROFESSIONAL} pageName="professional">
                <ProfessionalDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; 2024 SanjuCart. All rights reserved.</p>
      </footer>
      
      {/* Floating Chatbot */}
      <Chatbot />

      {/* Toast Notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
          position="center"
        />
      )}
    </div>
  );
}

export default App;
