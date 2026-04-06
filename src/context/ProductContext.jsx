import React, { createContext, useContext, useState, useEffect } from 'react';
import { FaMobileAlt, FaHeadphones, FaLaptop, FaBox, FaShoppingBag, FaClock, FaCheckCircle, FaUserShield, FaUserTie, FaUser, FaBriefcase, FaTruck } from 'react-icons/fa';

const ProductContext = createContext();

// Role constants for RBAC
export const ROLES = {
  ADMIN: 'admin',
  PROFESSIONAL: 'professional',
  USER: 'user',
  BUSINESS_AGENT: 'business_agent',
  DELIVERY_AGENT: 'delivery_agent'
};

// Role display names and icons
export const ROLE_INFO = {
  [ROLES.ADMIN]: { label: 'Admin', icon: FaUserShield, color: '#e74c3c' },
  [ROLES.PROFESSIONAL]: { label: 'Professional', icon: FaUserTie, color: '#3498db' },
  [ROLES.USER]: { label: 'User', icon: FaUser, color: '#2ecc71' },
  [ROLES.BUSINESS_AGENT]: { label: 'Business Agent', icon: FaBriefcase, color: '#9b59b6' },
  [ROLES.DELIVERY_AGENT]: { label: 'Delivery Agent', icon: FaTruck, color: '#f39c12' }
};

// Page access permissions
export const PAGE_PERMISSIONS = {
  home: [ROLES.ADMIN, ROLES.PROFESSIONAL, ROLES.USER, ROLES.BUSINESS_AGENT, ROLES.DELIVERY_AGENT],
  about: [ROLES.ADMIN, ROLES.PROFESSIONAL, ROLES.USER, ROLES.BUSINESS_AGENT, ROLES.DELIVERY_AGENT],
  products: [ROLES.ADMIN, ROLES.PROFESSIONAL, ROLES.USER, ROLES.BUSINESS_AGENT, ROLES.DELIVERY_AGENT],
  blog: [ROLES.ADMIN, ROLES.PROFESSIONAL, ROLES.USER, ROLES.BUSINESS_AGENT, ROLES.DELIVERY_AGENT],
  contact: [ROLES.ADMIN, ROLES.PROFESSIONAL, ROLES.USER, ROLES.BUSINESS_AGENT, ROLES.DELIVERY_AGENT],
  cart: [ROLES.ADMIN, ROLES.PROFESSIONAL, ROLES.USER, ROLES.BUSINESS_AGENT, ROLES.DELIVERY_AGENT],
  dashboard: [ROLES.ADMIN, ROLES.PROFESSIONAL, ROLES.USER, ROLES.BUSINESS_AGENT, ROLES.DELIVERY_AGENT],
  orders: [ROLES.ADMIN, ROLES.PROFESSIONAL, ROLES.USER, ROLES.BUSINESS_AGENT, ROLES.DELIVERY_AGENT],
  admin: [ROLES.ADMIN],
  professional: [ROLES.ADMIN, ROLES.PROFESSIONAL],
  businessDashboard: [ROLES.ADMIN, ROLES.BUSINESS_AGENT],
  deliveryDashboard: [ROLES.ADMIN, ROLES.DELIVERY_AGENT]
};

// Icon mapping for product icons
export const iconMap = {
  FaMobileAlt: FaMobileAlt,
  FaHeadphones: FaHeadphones,
  FaLaptop: FaLaptop,
  FaBox: FaBox,
  FaShoppingBag: FaShoppingBag,
};

export const getProductIcon = (iconName) => {
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent /> : <FaBox />;
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};

// Check if user has permission for an action
export const hasPermission = (user, requiredRole) => {
  if (!user) return false;
  
  const roleHierarchy = {
    [ROLES.ADMIN]: 3,
    [ROLES.WORKER]: 2,
    [ROLES.USER]: 1
  };
  
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
};

// Check if user is admin
export const isAdmin = (user) => user?.role === ROLES.ADMIN;

// Check if user is professional
export const isProfessional = (user) => user?.role === ROLES.PROFESSIONAL;

// Check if user is regular user
export const isUser = (user) => user?.role === ROLES.USER;

// Check if user is business agent
export const isBusinessAgent = (user) => user?.role === ROLES.BUSINESS_AGENT;

// Check if user is delivery agent
export const isDeliveryAgent = (user) => user?.role === ROLES.DELIVERY_AGENT;

// Check if user is approved (for business/delivery agents)
export const isApproved = (user) => user?.isApproved === true || user?.role === ROLES.ADMIN || user?.role === ROLES.PROFESSIONAL || user?.role === ROLES.USER;

// Check if user has access to a specific page
export const hasPageAccess = (user, page) => {
  if (!user) return false;
  
  // Admin always has access to all pages
  if (user.role === ROLES.ADMIN) return true;
  
  // Check user-specific page access (assigned by admin)
  if (user.pageAccess && user.pageAccess.length > 0) {
    return user.pageAccess.includes(page);
  }
  
  // Fall back to role-based permissions
  const allowedRoles = PAGE_PERMISSIONS[page];
  if (!allowedRoles) return false;
  return allowedRoles.includes(user.role);
};

export const ProductProvider = ({ children }) => {
  // Products state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from MongoDB backend on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          // Convert MongoDB _id to id for frontend compatibility
          const productsWithId = data.map(product => ({
            ...product,
            id: product._id
          }));
          setProducts(productsWithId);
          localStorage.setItem('sanjucart_products', JSON.stringify(productsWithId));
        }
      } catch (error) {
        console.error('Failed to fetch products from backend:', error);
        // Fallback to localStorage if backend is not available
        const savedProducts = localStorage.getItem('sanjucart_products');
        if (savedProducts) {
          setProducts(JSON.parse(savedProducts));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // User state (stored in localStorage for persistence)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('sanjucart_currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Fetch cart, wishlist, and orders when user logs in
  useEffect(() => {
    if (!user) {
      return;
    }
    
    const fetchUserData = async () => {
      // Use _id if available, otherwise use email as fallback identifier
      const userId = user._id || user.email;
      
      try {
        // Fetch cart - try by _id first, fallback not needed since cart requires login
        if (user._id) {
          const cartRes = await fetch(`/api/cart/${user._id}`);
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            if (cartData.items) {
              const items = cartData.items.map(item => ({ ...item, id: item.productId }));
              setCart(items);
              localStorage.setItem('sanjucart_cart', JSON.stringify(items));
            }
          }
          
          // Fetch wishlist
          const wishlistRes = await fetch(`/api/wishlist/${user._id}`);
          if (wishlistRes.ok) {
            const wishlistData = await wishlistRes.json();
            if (wishlistData.items) {
              const items = wishlistData.items.map(item => ({ ...item, id: item.productId }));
              setWishlist(items);
              localStorage.setItem('sanjucart_wishlist', JSON.stringify(items));
            }
          }
          
          // Fetch orders - for admin get ALL orders, for regular users get their orders
          if (user.role === 'admin') {
            // Admin gets all orders
            const allOrdersRes = await fetch('/api/orders');
            if (allOrdersRes.ok) {
              const ordersData = await allOrdersRes.json();
              const ordersWithId = ordersData.map(order => ({ ...order, id: order._id }));
              setOrders(ordersWithId);
              localStorage.setItem('sanjucart_orders', JSON.stringify(ordersWithId));
            }
          } else {
            // Regular users get their orders
            const ordersRes = await fetch(`/api/orders/user/${user._id}`);
            if (ordersRes.ok) {
              const ordersData = await ordersRes.json();
              const ordersWithId = ordersData.map(order => ({ ...order, id: order._id }));
              setOrders(ordersWithId);
              localStorage.setItem('sanjucart_orders', JSON.stringify(ordersWithId));
            }
          }
        } else if (user.email) {
          // Fallback: fetch orders by email if _id not available (only for non-admin)
          if (user.role !== 'admin') {
            const ordersRes = await fetch(`/api/orders/user/email/${user.email}`);
            if (ordersRes.ok) {
              const ordersData = await ordersRes.json();
              const ordersWithId = ordersData.map(order => ({ ...order, id: order._id }));
              setOrders(ordersWithId);
              localStorage.setItem('sanjucart_orders', JSON.stringify(ordersWithId));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [user?._id, user?.email]);

  // Cart state (stored in localStorage for persistence)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('sanjucart_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [cartCount, setCartCount] = useState(0);

  // Wishlist state (stored in localStorage for persistence)
  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem('sanjucart_wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });
  const [wishlistCount, setWishlistCount] = useState(0);

  // Global toast state
  const [toast, setToast] = useState(null);

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Save cart to localStorage and update count whenever it changes
  useEffect(() => {
    localStorage.setItem('sanjucart_cart', JSON.stringify(cart));
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  }, [cart]);

  // Save wishlist to localStorage and update count whenever it changes
  useEffect(() => {
    localStorage.setItem('sanjucart_wishlist', JSON.stringify(wishlist));
    setWishlistCount(wishlist.length);
  }, [wishlist]);

  // Save user to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem('sanjucart_currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('sanjucart_currentUser');
    }
  }, [user]);

  // Users database - fetch from backend
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Fetch users from MongoDB backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/auth/users');
        if (response.ok) {
          const data = await response.json();
          // Convert MongoDB _id to id for frontend compatibility
          const usersWithId = data.users.map(user => ({
            ...user,
            id: user._id
          }));
          setUsers(usersWithId);
        }
      } catch (error) {
        console.error('Failed to fetch users from backend:', error);
        // Fallback to localStorage if backend fails
        const savedUsers = localStorage.getItem('sanjucart_users');
        if (savedUsers) {
          setUsers(JSON.parse(savedUsers));
        }
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Order state (stored in localStorage for persistence)
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('sanjucart_orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sanjucart_orders', JSON.stringify(orders));
  }, [orders]);

  // Orders database - fetch from backend (for admin)
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Fetch all orders from MongoDB backend for admin
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          // Convert MongoDB _id to id for frontend compatibility
          const ordersWithId = data.map(order => ({
            ...order,
            id: order._id
          }));
          setOrders(ordersWithId);
        }
      } catch (error) {
        console.error('Failed to fetch orders from backend:', error);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Worker tasks state (fetch from MongoDB)
  const [workerTasks, setWorkerTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Fetch worker tasks from MongoDB backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (response.ok) {
          const data = await response.json();
          // Convert MongoDB _id to id for frontend compatibility
          const tasksWithId = data.map(task => ({
            ...task,
            id: task._id
          }));
          setWorkerTasks(tasksWithId);
        }
      } catch (error) {
        console.error('Failed to fetch tasks from backend:', error);
        // Fallback to localStorage
        const savedTasks = localStorage.getItem('sanjucart_tasks');
        if (savedTasks) {
          setWorkerTasks(JSON.parse(savedTasks));
        }
      } finally {
        setTasksLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Save worker tasks to localStorage as backup
  useEffect(() => {
    if (!tasksLoading) {
      localStorage.setItem('sanjucart_tasks', JSON.stringify(workerTasks));
    }
  }, [workerTasks, tasksLoading]);

  // Update cart count when cart changes
  useEffect(() => {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  }, [cart]);

  // Calculate final price with discount, profit, and GST
  const calculateFinalPrice = (price, discount, profit, gst = 18) => {
    const discountedPrice = price - (price * discount / 100);
    const withProfit = discountedPrice + profit;
    const withGst = withProfit + (withProfit * gst / 100);
    return Math.round(withGst * 100) / 100;
  };

  // Add product (admin function) - calls MongoDB backend
  const addProduct = async (product) => {
    try {
      const token = localStorage.getItem('sanjucart_token');
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });
      
      if (response.ok) {
        const newProduct = await response.json();
        // Add MongoDB _id as id for frontend compatibility
        const productWithId = { ...newProduct, id: newProduct._id };
        setProducts([productWithId, ...products]);
        localStorage.setItem('sanjucart_products', JSON.stringify([productWithId, ...products]));
        return { success: true, product: productWithId };
      }
      const errorData = await response.json();
      return { success: false, message: errorData.message || 'Failed to add product' };
    } catch (error) {
      console.error('Error adding product:', error);
      return { success: false, message: error.message };
    }
  };

  // Update product (admin function) - calls MongoDB backend
  const updateProduct = async (productId, updatedProduct) => {
    try {
      const token = localStorage.getItem('sanjucart_token');
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProduct)
      });
      
      if (response.ok) {
        const updated = await response.json();
        const productWithId = { ...updated, id: updated._id };
        const updatedProducts = products.map(product => 
          product.id === productId ? { ...product, ...productWithId, updatedAt: new Date().toISOString() } : product
        );
        setProducts(updatedProducts);
        localStorage.setItem('sanjucart_products', JSON.stringify(updatedProducts));
        return { success: true, product: productWithId };
      }
      const errorData = await response.json();
      return { success: false, message: errorData.message || 'Failed to update product' };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, message: error.message };
    }
  };

  // Delete product (admin function) - calls MongoDB backend
  const deleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('sanjucart_token');
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const updatedProducts = products.filter(product => product.id !== productId);
        setProducts(updatedProducts);
        localStorage.setItem('sanjucart_products', JSON.stringify(updatedProducts));
        return { success: true };
      }
      const errorData = await response.json();
      return { success: false, message: errorData.message || 'Failed to delete product' };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, message: error.message };
    }
  };

  // Add to cart - stores in MongoDB
  const addToCart = async (product, quantity = 1) => {
    if (!user || !user._id) {
      // Fallback to localStorage if no user
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === product.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevCart, { ...product, quantity }];
      });
      return;
    }
    
    try {
      const productId = product.id || product._id;
      const response = await fetch(`/api/cart/${user._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          name: product.name,
          brand: product.brand,
          price: product.price,
          discount: product.discount || 0,
          profit: product.profit || 0,
          gst: product.gst || 18,
          quantity,
          image: product.image
        })
      });
      
      if (response.ok) {
        const cartData = await response.json();
        // Convert MongoDB items to frontend format
        const items = cartData.items.map(item => ({
          ...item,
          id: item.productId
        }));
        setCart(items);
        localStorage.setItem('sanjucart_cart', JSON.stringify(items));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback to localStorage
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === product.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevCart, { ...product, quantity }];
      });
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    if (!user || !user._id) {
      // Fallback to localStorage
      setCart(cart.filter((item) => item.id !== productId));
      return;
    }
    
    try {
      const response = await fetch(`/api/cart/${user._id}/${productId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const cartData = await response.json();
        const items = cartData.items.map(item => ({
          ...item,
          id: item.productId
        }));
        setCart(items);
        localStorage.setItem('sanjucart_cart', JSON.stringify(items));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Fallback
      setCart(cart.filter((item) => item.id !== productId));
    }
  };

  // Update cart item quantity
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    if (!user || !user._id) {
      // Fallback to localStorage
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
      return;
    }
    
    try {
      const response = await fetch(`/api/cart/${user._id}/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      
      if (response.ok) {
        const cartData = await response.json();
        const items = cartData.items.map(item => ({
          ...item,
          id: item.productId
        }));
        setCart(items);
        localStorage.setItem('sanjucart_cart', JSON.stringify(items));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Fallback
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  // Calculate cart total
  const calculateCartTotal = () => {
    return cart.reduce((total, item) => {
      const finalPrice = calculateFinalPrice(
        item.price,
        item.discount,
        item.profit,
        item.gst
      );
      return total + finalPrice * item.quantity;
    }, 0);
  };

  // Clear cart
  const clearCart = async () => {
    if (!user || !user._id) {
      // Fallback to localStorage
      setCart([]);
      return;
    }
    
    try {
      await fetch(`/api/cart/${user._id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
    setCart([]);
    localStorage.removeItem('sanjucart_cart');
  };

  // Add to wishlist - stores in MongoDB
  const addToWishlist = async (product) => {
    if (!user || !user._id) {
      // Fallback to localStorage
      setWishlist((prevWishlist) => {
        const existingItem = prevWishlist.find((item) => item.id === product.id);
        if (existingItem) {
          return prevWishlist;
        }
        return [...prevWishlist, { ...product }];
      });
      return;
    }
    
    try {
      const productId = product.id || product._id;
      const response = await fetch(`/api/wishlist/${user._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          name: product.name,
          brand: product.brand,
          price: product.price,
          discount: product.discount || 0,
          image: product.image
        })
      });
      
      if (response.ok) {
        const wishlistData = await response.json();
        const items = wishlistData.items.map(item => ({
          ...item,
          id: item.productId
        }));
        setWishlist(items);
        localStorage.setItem('sanjucart_wishlist', JSON.stringify(items));
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Fallback to localStorage
      setWishlist((prevWishlist) => {
        const existingItem = prevWishlist.find((item) => item.id === product.id);
        if (existingItem) {
          return prevWishlist;
        }
        return [...prevWishlist, { ...product }];
      });
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    if (!user || !user._id) {
      // Fallback to localStorage
      setWishlist(wishlist.filter((item) => item.id !== productId));
      return;
    }
    
    try {
      const response = await fetch(`/api/wishlist/${user._id}/${productId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const wishlistData = await response.json();
        const items = wishlistData.items.map(item => ({
          ...item,
          id: item.productId
        }));
        setWishlist(items);
        localStorage.setItem('sanjucart_wishlist', JSON.stringify(items));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Fallback
      setWishlist(wishlist.filter((item) => item.id !== productId));
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Clear wishlist
  const clearWishlist = async () => {
    if (!user || !user._id) {
      // Fallback to localStorage
      setWishlist([]);
      return;
    }
    
    try {
      await fetch(`/api/wishlist/${user._id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
    setWishlist([]);
    localStorage.removeItem('sanjucart_wishlist');
  };

  // API Base URL - uses proxy in development
const API_BASE_URL = '/api/auth';

// API helper function
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Always try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { message: 'Invalid JSON response' };
    }
    
    // Check if response is ok or has error status with JSON body
    if (!response.ok) {
      // Return the error response with data so caller can handle it
      return { response, data };
    }
    
    return { response, data };
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Login user - calls backend API only (no fallback)
  const loginUser = async (email, password) => {
    try {
      const { response, data } = await apiCall('/login', 'POST', { email, password });
      
      // Check if we got valid data
      if (!data || !data.success) {
        return { success: false, message: data?.message || 'Invalid email or password' };
      }
      
      if (data.success) {
        // Store token
        if (data.token) {
          localStorage.setItem('sanjucart_token', data.token);
        }
        
        // Set user state
        setUser({ 
          _id: data.user._id,
          id: data.user._id,
          email: data.user.email, 
          name: data.user.name, 
          phoneNumber: data.user.phoneNumber,
          address: data.user.address,
          role: data.user.role,
          isApproved: data.user.isApproved,
          pageAccess: data.user.pageAccess || []
        });
        
        return { success: true, user: data.user };
      }
    } catch (error) {
      console.error('Login Error:', error);
      return { success: false, message: 'Unable to connect to server. Please check if the backend is running.' };
    }
  };

  // Register new user - calls backend API only (no fallback)
  const registerUser = async (userData, role = ROLES.USER) => {
    try {
      // Build registration data
      const registrationData = { 
        email: userData.email, 
        password: userData.password,
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        role: role
      };
      
      // Add business agent specific fields
      if (role === ROLES.BUSINESS_AGENT) {
        registrationData.businessName = userData.businessName;
        registrationData.businessType = userData.businessType;
      }
      
      // Add delivery agent specific fields
      if (role === ROLES.DELIVERY_AGENT) {
        registrationData.vehicleType = userData.vehicleType;
        registrationData.licenseNumber = userData.licenseNumber;
      }
      
      const { response, data } = await apiCall('/register', 'POST', registrationData);
      
      // Check if we got valid data
      if (!data || !data.success) {
        return { success: false, message: data?.message || 'Registration failed' };
      }
      
      if (data.success) {
        // Store token
        if (data.token) {
          localStorage.setItem('sanjucart_token', data.token);
        }
        
        // Set user state
        setUser({ 
          _id: data.user._id,
          id: data.user._id,
          email: data.user.email, 
          name: data.user.name, 
          phoneNumber: data.user.phoneNumber,
          address: data.user.address,
          role: data.user.role,
          isApproved: data.user.isApproved,
          pageAccess: data.user.pageAccess || []
        });
        
        return { success: true, message: data.message || 'Registration submitted for approval', user: data.user };
      }
    } catch (error) {
      console.error('Registration Error:', error);
      return { success: false, message: 'Unable to connect to server. Please check if the backend is running.' };
    }
  };

  // Get default page access based on role
  const getDefaultPageAccess = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return ['home', 'about', 'products', 'blog', 'contact', 'cart', 'dashboard', 'orders', 'admin', 'professional'];
      case ROLES.PROFESSIONAL:
        return ['home', 'about', 'products', 'blog', 'contact', 'cart', 'dashboard', 'orders', 'professional'];
      case ROLES.USER:
      default:
        return ['home', 'about', 'products', 'blog', 'contact', 'cart', 'dashboard', 'orders'];
    }
  };

  // Create professional account (admin function)
  const createProfessional = async (workerData) => {
    try {
      // Check if user already exists in backend
      const checkResponse = await fetch(`/api/users/email/${workerData.email}`);
      if (checkResponse.ok) {
        return { success: false, message: 'User with this email already exists' };
      }
      
      // Register professional via auth API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: workerData.name,
          email: workerData.email,
          phoneNumber: workerData.phoneNumber || '',
          password: workerData.password,
          role: ROLES.PROFESSIONAL
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Failed to create professional account' };
      }

      // Refresh users list from backend
      const usersResponse = await fetch('/api/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const usersWithId = usersData.map(user => ({
          ...user,
          id: user._id
        }));
        setUsers(usersWithId);
      }

      return { success: true, message: 'Professional account created successfully' };
    } catch (error) {
      console.error('Error creating professional:', error);
      return { success: false, message: 'Error creating professional account' };
    }
  };

  // Assign task to worker (admin function) - calls MongoDB backend
  const assignTaskToWorker = async (task) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          assignedBy: user?.email || 'admin'
        })
      });
      
      if (response.ok) {
        const newTask = await response.json();
        const taskWithId = { ...newTask, id: newTask._id };
        setWorkerTasks([taskWithId, ...workerTasks]);
        return taskWithId;
      }
      return { success: false, message: 'Failed to assign task' };
    } catch (error) {
      console.error('Error assigning task:', error);
      // Fallback to localStorage
      const newTask = {
        ...task,
        id: Date.now(),
        assignedAt: new Date().toISOString(),
        status: 'pending',
      };
      setWorkerTasks([...workerTasks, newTask]);
      return newTask;
    }
  };

  // Update worker task (admin/worker function) - calls MongoDB backend
  const updateWorkerTask = async (taskId, taskData) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      
      if (response.ok) {
        const updated = await response.json();
        const taskWithId = { ...updated, id: updated._id };
        setWorkerTasks(workerTasks.map(task =>
          task.id === taskId ? { ...task, ...taskWithId, updatedAt: new Date().toISOString() } : task
        ));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Fallback to localStorage
      setWorkerTasks(workerTasks.map(task =>
        task.id === taskId ? { ...task, ...taskData, updatedAt: new Date().toISOString() } : task
      ));
    }
  };

  // Get tasks assigned to a specific worker
  const getWorkerTasks = (workerEmail) => {
    return workerTasks.filter(task => task.assignedTo === workerEmail);
  };

  // Logout user
  const logoutUser = () => {
    setUser(null);
  };

  // Order status options
  const orderStatuses = ['Order Confirmed', 'Processing', 'Out for Delivery', 'Delivered in 2 Days', 'Cancelled'];

  // Create order with proper GST calculation - stores in MongoDB
  const createOrder = async (orderDetails) => {
    // Calculate detailed totals with GST breakdown
    const itemsWithCalculations = cart.map(item => {
      const discountedPrice = item.price - (item.price * item.discount / 100);
      const withProfit = discountedPrice + item.profit;
      const gstAmount = withProfit * item.gst / 100;
      const finalPrice = withProfit + gstAmount;
      return {
        ...item,
        basePrice: item.price,
        discountedPrice: discountedPrice.toFixed(2),
        profit: item.profit,
        gstRate: item.gst,
        gstAmount: gstAmount.toFixed(2),
        finalPrice: finalPrice.toFixed(2),
        totalPrice: (finalPrice * item.quantity).toFixed(2)
      };
    });

    // Calculate order totals
    const subtotal = itemsWithCalculations.reduce((sum, item) => 
      sum + (parseFloat(item.basePrice) * item.quantity), 0);
    const totalDiscount = itemsWithCalculations.reduce((sum, item) => 
      sum + ((parseFloat(item.basePrice) - parseFloat(item.discountedPrice)) * item.quantity), 0);
    const totalProfit = itemsWithCalculations.reduce((sum, item) => 
      sum + (item.profit * item.quantity), 0);
    const totalGst = itemsWithCalculations.reduce((sum, item) => 
      sum + (parseFloat(item.gstAmount) * item.quantity), 0);
    const orderTotal = parseFloat(subtotal - totalDiscount + totalProfit + totalGst).toFixed(2);

    const newOrder = {
      id: Date.now(),
      ...orderDetails,
      items: itemsWithCalculations,
      subtotal: subtotal.toFixed(2),
      discount: totalDiscount.toFixed(2),
      profit: totalProfit.toFixed(2),
      gst: totalGst.toFixed(2),
      total: parseFloat(orderTotal),
      status: 'Order Confirmed',
      date: new Date().toISOString(),
    };

    // Try to save to MongoDB
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?._id,
          userEmail: orderDetails.email || user?.email,
          userName: orderDetails.name || user?.name,
          items: itemsWithCalculations,
          totalAmount: parseFloat(orderTotal),
          shippingAddress: orderDetails.address,
          paymentMethod: orderDetails.paymentMethod
        })
      });
      
      if (response.ok) {
        const savedOrder = await response.json();
        const orderWithId = { ...newOrder, _id: savedOrder._id, id: savedOrder._id };
        setOrders([orderWithId, ...orders]);
        localStorage.setItem('sanjucart_orders', JSON.stringify([orderWithId, ...orders]));
      } else {
        // Fallback to localStorage
        setOrders([newOrder, ...orders]);
        localStorage.setItem('sanjucart_orders', JSON.stringify([newOrder, ...orders]));
      }
    } catch (error) {
      console.error('Error creating order:', error);
      // Fallback to localStorage
      setOrders([newOrder, ...orders]);
      localStorage.setItem('sanjucart_orders', JSON.stringify([newOrder, ...orders]));
    }
    
    clearCart();
    return newOrder;
  };

  // Update order status (admin/worker function) - MongoDB
  const updateOrderStatus = async (orderId, newStatus) => {
    const orderIdStr = orderId.toString();
    
    try {
      const response = await fetch(`/api/orders/${orderIdStr}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        const updatedOrder = await response.json();
        const orderWithId = { ...updatedOrder, id: updatedOrder._id };
        const updatedOrders = orders.map(order => 
          order.id === orderId || order._id === orderId ? { ...order, ...orderWithId, statusUpdatedAt: new Date().toISOString() } : order
        );
        setOrders(updatedOrders);
        localStorage.setItem('sanjucart_orders', JSON.stringify(updatedOrders));
        return;
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
    
    // Fallback to localStorage
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus, statusUpdatedAt: new Date().toISOString() } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('sanjucart_orders', JSON.stringify(updatedOrders));
  };

  // Delete order (admin function) - MongoDB
  const deleteOrder = async (orderId) => {
    const orderIdStr = orderId.toString();
    
    try {
      await fetch(`/api/orders/${orderIdStr}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting order:', error);
    }
    
    const updatedOrders = orders.filter(order => order.id !== orderId && order._id !== orderId);
    setOrders(updatedOrders);
    localStorage.setItem('sanjucart_orders', JSON.stringify(updatedOrders));
  };

  // Update user (admin function) - calls backend API
  const updateUser = async (email, userData) => {
    try {
      const response = await fetch(`/api/users/email/${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(user => 
          user.email === email ? { ...user, ...updatedUser } : user
        ));
        return { success: true };
      }
      return { success: false, message: 'Failed to update user' };
    } catch (error) {
      console.error('Error updating user:', error);
      // Fallback to local state update
      setUsers(users.map(user => 
        user.email === email ? { ...user, ...userData } : user
      ));
      return { success: true };
    }
  };

  // Delete user (admin function) - calls backend API
  const deleteUser = async (email) => {
    try {
      const response = await fetch(`/api/users/email/${email}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setUsers(users.filter(user => user.email !== email));
        return { success: true };
      }
      return { success: false, message: 'Failed to delete user' };
    } catch (error) {
      console.error('Error deleting user:', error);
      // Fallback to local state update
      setUsers(users.filter(user => user.email !== email));
      return { success: true };
    }
  };

  // Get user by email
  const getUserByEmail = (email) => {
    return users.find(user => user.email === email);
  };

  // Get all users (admin function)
  const getAllUsers = () => {
    return users.map(u => ({ ...u, password: undefined }));
  };

  // Approve or reject user (admin function)
  const approveUser = async (userId, isApproved) => {
    try {
      const response = await fetch(`/api/auth/approve-user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update local state
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isApproved: isApproved } : user
        ));
        return { success: true, message: data.message };
      }
      return { success: false, message: 'Failed to approve user' };
    } catch (error) {
      console.error('Error approving user:', error);
      return { success: false, message: 'Error approving user' };
    }
  };

  // Update user page access (admin function) - calls backend API
  const updateUserPageAccess = async (email, pageAccess) => {
    try {
      const response = await fetch(`/api/users/email/${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageAccess })
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => 
          u.email === email ? { ...u, ...updatedUser } : u
        ));
        return { success: true, message: 'Page access updated successfully' };
      }
      return { success: false, message: 'Failed to update page access' };
    } catch (error) {
      console.error('Error updating page access:', error);
      // Fallback to local state update
      setUsers(users.map(u => 
        u.email === email ? { ...u, pageAccess: pageAccess } : u
      ));
      return { success: true, message: 'Page access updated successfully' };
    }
  };

  // Get user orders by email
  const getUserOrders = (userEmail) => {
    return orders.filter(order => order.userEmail === userEmail);
  };

  // Get all orders (for admin)
  const getAllOrders = () => {
    return orders;
  };

  // Get products by brand
  const getProductsByBrand = (brand) => {
    return products.filter((product) => product.brand.toLowerCase() === brand.toLowerCase());
  };

  // Search products by brand name
  const searchProductsByBrand = (searchTerm) => {
    if (!searchTerm) return products;
    return products.filter((product) => 
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get unique brands
  const getBrands = () => {
    return [...new Set(products.map((product) => product.brand))];
  };

  // Get cart items count
  const getCartCount = () => cartCount;

  // Get product by ID
  const getProductById = (productId) => {
    return products.find(p => p.id === parseInt(productId));
  };

  const value = {
    products,
    loading,
    cart,
    cartCount,
    wishlist,
    wishlistCount,
    user,
    orders,
    users,
    workerTasks,
    orderStatuses,
    ROLES,
    ROLE_INFO,
    addProduct,
    updateProduct,
    deleteProduct,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateCartTotal,
    calculateFinalPrice,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    loginUser,
    logoutUser,
    registerUser,
    createProfessional,
    assignTaskToWorker,
    updateWorkerTask,
    getWorkerTasks,
    showToast,
    toast,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    updateUser,
    deleteUser,
    getUserByEmail,
    getAllUsers,
    approveUser,
    getUserOrders,
    getAllOrders,
    getProductsByBrand,
    searchProductsByBrand,
    getBrands,
    getCartCount,
    getProductById,
    hasPermission,
    isAdmin,
    isProfessional,
    isUser,
    hasPageAccess,
    PAGE_PERMISSIONS,
    updateUserPageAccess,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;
