import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductContext, getProductIcon, iconMap, hasPageAccess } from '../context/ProductContext';
import { FaPlus, FaShoppingCart, FaTrash, FaEdit, FaSearch, FaBox, FaImage, FaTimes, FaCartPlus, FaUser, FaCog, FaHeart, FaRegHeart } from 'react-icons/fa';
import '../components/SearchStyles.css';

function Products() {
  const navigate = useNavigate();
  const { 
    products, 
    addProduct, 
    updateProduct,
    deleteProduct,
    addToCart, 
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    calculateFinalPrice,
    searchProductsByBrand,
    getBrands,
    user,
    isAdmin,
    showToast
  } = useProductContext();

  const [activeTab, setActiveTab] = useState('user');
  
  // Set default tab based on user role
  useEffect(() => {
    if (isAdmin(user)) {
      setActiveTab('admin');
    } else {
      setActiveTab('user');
    }
  }, [user]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // New filter states
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);

  // Admin form state
  const [formData, setFormData] = useState({
    brand: '',
    name: '',
    description: '',
    detailedDescription: '',
    price: '',
    discount: '0',
    profit: '0',
    gst: '18',
    iconName: 'FaBox',
    image: null,
    imageUrl: ''
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Selected product for user view
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [expandedProductId, setExpandedProductId] = useState(null);

  const brands = getBrands();

  // Search by brand name
  useEffect(() => {
    if (searchTerm) {
      const results = searchProductsByBrand(searchTerm);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm, searchProductsByBrand]);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = !selectedBrand || product.brand === selectedBrand;
    const finalPrice = calculateFinalPrice(product.price, product.discount, product.profit, product.gst);
    const matchesMinPrice = !priceRange.min || finalPrice >= parseFloat(priceRange.min);
    const matchesMaxPrice = !priceRange.max || finalPrice <= parseFloat(priceRange.max);
    return matchesSearch && matchesBrand && matchesMinPrice && matchesMaxPrice;
  }).sort((a, b) => {
    const priceA = calculateFinalPrice(a.price, a.discount, a.profit, a.gst);
    const priceB = calculateFinalPrice(b.price, b.discount, b.profit, b.gst);
    switch (sortBy) {
      case 'price-low': return priceA - priceB;
      case 'price-high': return priceB - priceA;
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      default: return 0;
    }
  });

  // Calculate final price
  const finalPrice = formData.price ? calculateFinalPrice(
    parseFloat(formData.price),
    parseFloat(formData.discount),
    parseFloat(formData.profit),
    parseFloat(formData.gst)
  ) : 0;

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setFormData({ ...formData, image: null, imageUrl: '' });
  };

  // Handle image URL
  const handleImageUrl = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, imageUrl: url, image: url || null });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.brand || !formData.name || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount),
        profit: parseFloat(formData.profit),
        gst: parseFloat(formData.gst)
      });
      alert('Product updated successfully!');
    } else {
      addProduct({
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount),
        profit: parseFloat(formData.profit),
        gst: parseFloat(formData.gst)
      });
      alert('Product added successfully!');
    }
    
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      brand: '',
      name: '',
      description: '',
      detailedDescription: '',
      price: '',
      discount: '0',
      profit: '0',
      gst: '18',
      iconName: 'FaBox',
      image: null,
      imageUrl: ''
    });
    setEditingProduct(null);
  };

  // Handle edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      brand: product.brand,
      name: product.name,
      description: product.description || '',
      detailedDescription: product.detailedDescription || '',
      price: product.price.toString(),
      discount: product.discount.toString(),
      profit: product.profit.toString(),
      gst: product.gst.toString(),
      iconName: product.iconName || 'FaBox',
      image: product.image || null,
      imageUrl: product.imageUrl || ''
    });
    setActiveTab('admin');
  };

  // Handle delete product
  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
      showToast('Product deleted successfully!', 'success');
    }
  };

  // Handle add to cart from quick button
  const handleQuickAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1);
    showToast(`${product.name} added to cart!`, 'success');
  };

  // Handle add to wishlist
  const handleAddToWishlist = (e, product) => {
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showToast(`${product.name} removed from wishlist!`, 'success');
    } else {
      addToWishlist(product);
      showToast(`${product.name} added to wishlist!`, 'success');
    }
  };

  // Handle search result click
  const handleSearchResultClick = (product) => {
    navigate(`/product/${product.id}`);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  // Render Admin Tab
  const renderAdminTab = () => (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Product Management</h2>
        <button 
          className="btn-add-product"
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) setEditingProduct(null);
          }}
        >
          <FaPlus /> {showForm ? 'Hide Form' : 'Add Product'}
        </button>
      </div>
      
      {(showForm || editingProduct) && (
        <>
        <div className="form-header">
          <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
        </div>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-row">
          <div className="form-group">
            <label>Brand *</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleFormChange}
              placeholder="Enter brand name"
              required
            />
          </div>
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Enter product name"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Product Description (Short)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            placeholder="Enter short product description"
            rows="2"
          ></textarea>
        </div>

        <div className="form-group">
          <label>Detailed Description (Full Details)</label>
          <textarea
            name="detailedDescription"
            value={formData.detailedDescription}
            onChange={handleFormChange}
            placeholder="Enter detailed product specifications, features, etc."
            rows="5"
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Base Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleFormChange}
              placeholder="Enter base price"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleFormChange}
              placeholder="0"
              min="0"
              max="100"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Profit (₹)</label>
            <input
              type="number"
              name="profit"
              value={formData.profit}
              onChange={handleFormChange}
              placeholder="0"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>GST (%)</label>
            <input
              type="number"
              name="gst"
              value={formData.gst}
              onChange={handleFormChange}
              placeholder="18"
              min="0"
              max="50"
            />
          </div>
        </div>

        <div className="price-summary">
          <h4>Price Summary</h4>
          <div className="price-row">
            <span>Base Price:</span>
            <span>₹{formData.price || 0}</span>
          </div>
          <div className="price-row">
            <span>Discount ({formData.discount}%):</span>
            <span>-₹{((formData.price || 0) * formData.discount / 100).toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span>After Discount:</span>
            <span>₹{((formData.price || 0) - (formData.price || 0) * formData.discount / 100).toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span>Profit:</span>
            <span>+₹{formData.profit || 0}</span>
          </div>
          <div className="price-row">
            <span>GST ({formData.gst}%):</span>
            <span>+₹{(((formData.price || 0) - (formData.price || 0) * formData.discount / 100 + parseFloat(formData.profit || 0)) * formData.gst / 100).toFixed(2)}</span>
          </div>
          <div className="price-row final-price">
            <span>Final Price:</span>
            <span>₹{finalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>Product Image</label>
          <div className="image-upload-container">
            {formData.image ? (
              <div className="image-preview">
                <img src={formData.image} alt="Product" />
                <button type="button" className="remove-image" onClick={removeImage}>
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div className="image-upload-box">
                <FaImage className="upload-icon" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="image-input"
                  id="product-image"
                />
                <label htmlFor="product-image" className="upload-label">
                  Click to upload image
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Image URL */}
        <div className="form-group">
          <label>Or Enter Image URL</label>
          <input
            type="url"
            value={formData.imageUrl || ''}
            onChange={handleImageUrl}
            placeholder="https://example.com/image.jpg"
            className="image-url-input"
          />
          {formData.imageUrl && (
            <div className="image-url-preview">
              <img src={formData.imageUrl} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Select Icon</label>
          <div className="icon-selector">
            {Object.keys(iconMap).map(iconKey => (
              <button
                key={iconKey}
                type="button"
                className={`icon-btn ${formData.iconName === iconKey ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, iconName: iconKey })}
                title={iconKey}
              >
                {getProductIcon(iconKey)}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-submit-product">
          <FaPlus /> {editingProduct ? 'Update Product' : 'Add Product'}
        </button>
      </form>
      </>
      )}

      {/* Existing Products List */}
      <div className="existing-products">
        <h3>Existing Products ({products.length})</h3>
        <div className="products-list-admin">
          {products.map(product => (
            <div key={product.id} className={`admin-product-card ${expandedProductId === product.id ? 'expanded' : ''}`}>
              <div className="admin-product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <FaBox />
                )}
              </div>
              <div className="admin-product-info">
                <span className="admin-brand">{product.brand}</span>
                <span className="admin-name">{product.name}</span>
                <div className="admin-price-breakdown">
                  <span className="admin-base-price">Base: ₹{product.price}</span>
                  <span className="admin-gst">GST ({product.gst}%): +₹{(((product.price - product.price * product.discount / 100 + product.profit) * product.gst / 100)).toFixed(2)}</span>
                  <span className="admin-profit">Profit: +₹{product.profit}</span>
                  {product.discount > 0 && <span className="admin-discount">Discount: -{product.discount}%</span>}
                  <span className="admin-final-price">Final: ₹{calculateFinalPrice(product.price, product.discount, product.profit, product.gst).toFixed(2)}</span>
                </div>
                {/* Short Description */}
                {product.description && (
                  <p className="admin-short-desc">{product.description}</p>
                )}
                {/* Detailed Description - shown when expanded */}
                {expandedProductId === product.id && product.detailedDescription && (
                  <div className="admin-detailed-desc">
                    <strong>Detailed Description:</strong>
                    <p>{product.detailedDescription}</p>
                  </div>
                )}
              </div>
              <div className="admin-product-actions">
                {product.detailedDescription && (
                  <button 
                    className="btn-details"
                    onClick={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
                  >
                    {expandedProductId === product.id ? 'Hide Details' : 'View Details'}
                  </button>
                )}
                <button className="btn-edit" onClick={() => handleEdit(product)}>
                  <FaEdit /> Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(product.id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render User Tab
  const renderUserTab = () => {
    if (selectedProduct) {
      return (
        <div className="product-detail-view">
          <button className="back-btn" onClick={() => setSelectedProduct(null)}>
            ← Back to Products
          </button>
          <div className="product-detail-card">
            <div className="product-detail-image">
              {selectedProduct.image ? (
                <img src={selectedProduct.image} alt={selectedProduct.name} />
              ) : (
                <span className="detail-emoji">{getProductIcon(selectedProduct.iconName)}</span>
              )}
            </div>
            <div className="product-detail-info">
              <span className="brand-badge">{selectedProduct.brand}</span>
              <h2>{selectedProduct.name}</h2>
              <p className="description">{selectedProduct.description}</p>
              
              {/* Detailed Description Toggle */}
              {selectedProduct.detailedDescription && (
                <div className="detailed-description-section">
                  <button 
                    className="toggle-details-btn"
                    onClick={() => setExpandedProductId(expandedProductId === selectedProduct.id ? null : selectedProduct.id)}
                  >
                    {expandedProductId === selectedProduct.id ? '▼ Hide Detailed Description' : '▶ View Detailed Description'}
                  </button>
                  {expandedProductId === selectedProduct.id && (
                    <div className="detailed-description-content">
                      <h4>Product Details & Specifications</h4>
                      <p>{selectedProduct.detailedDescription}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="price-info">
                <div className="price-row">
                  <span>Base Price:</span>
                  <span>₹{selectedProduct.price}</span>
                </div>
                <div className="price-row">
                  <span>Discount:</span>
                  <span className="discount">-{selectedProduct.discount}%</span>
                </div>
                <div className="price-row">
                  <span>GST ({selectedProduct.gst}%):</span>
                  <span>+₹{((selectedProduct.price - selectedProduct.price * selectedProduct.discount / 100 + selectedProduct.profit) * selectedProduct.gst / 100).toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span>Profit:</span>
                  <span>+₹{selectedProduct.profit}</span>
                </div>
                <div className="price-row final">
                  <span>Final Price:</span>
                  <span className="final-price">₹{calculateFinalPrice(selectedProduct.price, selectedProduct.discount, selectedProduct.profit, selectedProduct.gst).toFixed(2)}</span>
                </div>
              </div>

              <div className="quantity-section">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              <div className="total-section">
                <span>Total:</span>
                <span className="total-price">₹{(calculateFinalPrice(selectedProduct.price, selectedProduct.discount, selectedProduct.profit, selectedProduct.gst) * quantity).toFixed(2)}</span>
              </div>

              <button className="btn-add-to-cart-large" onClick={handleAddToCart}>
                <FaShoppingCart /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="user-products">
        {/* Search by Brand Name */}
        <div className="products-search-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by brand name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm && setShowSearchResults(true)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map(product => (
                <div 
                  key={product.id} 
                  className="search-result-item"
                  onClick={() => handleSearchResultClick(product)}
                >
                  <div className="result-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <FaBox />
                    )}
                  </div>
                  <div className="result-info">
                    <span className="result-brand">{product.brand}</span>
                    <span className="result-name">{product.name}</span>
                  </div>
                  <span className="result-price">
                    ₹{calculateFinalPrice(product.price, product.discount, product.profit, product.gst).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <select 
            value={selectedBrand} 
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="brand-filter"
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'More Filters'}
          </button>
          
          {showFilters && (
            <div className="filters-panel">
              <div className="price-range-filter">
                <label>Price Range:</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                />
              </div>
              
              <div className="sort-filter">
                <label>Sort By:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
              
              {(priceRange.min || priceRange.max || sortBy !== 'default') && (
                <button 
                  className="clear-filters"
                  onClick={() => {
                    setPriceRange({ min: '', max: '' });
                    setSortBy('default');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="products-count">
          {searchTerm ? `Found ${filteredProducts.length} products` : `Showing ${filteredProducts.length} products`}
        </div>

        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card" onClick={() => setSelectedProduct(product)}>
              <div className="product-image">
                {product.discount > 0 && (
                  <span className="discount-tag">{product.discount}% OFF</span>
                )}
                <button 
                  className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                  onClick={(e) => handleAddToWishlist(e, product)}
                >
                  {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
                </button>
                <div className="product-icon">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    getProductIcon(product.iconName)
                  )}
                </div>
              </div>
              <div className="product-info">
                <span className="product-category">{product.brand}</span>
                <h3>{product.name}</h3>
                <div className="product-price">
                  <span className="current-price">₹{calculateFinalPrice(product.price, product.discount, product.profit, product.gst).toFixed(2)}</span>
                  {product.discount > 0 && (
                    <span className="original-price">₹{product.price}</span>
                  )}
                </div>
                <button 
                  className="quick-add-btn"
                  onClick={(e) => handleQuickAddToCart(e, product)}
                >
                  <FaCartPlus /> Quick Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products</h1>
        <p>Browse products or add new ones (Admin only)</p>
      </div>

      <div className="tabs-container">
        {/* Show only Admin tab for admin users */}
        {isAdmin(user) && (
          <button 
            className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('admin'); resetForm(); }}
          >
            <FaCog /> Admin
          </button>
        )}
        {/* Show only User tab for non-admin users */}
        {!isAdmin(user) && (
          <button 
            className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            <FaUser /> User
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'admin' ? renderAdminTab() : renderUserTab()}
    </div>
  );
}

export default Products;
