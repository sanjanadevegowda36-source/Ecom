import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductContext, ROLES, PAGE_PERMISSIONS } from '../context/ProductContext';
import AdminUserManagement from './AdminUserManagement';
import AdminOrderManagement from './AdminOrderManagement';
import AdminProductManagement from './AdminProductManagement';
import { FaUsers, FaBox, FaPlus, FaBriefcase, FaLock, FaCheck, FaTimes, FaUserTie, FaMotorcycle, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './AdminDashboard.css';

/**
 * AdminDashboard - Main admin dashboard for managing the entire application
 * Features: Order Management, User Management, Worker Management, Task Assignment
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { getAllOrders, logoutUser, user, users, orders, workerTasks, assignTaskToWorker, createProfessional, getAllUsers, updateUserPageAccess } = useProductContext();
  const [activeTab, setActiveTab] = useState('orders');
  
  // Page access management state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPageAccess, setUserPageAccess] = useState([]);
  const [showPageAccessModal, setShowPageAccessModal] = useState(false);
  
  // Professional creation state
  const [showProfessionalForm, setShowProfessionalForm] = useState(false);
  const [professionalFormData, setProfessionalFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  // Worker creation state (for professionals tab)
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [workerFormData, setWorkerFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  // Calculate statistics - directly from orders context
  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.status === 'Processing' || o.status === 'Order Confirmed').length,
    shipped: orders.filter(o => o.status === 'Out for Delivery').length,
    delivered: orders.filter(o => o.status === 'Delivered' || o.status === 'Delivered in 2 Days').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0),
    totalUsers: users.length,
    totalProfessionals: users.filter(u => u.role === ROLES.PROFESSIONAL).length,
    pendingTasks: workerTasks.filter(t => t.status === 'pending').length
  };

  // Get professionals/workers list
  const workers = users.filter(u => u.role === ROLES.PROFESSIONAL);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // Handle worker creation
  const handleCreateWorker = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(workerFormData.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Validate phone number (Indian format: 10 digits, starts with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (workerFormData.phoneNumber && !phoneRegex.test(workerFormData.phoneNumber.replace(/\s/g, ''))) {
      alert('Please enter a valid 10-digit Indian phone number (e.g., 9876543210)');
      return;
    }
    
    // Validate password (at least 8 characters, 1 uppercase, 1 lowercase, 1 number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(workerFormData.password)) {
      alert('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number');
      return;
    }
    
    // Validate password match
    if (workerFormData.password !== workerFormData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    // Validate required fields
    if (!workerFormData.name || !workerFormData.email || !workerFormData.password) {
      alert('Please fill in all required fields');
      return;
    }
    
    const result = await createProfessional({
      name: workerFormData.name,
      email: workerFormData.email,
      phoneNumber: workerFormData.phoneNumber,
      password: workerFormData.password
    });

    if (result.success) {
      alert('Professional account created successfully!');
      // Refresh the users list to show the new professional
      getAllUsers();
      setShowWorkerForm(false);
      setWorkerFormData({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
      });
    } else {
      alert(result.message || 'Failed to create professional account');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-title">
          <h1><FaBox /> Admin Dashboard</h1>
          <p>Manage Orders, Users, Workers & Tasks</p>
        </div>
        <div className="header-actions">
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Orders</span>
        </div>
        <div className="quick-stat-card processing">
          <span className="stat-number">{stats.processing}</span>
          <span className="stat-label">Processing</span>
        </div>
        <div className="quick-stat-card delivered">
          <span className="stat-number">{stats.delivered}</span>
          <span className="stat-label">Delivered</span>
        </div>
        <div className="quick-stat-card users">
          <span className="stat-number">{stats.totalUsers}</span>
          <span className="stat-label">Users</span>
        </div>
        <div className="quick-stat-card workers">
          <span className="stat-number">{stats.totalProfessionals}</span>
          <span className="stat-label">Professionals</span>
        </div>
        <div className="quick-stat-card revenue">
          <span className="stat-number">₹{stats.totalRevenue.toFixed(0)}</span>
          <span className="stat-label">Revenue</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <FaBox /> Order Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <FaBox /> Product Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers /> User Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'professionals' ? 'active' : ''}`}
          onClick={() => setActiveTab('professionals')}
        >
          <FaUserTie /> Professional Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'pageAccess' ? 'active' : ''}`}
          onClick={() => setActiveTab('pageAccess')}
        >
          <FaLock /> Page Access
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'orders' && <AdminOrderManagement />}
        
        {activeTab === 'products' && <AdminProductManagement />}
        
        {activeTab === 'users' && <AdminUserManagement />}
        
        {activeTab === 'professionals' && (
          <div className="workers-section">
            <div className="section-header">
              <h2>Professional Management</h2>
              <button 
                className="btn-add-worker"
                onClick={() => setShowWorkerForm(!showWorkerForm)}
              >
                <FaPlus /> Create Professional
              </button>
            </div>

            {/* Worker Creation Form */}
            {showWorkerForm && (
              <div className="worker-form-container">
                <h3>Create New Professional Account</h3>
                <form onSubmit={handleCreateWorker} className="worker-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name <span className="required">*</span></label>
                      <input
                        type="text"
                        value={workerFormData.name}
                        onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                        placeholder="Professional full name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email <span className="required">*</span></label>
                      <input
                        type="email"
                        value={workerFormData.email}
                        onChange={(e) => setWorkerFormData({ ...workerFormData, email: e.target.value })}
                        placeholder="professional@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={workerFormData.phoneNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setWorkerFormData({ ...workerFormData, phoneNumber: val });
                        }}
                        placeholder="9876543210"
                        maxLength={10}
                      />
                      <span className="validation-hint">10-digit Indian mobile number starting with 6-9 (optional)</span>
                    </div>
                    <div className="form-group">
                      <label>Password <span className="required">*</span></label>
                      <input
                        type="password"
                        value={workerFormData.password}
                        onChange={(e) => setWorkerFormData({ ...workerFormData, password: e.target.value })}
                        placeholder="Enter password"
                        required
                      />
                      <span className="validation-hint">At least 8 characters with uppercase, lowercase & number</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={workerFormData.confirmPassword}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-submit">Create Professional</button>
                    <button 
                      type="button" 
                      className="btn-cancel"
                      onClick={() => setShowWorkerForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Workers List */}
            <div className="workers-list">
              <table className="workers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="no-data">No professionals found. Create a professional account above.</td>
                    </tr>
                  ) : (
                    workers.map(worker => (
                      <tr key={worker.id || worker._id || worker.email}>
                        <td>{worker.name}</td>
                        <td>{worker.email}</td>
                        <td>{worker.phoneNumber || 'N/A'}</td>
                        <td>{worker.createdAt ? new Date(worker.createdAt).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pageAccess' && (
          <div className="page-access-section">
            <div className="section-header">
              <h2>Page Access Management</h2>
              <p>Assign specific page access to users</p>
            </div>
            
            <div className="page-access-users">
              <h3>Select User</h3>
              <div className="users-list">
                {getAllUsers().filter(u => u.role !== ROLES.ADMIN).map(user => (
                  <div 
                    key={user.email} 
                    className={`user-card ${selectedUser?.email === user.email ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedUser(user);
                      setUserPageAccess(user.pageAccess || []);
                    }}
                  >
                    <div className="user-info">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <span className="user-role">{user.role}</span>
                    </div>
                    <div className="access-indicator">
                      {user.pageAccess?.length || 0} pages assigned
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedUser && (
              <div className="page-access-settings">
                <h3>Page Access for {selectedUser.name}</h3>
                <div className="pages-grid">
                  {Object.entries(PAGE_PERMISSIONS).map(([page, allowedRoles]) => (
                    <div key={page} className="page-item">
                      <label className="page-label">
                        <input
                          type="checkbox"
                          checked={userPageAccess.includes(page)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUserPageAccess([...userPageAccess, page]);
                            } else {
                              setUserPageAccess(userPageAccess.filter(p => p !== page));
                            }
                          }}
                        />
                        <span className="page-name">{page.charAt(0).toUpperCase() + page.slice(1)}</span>
                        {allowedRoles.includes(ROLES.ADMIN) && !allowedRoles.includes(ROLES.USER) && <span className="admin-only-badge">Admin Only</span>}
                      </label>
                    </div>
                  ))}
                </div>
                <button 
                  className="btn-save-access"
                  onClick={() => {
                    updateUserPageAccess(selectedUser.email, userPageAccess);
                    alert('Page access updated successfully!');
                    setSelectedUser(null);
                    setUserPageAccess([]);
                  }}
                >
                  <FaCheck /> Save Page Access
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
