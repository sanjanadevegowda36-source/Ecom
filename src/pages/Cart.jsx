import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductContext, getProductIcon } from '../context/ProductContext';
import { FaTrash, FaPlus, FaMinus, FaCreditCard, FaMapMarkerAlt, FaBox, FaPhone, FaUser } from 'react-icons/fa';

const API_BASE_URL = 'https://backend-yf0o.onrender.com';
const toApiUrl = (path) => path.startsWith('/api') ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/api${path}`;

// Helper to render product icon (handles both old emoji and new iconName)
const renderProductIcon = (item) => {
  if (item.iconName) {
    return getProductIcon(item.iconName);
  }
  // Fallback for old items with emoji
  return item.image || <FaBox />;
};

function Cart() {
  const navigate = useNavigate();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    calculateCartTotal, 
    calculateFinalPrice,
    user,
    createOrder 
  } = useProductContext();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, address, payment, success
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phoneNumber || '',
    address: user?.address || '',
    useSameAsRegistered: true
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [errors, setErrors] = useState({});
  const [razorpayKey, setRazorpayKey] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Fetch Razorpay key on mount
  useEffect(() => {
    const fetchRazorpayKey = async () => {
      try {
        const response = await fetch(toApiUrl('/payment/key'));
        const data = await response.json();
        console.log('Razorpay key fetched:', data);
        setRazorpayKey(data.key);
      } catch (error) {
        console.error('Error fetching Razorpay key:', error);
      }
    };
    fetchRazorpayKey();
  }, []);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle manual quantity input for bulk orders
  const handleQuantityChange = (item, value) => {
    // Allow typing but don't update cart yet
    // This allows smooth typing without resetting
  };

  // Handle quantity blur or enter - actually update the cart
  const handleQuantityUpdate = (item, value) => {
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      updateQuantity(item.id, newQuantity);
    } else if (value === '' || isNaN(newQuantity)) {
      // Reset to current quantity if empty or invalid
      updateQuantity(item.id, 1);
    } else if (newQuantity < 1) {
      updateQuantity(item.id, 1);
    }
  };

  // Handle quantity increase
  const handleIncrease = (item) => {
    updateQuantity(item.id, item.quantity + 1);
  };

  // Handle quantity decrease
  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  // Handle remove item
  const handleRemove = (id) => {
    removeFromCart(id);
  };

  // Validate shipping address
  const validateShippingAddress = () => {
    const newErrors = {};
    if (!shippingAddress.name.trim()) newErrors.name = 'Name is required';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!shippingAddress.address.trim()) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Proceed to checkout
  const handleProceedToCheckout = () => {
    if (!user) {
      alert('Please login to proceed to checkout');
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    // Pre-fill from user's registered address
    if (user.address) {
      setShippingAddress({
        ...shippingAddress,
        name: user.name || '',
        phone: user.phoneNumber || '',
        address: user.address,
        useSameAsRegistered: true
      });
    }
    setCheckoutStep('address');
  };

  // Handle address submit
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!validateShippingAddress()) {
      return;
    }
    setCheckoutStep('payment');
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Failed to load Razorpay. Please try again.');
        setIsProcessingPayment(false);
        return;
      }

      const totalAmount = calculateCartTotal();
      console.log('Cart total:', totalAmount, 'Cart items:', cart.length);
      
      if (!totalAmount || totalAmount < 1) {
        alert('Cart is empty or invalid total');
        setIsProcessingPayment(false);
        return;
      }
      
      console.log('Sending amount:', totalAmount);
      const orderResponse = await fetch(toApiUrl('/payment/create-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(totalAmount) })
      });
      
      const orderData = await orderResponse.json();
      console.log('Order response status:', orderResponse.status, 'data:', orderData);
      
      if (!orderResponse.ok || !orderData.id) {
        alert('Failed to create payment order: ' + (orderData.message || orderData.error || 'Unknown error'));
        setIsProcessingPayment(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SanjuCart',
        description: 'Order Payment',
        order_id: orderData.id,
        theme: {
          color: '#667eea'
        },
        prefill: {
          name: shippingAddress.name || user?.name || '',
          email: user?.email || '',
          contact: shippingAddress.phone || user?.phoneNumber || ''
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
          redirect: false
        },
        config: {
          display: {
            amount: orderData.amount,
            currency: orderData.currency
          }
        },
        handler: async (response) => {
          const verifyResponse = await fetch(toApiUrl('/payment/verify-payment'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyResponse.json();
          
          if (verifyData.success) {
            const order = createOrder({
              userEmail: user?.email,
              userName: shippingAddress.name,
              shippingAddress: {
                name: shippingAddress.name,
                phone: shippingAddress.phone,
                address: shippingAddress.address
              },
              paymentMethod: 'Razorpay',
            });
            
            setOrderPlaced(order);
            setCheckoutStep('success');
          } else {
            alert('Payment verification failed');
          }
          setIsProcessingPayment(false);
        },
        prefill: {
          name: shippingAddress.name,
          email: user?.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#ff6b35'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
      razorpay.on('payment.failed', (response) => {
        alert('Payment failed: ' + response.error.description);
        setIsProcessingPayment(false);
      });

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  // Handle payment submit
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
      return;
    }
    
    const order = createOrder({
      userEmail: user?.email,
      userName: shippingAddress.name,
      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        address: shippingAddress.address
      },
      paymentMethod: paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery',
    });
    
    setOrderPlaced(order);
    setCheckoutStep('success');
  };

  // Handle use same as registered toggle
  const handleUseSameAsRegistered = (e) => {
    const useSame = e.target.checked;
    setShippingAddress({
      ...shippingAddress,
      useSameAsRegistered: useSame,
      address: useSame && user?.address ? user.address : shippingAddress.address
    });
  };

  // Render cart view
  const renderCartView = () => (
    <div className="cart-view">
      <h2>Shopping Cart ({cart.length} items)</h2>
      
      {cart.length === 0 ? (
        <div className="empty-cart">
          <FaBox className="empty-cart-icon" />
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/products')} className="btn-shop">
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span className="item-icon">{renderProductIcon(item)}</span>
                  )}
                </div>
                <div className="cart-item-details">
                  <span className="item-brand">{item.brand}</span>
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="item-price-breakup">
                    <span>₹{item.price}</span>
                    <span className="discount">(-{item.discount}%)</span>
                    <span>+GST({item.gst}%)</span>
                  </div>
                </div>
                <div className="cart-item-quantity">
                  <button onClick={() => handleDecrease(item)}><FaMinus /></button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item, e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value === '' || parseInt(e.target.value) < 1) {
                        handleQuantityUpdate(item, '1');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      }
                    }}
                    className="quantity-input"
                  />
                  <button onClick={() => handleIncrease(item)}><FaPlus /></button>
                </div>
                <div className="cart-item-price">
                  <span className="final-price">
                    ₹{(calculateFinalPrice(item.price, item.discount, item.profit, item.gst) * item.quantity).toFixed(2)}
                  </span>
                </div>
                <button className="btn-remove" onClick={() => handleRemove(item.id)}>
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
              <span>₹{calculateCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free">Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{calculateCartTotal().toFixed(2)}</span>
            </div>
            <button className="btn-checkout" onClick={handleProceedToCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Render address view
  const renderAddressView = () => (
    <div className="address-view">
      <button className="back-btn" onClick={() => setCheckoutStep('cart')}>
        ← Back to Cart
      </button>
      <h2>Delivery Address</h2>
      
      {/* Registered Email Display */}
      <div className="user-info-card">
        <div className="info-row">
          <FaUser className="info-icon" />
          <span><strong>Registered Email:</strong> {user?.email}</span>
        </div>
        {user?.phoneNumber && (
          <div className="info-row">
            <FaPhone className="info-icon" />
            <span><strong>Registered Phone:</strong> {user.phoneNumber}</span>
          </div>
        )}
      </div>

      {/* Use same as registered checkbox */}
      {user?.address && (
        <div className="registered-address-section">
          <label className="same-address-checkbox">
            <input
              type="checkbox"
              checked={shippingAddress.useSameAsRegistered}
              onChange={handleUseSameAsRegistered}
            />
            <span>Use my registered address for shipping</span>
          </label>
          
          {shippingAddress.useSameAsRegistered && (
            <div className="registered-address-card">
              <h4><FaMapMarkerAlt /> Your Registered Address:</h4>
              <p>{user.address}</p>
            </div>
          )}
        </div>
      )}

      {/* Shipping Address Form */}
      {!shippingAddress.useSameAsRegistered || !user?.address ? (
        <form onSubmit={handleAddressSubmit} className="address-form">
          <div className="form-group">
            <label><FaUser /> Recipient Name *</label>
            <input
              type="text"
              value={shippingAddress.name}
              onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
              placeholder="Enter recipient's name"
              required
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label><FaPhone /> Phone Number *</label>
            <input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
              placeholder="Enter phone number"
              required
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label><FaMapMarkerAlt /> Delivery Address *</label>
            <textarea
              value={shippingAddress.address}
              onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
              placeholder="Enter complete delivery address"
              rows="4"
              required
            ></textarea>
            {errors.address && <span className="error">{errors.address}</span>}
          </div>

          <button type="submit" className="btn-continue">
            Continue to Payment
          </button>
        </form>
      ) : (
        <button 
          type="button" 
          className="btn-continue"
          onClick={() => {
            setShippingAddress({
              ...shippingAddress,
              name: user.name || '',
              phone: user.phoneNumber || '',
              address: user.address
            });
            setCheckoutStep('payment');
          }}
        >
          Continue to Payment
        </button>
      )}
    </div>
  );

  // Render payment view
  const renderPaymentView = () => (
    <div className="payment-view">
      <button className="back-btn" onClick={() => setCheckoutStep('address')}>
        ← Back to Address
      </button>
      <h2>Payment Method</h2>

      <div className="checkout-progress">
        <div className="progress-step completed">
          <span>1</span>
          <p>Address</p>
        </div>
        <div className="progress-line active"></div>
        <div className="progress-step active">
          <span>2</span>
          <p>Payment</p>
        </div>
        <div className="progress-line"></div>
        <div className="progress-step">
          <span>3</span>
          <p>Confirm</p>
        </div>
      </div>

      <div className="order-summary-card">
        <h4>Order Summary</h4>
        <div className="summary-details">
          <p><strong>Items:</strong> {cart.reduce((a, b) => a + b.quantity, 0)}</p>
          <p><strong>Delivery Address:</strong></p>
          <p className="address-text">{shippingAddress.address}</p>
          <p className="total"><strong>Total to Pay: ₹{calculateCartTotal().toFixed(2)}</strong></p>
        </div>
      </div>

      <form onSubmit={handlePaymentSubmit} className="payment-form">
        <div className="payment-options">
          <label className={`payment-option ${paymentMethod === 'razorpay' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="payment"
              value="razorpay"
              checked={paymentMethod === 'razorpay'}
              onChange={() => setPaymentMethod('razorpay')}
            />
            <span>💳 Razorpay</span>
          </label>
          
          <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="payment"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
            />
            <FaCreditCard />
            <span>Credit/Debit Card</span>
          </label>
          
          <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="payment"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={() => setPaymentMethod('upi')}
            />
            <span>📱 UPI</span>
          </label>
          
          <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
            />
            <span>💵 Cash on Delivery</span>
          </label>
        </div>

        {paymentMethod === 'razorpay' && (
          <div className="razorpay-info">
            <p>You will be redirected to Razorpay secure payment gateway to complete your payment.</p>
            <p className="secure-note">🔒 Secure payment powered by Razorpay</p>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="card-details">
            <input type="text" placeholder="Card Number (Dummy)" />
            <div className="card-row">
              <input type="text" placeholder="MM/YY" />
              <input type="text" placeholder="CVV" />
            </div>
            <p className="dummy-note">This is a demo - no real payment will be processed</p>
          </div>
        )}

        {paymentMethod === 'upi' && (
          <div className="upi-details">
            <input type="text" placeholder="UPI ID (Dummy)" />
            <p className="dummy-note">This is a demo - no real payment will be processed</p>
          </div>
        )}

        {paymentMethod === 'cod' && (
          <div className="cod-info">
            <p>You will pay ₹{calculateCartTotal().toFixed(2)} in cash when the order is delivered.</p>
          </div>
        )}

        <button type="submit" className="btn-pay" disabled={isProcessingPayment}>
          {isProcessingPayment 
            ? 'Processing Payment...' 
            : paymentMethod === 'razorpay' 
              ? `Pay Now with Razorpay - ₹${calculateCartTotal().toFixed(2)}`
              : `Confirm Order - Pay ₹${calculateCartTotal().toFixed(2)}`
          }
        </button>
      </form>
    </div>
  );

  // Render success view
  const renderSuccessView = () => (
    <div className="success-view">
      <div className="success-animation">
        <span className="checkmark">✓</span>
      </div>
      <h2>Order Placed Successfully!</h2>
      <p>Thank you for your purchase</p>
      
      <div className="order-details">
        <div className="detail-row">
          <span>Order ID:</span>
          <strong>#{orderPlaced?.id}</strong>
        </div>
        <div className="detail-row">
          <span>Status:</span>
          <span className="status-processing">{orderPlaced?.status}</span>
        </div>
        <div className="detail-row">
          <span>Total Amount:</span>
          <strong>₹{orderPlaced?.total?.toFixed(2)}</strong>
        </div>
        <div className="detail-row">
          <span>Delivery Address:</span>
          <span>{orderPlaced?.shippingAddress?.address}</span>
        </div>
        <div className="detail-row">
          <span>Payment Method:</span>
          <span>{orderPlaced?.paymentMethod}</span>
        </div>
      </div>

      <div className="success-actions">
        <button onClick={() => navigate('/orders')} className="btn-track">
          Track Order
        </button>
        <button onClick={() => navigate('/products')} className="btn-shop">
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>Review your items and checkout</p>
      </div>

      {checkoutStep === 'cart' && renderCartView()}
      {checkoutStep === 'address' && renderAddressView()}
      {checkoutStep === 'payment' && renderPaymentView()}
      {checkoutStep === 'success' && renderSuccessView()}
    </div>
  );
}

export default Cart;
