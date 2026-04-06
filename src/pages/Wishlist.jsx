import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useProductContext } from '../context/ProductContext';
import './Wishlist.css';

function Wishlist() {
  const { wishlist, removeFromWishlist, addToCart } = useProductContext();

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    alert(`${product.name} added to cart!`);
  };

  const handleRemove = (productId) => {
    removeFromWishlist(productId);
  };

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="empty-wishlist">
          <FaHeart className="empty-icon" />
          <h2>Your Wishlist is Empty</h2>
          <p>Add items to your wishlist to see them here</p>
          <Link to="/products" className="btn-shop">
            <FaArrowLeft /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1><FaHeart /> My Wishlist</h1>
        <p>{wishlist.length} items in your wishlist</p>
      </div>

      <div className="wishlist-items">
        {wishlist.map((product) => (
          <div key={product.id} className="wishlist-item">
            <div className="item-image">
              {product.image ? (
                <img src={product.image} alt={product.name} />
              ) : (
                <div className="item-icon">📦</div>
              )}
            </div>
            <div className="item-details">
              <h3>{product.name}</h3>
              <p className="item-brand">{product.brand}</p>
              <p className="item-price">₹{product.price}</p>
            </div>
            <div className="item-actions">
              <button 
                className="btn-add-cart"
                onClick={() => handleAddToCart(product)}
              >
                <FaShoppingCart /> Add to Cart
              </button>
              <button 
                className="btn-remove"
                onClick={() => handleRemove(product.id)}
              >
                <FaTrash /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <Link to="/products" className="btn-continue">
        <FaArrowLeft /> Continue Shopping
      </Link>
    </div>
  );
}

export default Wishlist;
