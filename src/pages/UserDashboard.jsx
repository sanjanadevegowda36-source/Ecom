import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductContext, getProductIcon } from '../context/ProductContext';
import { FaBox, FaUser, FaDownload, FaFileInvoice, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import './UserDashboard.css';

// Helper to render product icon (handles both old emoji and new iconName)
const renderProductIcon = (item) => {
  if (item.iconName) {
    return getProductIcon(item.iconName);
  }
  return item.image || <FaBox />;
};

// Generate invoice content as HTML
const generateInvoiceHTML = (order) => {
  const gstAmount = order.gst || order.items?.reduce((sum, item) => {
    return sum + (parseFloat(item.gstAmount || 0) * item.quantity);
  }, 0) || 0;

  const itemsHTML = order.items?.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>₹${item.basePrice}</td>
      <td>${item.quantity}</td>
      <td>₹${item.gstAmount}</td>
      <td>₹${item.totalPrice}</td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice #${order.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .invoice-header { text-align: center; margin-bottom: 30px; }
        .invoice-details { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f5f5f5; }
        .totals { margin-top: 20px; text-align: right; }
        .total-row { padding: 5px 0; }
        .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <h1>🛒 SanjuCart</h1>
        <h2>Invoice</h2>
      </div>
      <div class="invoice-details">
        <p><strong>Order ID:</strong> #${order.id}</p>
        <p><strong>Date:</strong> ${new Date(order.date).toLocaleString('en-IN')}</p>
        <p><strong>Customer:</strong> ${order.userName}</p>
        <p><strong>Email:</strong> ${order.userEmail}</p>
        <p><strong>Delivery Address:</strong> ${order.address}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod?.toUpperCase()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>GST</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
      <div class="totals">
        <div class="total-row">Subtotal: ₹${parseFloat(order.subtotal || 0).toFixed(2)}</div>
        <div class="total-row">Discount: -₹${parseFloat(order.discount || 0).toFixed(2)}</div>
        <div class="total-row">Profit: +₹${parseFloat(order.profit || 0).toFixed(2)}</div>
        <div class="total-row">GST (18%): +₹${parseFloat(gstAmount).toFixed(2)}</div>
        <div class="total-row grand-total">Total: ₹${order.total?.toFixed(2)}</div>
      </div>
    </body>
    </html>
  `;
};

// Download invoice function
const downloadInvoice = (order) => {
  const invoiceHTML = generateInvoiceHTML(order);
  const blob = new Blob([invoiceHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${order.id}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance.toFixed(1);
};

// Get delivery agent info for an order
const getDeliveryAgentInfo = (order) => {
  if (!order.deliveryAgent || !order.deliveryAgent.agentId) {
    return null;
  }
  return order.deliveryAgent;
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, getUserOrders, logoutUser } = useProductContext();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user?.email) {
      const userOrders = getUserOrders(user.email);
      setOrders(userOrders);
    }
  }, [user, getUserOrders]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
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

  const getStatusSteps = (status) => {
    const allSteps = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentIndex = allSteps.indexOf(status);
    return allSteps.map((step, index) => ({
      name: step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  // Calculate GST from order
  const calculateGst = (order) => {
    if (order.gst) return parseFloat(order.gst);
    return order.items?.reduce((sum, item) => {
      return sum + (parseFloat(item.gstAmount || 0) * item.quantity);
    }, 0) || 0;
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name || 'User'}</h1>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>

      <div className="dashboard-content">
        <div className="orders-section">
          <h2>My Orders</h2>
          
          {orders.length === 0 ? (
            <div className="no-orders">
              <p>You haven't placed any orders yet.</p>
              <button onClick={() => navigate('/products')} className="btn-shop-now">
                Shop Now
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Order #{order.id}</h3>
                      <p className="order-date">
                        {new Date(order.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {/* Profile Icon with Order Status inside */}
                    <div className="order-status-profile" title={order.status}>
                      <FaUser className="profile-icon" />
                      <span className="profile-status-text">{order.status}</span>
                    </div>
                  </div>

                  <div className="order-items-preview">
                    <p><strong>Items:</strong> {order.items?.length || 0} product(s)</p>
                    <div className="order-price-breakup">
                      <p className="order-subtotal">Subtotal: ₹{parseFloat(order.subtotal || 0).toFixed(2)}</p>
                      <p className="order-discount">Discount: -₹{parseFloat(order.discount || 0).toFixed(2)}</p>
                      <p className="order-profit">Profit: +₹{parseFloat(order.profit || 0).toFixed(2)}</p>
                      <p className="order-gst">GST (18%): +₹{calculateGst(order).toFixed(2)}</p>
                      <p className="order-total"><strong>Total:</strong> ₹{order.total?.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Order Status Progress Tracker */}
                  <div className="order-progress">
                    <div className="progress-steps">
                      {getStatusSteps(order.status).map((step, index) => (
                        <div 
                          key={step.name} 
                          className={`progress-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}
                        >
                          <div className="step-circle">
                            {step.completed ? '✓' : index + 1}
                          </div>
                          <span className="step-label">{step.name}</span>
                          {index < getStatusSteps(order.status).length - 1 && (
                            <div className={`step-line ${step.completed ? 'completed' : ''}`}></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="order-actions">
                    <button 
                      className="btn-view-details"
                      onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                    >
                      {selectedOrder === order.id ? 'Hide Details' : 'View Details'}
                    </button>
                    <button 
                      className="btn-download-invoice"
                      onClick={() => downloadInvoice(order)}
                      title="Download Invoice"
                    >
                      <FaDownload /> Invoice
                    </button>
                  </div>

                  {selectedOrder === order.id && (
                    <div className="order-details">
                      <h4>Order Details</h4>
                      <div className="details-grid">
                        <div className="detail-item">
                          <strong>Delivery Address:</strong>
                          <p>{order.address}</p>
                        </div>
                        <div className="detail-item">
                          <strong>Payment Method:</strong>
                          <p>{order.paymentMethod?.toUpperCase()}</p>
                        </div>
                      </div>
                      {getDeliveryAgentInfo(order) && (
                        <div className="delivery-agent-info">
                          <h4><FaMapMarkerAlt /> Delivery Agent Information</h4>
                          <div className="agent-details">
                            <div className="agent-item">
                              <FaUser />
                              <span><strong>Name:</strong> {getDeliveryAgentInfo(order).agentName}</span>
                            </div>
                            <div className="agent-item">
                              <FaPhone />
                              <span><strong>Phone:</strong> {getDeliveryAgentInfo(order).agentPhone}</span>
                            </div>
                            {getDeliveryAgentInfo(order).currentLocation && getDeliveryAgentInfo(order).currentLocation.address && (
                              <div className="agent-item">
                                <FaMapMarkerAlt />
                                <span><strong>Current Location:</strong> {getDeliveryAgentInfo(order).currentLocation.address}</span>
                              </div>
                            )}
                            {order.shippingAddress && getDeliveryAgentInfo(order).currentLocation && (
                              <div className="distance-info">
                                <strong>Distance from you:</strong>
                                {(() => {
                                  // For demo purposes, we'll use a mock user location
                                  // In production, you'd get the user's actual location
                                  const userLat = 12.9716; // Example: Bangalore
                                  const userLng = 77.5946;
                                  const agentLat = getDeliveryAgentInfo(order).currentLocation?.latitude;
                                  const agentLng = getDeliveryAgentInfo(order).currentLocation?.longitude;
                                  const distance = calculateDistance(userLat, userLng, agentLat, agentLng);
                                  return distance ? <span> {distance} km away</span> : <span> Calculating...</span>;
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="order-items-list">
                        <strong>Products:</strong>
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="order-item">
                            <span>{renderProductIcon(item)} {item.name}</span>
                            <span>Qty: {item.quantity}</span>
                            <span>₹{item.totalPrice}</span>
                          </div>
                        ))}
                      </div>
                      <div className="price-summary">
                        <div className="price-row">
                          <span>Subtotal:</span>
                          <span>₹{parseFloat(order.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="price-row">
                          <span>Discount:</span>
                          <span>-₹{parseFloat(order.discount || 0).toFixed(2)}</span>
                        </div>
                        <div className="price-row">
                          <span>Profit:</span>
                          <span>+₹{parseFloat(order.profit || 0).toFixed(2)}</span>
                        </div>
                        <div className="price-row">
                          <span>GST (18%):</span>
                          <span>+₹{calculateGst(order).toFixed(2)}</span>
                        </div>
                        <div className="price-row total">
                          <span>Total:</span>
                          <span>₹{order.total?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
