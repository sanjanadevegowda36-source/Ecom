import React, { useState, useEffect } from 'react';
import { FaBox, FaDownload, FaSearch, FaClock, FaCheckCircle, FaShippingFast, FaHome, FaTimes, FaMotorcycle, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useProductContext } from '../context/ProductContext';
import './OrderTracking.css';

/**
 * OrderTracking - Page for users to track their orders and download PDF invoices
 */
const OrderTracking = () => {
  const { user, getUserOrders, calculateFinalPrice } = useProductContext();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchOrderId, setSearchOrderId] = useState('');

  useEffect(() => {
    if (user?.email) {
      const userOrders = getUserOrders(user.email);
      setOrders(userOrders.reverse()); // Most recent first
    }
  }, [user, getUserOrders]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Order Confirmed': return <FaCheckCircle />;
      case 'Processing': return <FaClock />;
      case 'Out for Delivery': return <FaShippingFast />;
      case 'Delivered in 2 Days':
      case 'Delivered': return <FaHome />;
      default: return <FaBox />;
    }
  };

  const getStatusStep = (status) => {
    const statusOrder = ['Order Confirmed', 'Processing', 'Out for Delivery', 'Delivered in 2 Days', 'Delivered'];
    return statusOrder.indexOf(status);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate PDF invoice
  const generateInvoice = (order) => {
    // Create invoice content as HTML
    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - Order #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #667eea; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #667eea; }
          .invoice-title { font-size: 24px; color: #333; margin-top: 10px; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-box { background: #f9f9f9; padding: 20px; border-radius: 8px; width: 45%; }
          .info-box h3 { margin: 0 0 10px 0; color: #667eea; font-size: 14px; }
          .info-box p { margin: 5px 0; color: #333; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #667eea; color: white; font-weight: 600; }
          .totals { text-align: right; }
          .totals p { margin: 5px 0; }
          .total-row { font-size: 18px; font-weight: bold; color: #667eea; }
          .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
          .status { display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">SanjuCart</div>
          <div class="invoice-title">INVOICE</div>
        </div>
        
        <div class="info-section">
          <div class="info-box">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> #${order.id}</p>
            <p><strong>Date:</strong> ${formatDate(order.date)}</p>
            <p><strong>Status:</strong> <span class="status">${order.status}</span></p>
          </div>
          <div class="info-box">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${order.shippingAddress?.name || order.userName}</p>
            <p><strong>Email:</strong> ${order.userEmail}</p>
            <p><strong>Phone:</strong> ${order.shippingAddress?.phone || 'N/A'}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Brand</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.brand}</td>
                <td>${item.quantity}</td>
                <td>₹${parseFloat(item.finalPrice).toFixed(2)}</td>
                <td>₹${(parseFloat(item.finalPrice) * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <p>Subtotal: ₹${order.subtotal}</p>
          <p>Discount: ₹${order.discount}</p>
          <p>GST: ₹${order.gst}</p>
          <p class="total-row">Total: ₹${order.total.toFixed(2)}</p>
        </div>
        
        <div class="info-section" style="margin-top: 30px;">
          <div class="info-box">
            <h3>Shipping Address</h3>
            <p>${order.shippingAddress?.address || order.userEmail}</p>
          </div>
          <div class="info-box">
            <h3>Payment Method</h3>
            <p>${order.paymentMethod || 'Credit/Debit Card'}</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for shopping with SanjuCart!</p>
          <p>For any queries, contact support@sanjucart.com</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window for printing/saving
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredOrders = searchOrderId 
    ? orders.filter(order => order.id.toString().includes(searchOrderId))
    : orders;

  return (
    <div className="order-tracking-container">
      <div className="order-tracking-header">
        <h1><FaBox /> Order Tracking</h1>
        <p>Track your orders and download invoices</p>
      </div>

      {/* Search Order */}
      <div className="order-search-section">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-section">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <FaBox className="no-orders-icon" />
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map(order => (
              <div 
                key={order.id} 
                className="order-card"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="order-card-header">
                  <div className="order-id">Order #{order.id}</div>
                  <div className="order-status" style={{ 
                    backgroundColor: order.status === 'Cancelled' ? '#fee' : '#e8f5e9',
                    color: order.status === 'Cancelled' ? '#f44336' : '#4caf50'
                  }}>
                    {order.status}
                  </div>
                </div>
                <div className="order-card-body">
                  <div className="order-info-row">
                    <span>Items:</span>
                    <strong>{order.items?.length || 0} products</strong>
                  </div>
                  <div className="order-info-row">
                    <span>Total:</span>
                    <strong className="order-total">₹{order.total?.toFixed(2)}</strong>
                  </div>
                  <div className="order-info-row">
                    <span>Date:</span>
                    <span>{formatDate(order.date)}</span>
                  </div>
                </div>
                <div className="order-card-footer">
                  <button className="view-details-btn">View Details</button>
                  <button 
                    className="download-invoice-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      generateInvoice(order);
                    }}
                  >
                    <FaDownload /> Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h2>Order #{selectedOrder.id}</h2>
              <button className="close-modal" onClick={() => setSelectedOrder(null)}>
                <FaTimes />
              </button>
            </div>

            {/* Order Progress */}
            <div className="order-progress">
              <div className={`progress-step ${getStatusStep(selectedOrder.status) >= 0 ? 'active' : ''}`}>
                <div className="step-icon"><FaCheckCircle /></div>
                <span>Confirmed</span>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${getStatusStep(selectedOrder.status) >= 1 ? 'active' : ''}`}>
                <div className="step-icon"><FaClock /></div>
                <span>Processing</span>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${getStatusStep(selectedOrder.status) >= 2 ? 'active' : ''}`}>
                <div className="step-icon"><FaShippingFast /></div>
                <span>Shipped</span>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${getStatusStep(selectedOrder.status) >= 3 ? 'active' : ''}`}>
                <div className="step-icon"><FaHome /></div>
                <span>Delivered</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="order-items-section">
              <h3>Order Items</h3>
              <div className="order-items-list">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      <FaBox />
                    </div>
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>{item.brand}</p>
                      <p className="item-qty">Qty: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      <span>₹{parseFloat(item.finalPrice).toFixed(2)}</span>
                      <span className="item-total">₹{(parseFloat(item.finalPrice) * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary-section">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Discount</span>
                <span>-₹{selectedOrder.discount}</span>
              </div>
              <div className="summary-row">
                <span>GST</span>
                <span>₹{selectedOrder.gst}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{selectedOrder.total?.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="shipping-section">
              <h3>Shipping Address</h3>
              <p>{selectedOrder.shippingAddress?.address || selectedOrder.userEmail}</p>
            </div>

            {/* Delivery Agent Info */}
            {selectedOrder.deliveryAgent && selectedOrder.deliveryAgent.agentName && (
              <div className="delivery-agent-section">
                <h3><FaMotorcycle /> Delivery Agent Details</h3>
                <div className="agent-info">
                  <p><strong>Agent Name:</strong> {selectedOrder.deliveryAgent.agentName}</p>
                  <p><FaPhone /> <strong>Phone:</strong> {selectedOrder.deliveryAgent.agentPhone}</p>
                  {selectedOrder.deliveryAgent.currentLocation?.address && (
                    <p><FaMapMarkerAlt /> <strong>Current Location:</strong> {selectedOrder.deliveryAgent.currentLocation.address}</p>
                  )}
                  <p className="agent-note">Your delivery agent will contact you when arriving.</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="order-modal-actions">
              <button 
                className="download-btn"
                onClick={() => generateInvoice(selectedOrder)}
              >
                <FaDownload /> Download Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
