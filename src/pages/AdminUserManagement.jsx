import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductContext, ROLES, PAGE_PERMISSIONS } from '../context/ProductContext';
import { FaUser, FaEdit, FaTrash, FaSearch, FaPlus, FaTimes, FaCheck, FaKey, FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const { users, orders, updateUser, deleteUser, logoutUser, registerUser, getAllUsers, updateUserPageAccess, approveUser } = useProductContext();
  
  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPageAccess, setUserPageAccess] = useState([]);
  const [showPageAccessModal, setShowPageAccessModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    role: ROLES.USER
  });

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber?.includes(searchTerm)
  );

  // Get user order count
  const getUserOrderCount = (email) => {
    return orders.filter(order => order.userEmail === email).length;
  };

  // Get user total spending
  const getUserTotalSpending = (email) => {
    return orders
      .filter(order => order.userEmail === email)
      .reduce((sum, order) => sum + (order.total || 0), 0);
  };

  // Handle edit user
  const handleEdit = (user) => {
    setEditingUser(user.email);
    setEditForm({ ...user });
  };

  // Handle save edit
  const handleSave = () => {
    updateUser(editingUser, editForm);
    setEditingUser(null);
    setEditForm({});
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditingUser(null);
    setEditForm({});
  };

  // Handle delete user
  const handleDelete = (email) => {
    if (window.confirm(`Are you sure you want to delete user: ${email}?`)) {
      deleteUser(email);
    }
  };

  // Handle approve/reject user
  const handleApprove = async (userId, isApproved) => {
    const result = await approveUser(userId, isApproved);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  // Handle add new user
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill in required fields (name, email, password)');
      return;
    }
    
    const result = registerUser(newUser, newUser.role);
    if (result.success) {
      alert('User created successfully!');
      setShowAddModal(false);
      setNewUser({ name: '', email: '', phoneNumber: '', address: '', password: '', role: ROLES.USER });
    } else {
      alert(result.message);
    }
  };

  // Handle page access edit
  const handlePageAccessEdit = (user) => {
    setSelectedUser(user);
    setUserPageAccess(user.pageAccess || []);
    setShowPageAccessModal(true);
  };

  // Save page access
  const handleSavePageAccess = () => {
    if (selectedUser) {
      updateUserPageAccess(selectedUser.email, userPageAccess);
      alert('Page access updated successfully!');
      setShowPageAccessModal(false);
      setSelectedUser(null);
    }
  };

  // Get list of available pages
  const availablePages = Object.keys(PAGE_PERMISSIONS);

  return (
    <div className="user-management">
      <div className="section-header">
        <button onClick={handleLogout} className="btn-logout">
          <FaSignOutAlt /> Logout
        </button>
        <h2><FaUser /> User Management</h2>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Add User
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No users found</td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.email}>
                  {editingUser === user.email ? (
                    <>
                      <td><input type="text" value={editForm.name || ''} onChange={(e) => setEditForm({...editForm, name: e.target.value})} /></td>
                      <td>{user.email}</td>
                      <td><input type="text" value={editForm.phoneNumber || ''} onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})} /></td>
                      <td>
                        <select value={editForm.role || 'user'} onChange={(e) => setEditForm({...editForm, role: e.target.value})}>
                          <option value="user">User</option>
                          <option value="professional">Professional</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{getUserOrderCount(user.email)}</td>
                      <td>₹{getUserTotalSpending(user.email).toFixed(2)}</td>
                      <td className="action-buttons">
                        <button className="btn-save" onClick={handleSave}><FaCheck /></button>
                        <button className="btn-cancel" onClick={handleCancel}><FaTimes /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td><strong>{user.name || 'N/A'}</strong></td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber || 'N/A'}</td>
                      <td>
                        <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td>
                        {(user.role === 'business_agent' || user.role === 'delivery_agent') ? (
                          user.isApproved ? (
                            <span className="status-approved">Approved</span>
                          ) : (
                            <span className="status-pending">Pending</span>
                          )
                        ) : (
                          <span className="status-approved">-</span>
                        )}
                      </td>
                      <td>{getUserOrderCount(user.email)}</td>
                      <td>₹{getUserTotalSpending(user.email).toFixed(2)}</td>
                      <td className="action-buttons">
                        {(user.role === 'business_agent' || user.role === 'delivery_agent') && !user.isApproved && (
                          <>
                            <button 
                              className="btn-approve" 
                              onClick={() => handleApprove(user._id, true)} 
                              title="Approve"
                            >
                              <FaCheck />
                            </button>
                            <button 
                              className="btn-reject" 
                              onClick={() => handleApprove(user._id, false)} 
                              title="Reject"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        <button className="btn-edit" onClick={() => handleEdit(user)} title="Edit">
                          <FaEdit />
                        </button>
                        <button className="btn-page-access" onClick={() => handlePageAccessEdit(user)} title="Manage Page Access">
                          <FaKey />
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(user.email)} title="Delete">
                          <FaTrash />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={newUser.phoneNumber}
                  onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={newUser.address}
                  onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                  <option value="user">User</option>
                  <option value="professional">Professional</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="btn-submit">Add User</button>
            </form>
          </div>
        </div>
      )}

      {/* Page Access Modal */}
      {showPageAccessModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Manage Page Access - {selectedUser.name || selectedUser.email}</h3>
              <button className="modal-close" onClick={() => setShowPageAccessModal(false)}>×</button>
            </div>
            <div className="page-access-list">
              <p className="info-text">Select which pages this user can access:</p>
              {availablePages.map(page => (
                <div key={page} className="page-access-item">
                  <label>
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
                    <span className="page-roles">
                      (Allowed: {PAGE_PERMISSIONS[page]?.join(', ') || 'none'})
                    </span>
                  </label>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-submit" onClick={handleSavePageAccess}>
                Save Page Access
              </button>
              <button className="btn-cancel" onClick={() => setShowPageAccessModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
