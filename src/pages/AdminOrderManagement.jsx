import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import { FaBox, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaDownload, FaArrowLeft, FaSignOutAlt, FaMotorcycle, FaPhone, FaUserTie, FaMapMarkerAlt } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminOrderManagement = () => {
  const navigate = useNavigate();
  const { updateOrderStatus, deleteOrder, orderStatuses, logoutUser, orders } = useProductContext();
  
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  
  // Fetch delivery agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/delivery-agents/available');
        const data = await response.json();
        setDeliveryAgents(data);
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };
    fetchAgents();
  }, []);
  
  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchOrder, setSearchOrder] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Get the selected order object
  const selectedOrder = selectedOrderId ? orders.find(o => o.id === selectedOrderId) : null;

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchOrder === '' || 
      order.id?.toString().includes(searchOrder) ||
      order._id?.toString().includes(searchOrder) ||
      order.userEmail?.toLowerCase().includes(searchOrder.toLowerCase()) ||
      order.userName?.toLowerCase().includes(searchOrder.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    outForDelivery: orders.filter(o => o.status === 'Out for Delivery').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0),
  };

  // Calculate GST from order
  const calculateGst = (order) => {
    if (order.gst) return parseFloat(order.gst);
    // Fallback calculation
    return order.items?.reduce((sum, item) => {
      return sum + (parseFloat(item.gstAmount || 0) * item.quantity);
    }, 0) || 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return '#ff9800';
      case 'Shipped': return '#2196f3';
      case 'Out for Delivery': return '#9c27b0';
      case 'Delivered': return '#4caf50';
      case 'Cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm(`Are you sure you want to delete Order #${orderId}?`)) {
      deleteOrder(orderId);
    }
  };

  // Handle assign agent to order
  const handleAssignAgent = async () => {
    if (!selectedAgent) {
      alert('Please select a delivery agent');
      return;
    }

    const agent = deliveryAgents.find(a => a._id === selectedAgent);
    if (!agent) return;

    try {
      const response = await fetch(`/api/orders/${selectedOrderId}/assign-agent`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent._id,
          agentName: agent.name,
          agentPhone: agent.phoneNumber
        })
      });

      if (response.ok) {
        alert('Delivery agent assigned successfully!');
        setShowAssignModal(false);
        setSelectedAgent('');
        // Refresh the orders
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.message || 'Error assigning agent');
      }
    } catch (error) {
      alert('Error assigning agent');
    }
  };

  return (
    <div className="order-management">
      <div className="section-header">
        <button onClick={handleLogout} className="btn-logout">
          <FaSignOutAlt /> Logout
        </button>
        <h2><FaBox /> Order Management</h2>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card total">
          <h3>{stats.total}</h3>
          <p>Total Orders</p>
        </div>
        <div className="stat-card processing">
          <h3>{stats.processing}</h3>
          <p>Processing</p>
        </div>
        <div className="stat-card shipped">
          <h3>{stats.shipped}</h3>
          <p>Shipped</p>
        </div>
        <div className="stat-card delivery">
          <h3>{stats.outForDelivery}</h3>
          <p>Out for Delivery</p>
        </div>
        <div className="stat-card delivered">
          <h3>{stats.delivered}</h3>
          <p>Delivered</p>
        </div>
        <div className="stat-card cancelled">
          <h3>{stats.cancelled}</h3>
          <p>Cancelled</p>
        </div>
        <div className="stat-card revenue">
          <h3>₹{stats.totalRevenue.toFixed(2)}</h3>
          <p>Total Revenue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID, Email, or Name..."
            value={searchOrder}
            onChange={(e) => setSearchOrder(e.target.value)}
          />
        </div>
        <div className="status-filter">
          <FaFilter className="filter-icon" />
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Orders</option>
            {orderStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Subtotal</th>
              <th>GST</th>
              <th>Total</th>
              <th>Current Status</th>
              <th>Update Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-orders">No orders found</td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id}</td>
                  <td>
                    <div className="customer-info">
                      <strong>{order.userName || 'N/A'}</strong>
                      <span>{order.userEmail}</span>
                    </div>
                  </td>
                  <td>{new Date(order.createdAt || order.date).toLocaleDateString('en-IN')}</td>
                  <td>{order.items?.length || 0}</td>
                  <td className="order-subtotal">₹{parseFloat(order.subtotal || 0).toFixed(2)}</td>
                  <td className="order-gst">₹{calculateGst(order).toFixed(2)}</td>
                  <td className="order-total">₹{(order.totalAmount || order.total)?.toFixed(2)}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {orderStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-view"
                        onClick={() => setSelectedOrderId(order.id || order._id)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteOrder(order.id)}
                        title="Delete Order"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrderId && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content order-details-modal">
            <div className="modal-header">
              <h3>Order Details #{selectedOrderId}</h3>
              <button className="modal-close" onClick={() => setSelectedOrderId(null)}>×</button>
            </div>
            <div className="order-full-details">
              <div className="detail-section">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.userName}</p>
                <p><strong>Email:</strong> {selectedOrder.userEmail}</p>
                <p><strong>Address:</strong> {selectedOrder.address}</p>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod?.toUpperCase()}</p>
              </div>
              <div className="detail-section">
                <h4>Order Status</h4>
                <p><strong>Status:</strong> 
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedOrder.status), marginLeft: '10px' }}
                  >
                    {selectedOrder.status}
                  </span>
                </p>
                <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt || selectedOrder.date).toLocaleString('en-IN')}</p>
                
                {/* Delivery Agent Info */}
                {selectedOrder.deliveryAgent && selectedOrder.deliveryAgent.agentName ? (
                  <div className="assigned-agent-info">
                    <p><strong><FaMotorcycle /> Assigned Delivery Agent:</strong></p>
                    <p><FaUserTie /> {selectedOrder.deliveryAgent.agentName}</p>
                    <p><FaPhone /> {selectedOrder.deliveryAgent.agentPhone}</p>
                    {selectedOrder.deliveryAgent.currentLocation?.address && (
                      <p><FaMapMarkerAlt /> {selectedOrder.deliveryAgent.currentLocation.address}</p>
                    )}
                  </div>
                ) : (
                  <button 
                    className="btn-assign-agent"
                    onClick={() => setShowAssignModal(true)}
                    style={{ marginTop: '10px' }}
                  >
                    <FaMotorcycle /> Assign Delivery Agent
                  </button>
                )}
              </div>
              <div className="detail-section">
                <h4>Items</h4>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>₹{item.price}</td>
                        <td>{item.quantity}</td>
                        <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="detail-section totals">
                <div className="total-row grand-total">
                  <span>Total:</span>
                  <span>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Agent Modal */}
      {showAssignModal && selectedOrderId && (
        <div className="modal-overlay">
          <div className="modal-content assign-agent-modal">
            <div className="modal-header">
              <h3><FaMotorcycle /> Assign Delivery Agent</h3>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Select a delivery agent for this order:</p>
              <select 
                value={selectedAgent} 
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="agent-select"
                style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
              >
                <option value="">-- Select Agent --</option>
                {deliveryAgents.map(agent => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name} - {agent.phoneNumber} ({agent.vehicleType})
                  </option>
                ))}
              </select>
              
              {deliveryAgents.length === 0 && (
                <p className="no-agents" style={{ color: 'red' }}>No available agents. Please add agents first in Admin Dashboard.</p>
              )}
              
              <div className="modal-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button 
                  className="btn-confirm"
                  onClick={handleAssignAgent}
                  disabled={!selectedAgent || deliveryAgents.length === 0}
                  style={{ flex: 1, padding: '10px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Assign Agent
                </button>
                <button 
                  onClick={() => setShowAssignModal(false)}
                  style={{ flex: 1, padding: '10px', background: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderManagement;
