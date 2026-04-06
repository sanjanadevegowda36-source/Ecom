import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart, FaSearch, FaStar, FaCheckCircle } from 'react-icons/fa';
import { useProductContext } from '../context/ProductContext';
import './ProductDetail.css';

/**
 * ProductDetail - Page to display full product details
 * Shows product information but excludes profit from display
 */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, addToCart, searchProductsByBrand, calculateFinalPrice } = useProductContext();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const productId = parseInt(id);
    const foundProduct = getProductById(productId);
    setProduct(foundProduct);
    
    // Get related products (same brand)
    if (foundProduct) {
      const related = searchProductsByBrand(foundProduct.brand)
        .filter(p => p.id !== foundProduct.id)
        .slice(0, 4);
      setRelatedProducts(related);
    }
  }, [id, getProductById, searchProductsByBrand]);

  // Handle search
  useEffect(() => {
    if (searchTerm) {
      const results = searchProductsByBrand(searchTerm);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, searchProductsByBrand]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      alert(`${product.name} added to cart!`);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSearch(true);
  };

  const handleSearchResultClick = (productId) => {
    navigate(`/product/${productId}`);
    setSearchTerm('');
    setShowSearch(false);
  };

  if (!product) {
    return (
      <div className="product-detail-container">
        <div className="product-not-found">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/products')}>
            <FaArrowLeft /> Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Calculate final price (excludes profit from display)
  const finalPrice = calculateFinalPrice(product.price, product.discount, product.profit, product.gst);
  const discountedPrice = product.price - (product.price * product.discount / 100);

  return (
    <div className="product-detail-container">
      {/* Search Bar */}
      <div className="product-search-bar">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search products by brand..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setShowSearch(true)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>
        {showSearch && searchResults.length > 0 && (
          <div className="search-results-dropdown">
            {searchResults.map(p => (
              <div 
                key={p.id} 
                className="search-result-item"
                onClick={() => handleSearchResultClick(p.id)}
              >
                <span className="result-brand">{p.brand}</span>
                <span className="result-name">{p.name}</span>
                <span className="result-price">₹{calculateFinalPrice(p.price, p.discount, p.profit, p.gst).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="back-button" onClick={() => navigate('/products')}>
        <FaArrowLeft /> Back to Products
      </button>

      <div className="product-detail-content">
        {/* Product Image */}
        <div className="product-image-section">
          <div className="product-image-container">
            {product.image ? (
              <img src={product.image} alt={product.name} className="product-image" />
            ) : (
              <div className="product-image-placeholder">
                <FaShoppingCart />
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <div className="product-brand-badge">{product.brand}</div>
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-rating">
            <FaStar className="star-icon" />
            <FaStar className="star-icon" />
            <FaStar className="star-icon" />
            <FaStar className="star-icon" />
            <FaStar className="star-icon" />
            <span>(5.0)</span>
          </div>

          <p className="product-description">
            {product.detailedDescription ? (
              showFullDescription ? (
                <div className="full-description">
                  {product.detailedDescription.split('\\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              ) : (
                <span>
                  {product.description || product.name}
                  {product.detailedDescription && (
                    <button 
                      className="show-more-btn"
                      onClick={() => setShowFullDescription(true)}
                    >
                      Show more details...
                    </button>
                  )}
                </span>
              )
            ) : (
              product.description || `${product.name} - A premium product from ${product.brand}.`
            )}
          </p>

          <div className="product-pricing">
            <div className="price-row">
              <span className="original-price">₹{product.price.toFixed(2)}</span>
              <span className="discount-badge">-{product.discount}%</span>
            </div>
            <div className="discounted-price">
              <span className="current-price">₹{finalPrice.toFixed(2)}</span>
              <span className="gst-note">Inclusive of GST</span>
            </div>
          </div>

          <div className="product-features">
            <div className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Free Delivery</span>
            </div>
            <div className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Easy Returns</span>
            </div>
            <div className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Secure Payment</span>
            </div>
          </div>

          <div className="quantity-selector">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <div className="product-actions">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              <FaShoppingCart /> Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h2>Related Products</h2>
          <div className="related-products-grid">
            {relatedProducts.map(p => (
              <div 
                key={p.id} 
                className="related-product-card"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <div className="related-product-image">
                  {p.image ? (
                    <img src={p.image} alt={p.name} />
                  ) : (
                    <FaShoppingCart />
                  )}
                </div>
                <div className="related-product-info">
                  <span className="related-brand">{p.brand}</span>
                  <span className="related-name">{p.name}</span>
                  <span className="related-price">
                    ₹{calculateFinalPrice(p.price, p.discount, p.profit, p.gst).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
