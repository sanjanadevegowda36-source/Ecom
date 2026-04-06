import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import { FaBox, FaEdit, FaTrash, FaPlus, FaSearch, FaImage, FaTimes, FaArrowLeft } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminProductManagement = () => {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useProductContext();
  
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    detailedDescription: '',
    price: '',
    discount: '0',
    profit: '0',
    gst: '18',
    iconName: 'FaBox',
    image: ''
  });

  // Filter products
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Auto-generate descriptions if not provided
    let finalDescription = formData.description;
    let finalDetailedDescription = formData.detailedDescription;
    
    if (!finalDescription || finalDescription.trim() === '') {
      // Generate simple description
      finalDescription = `${formData.name} by ${formData.brand} - Premium quality product at ₹${formData.price}`;
    }
    
    if (!finalDetailedDescription || finalDetailedDescription.trim() === '') {
      // Generate detailed description
      finalDetailedDescription = generateDetailedDescription(formData);
    }
    
    const productData = {
      ...formData,
      description: finalDescription,
      detailedDescription: finalDetailedDescription,
      price: parseFloat(formData.price),
      discount: parseFloat(formData.discount),
      profit: parseFloat(formData.profit),
      gst: parseFloat(formData.gst)
    };

    if (editingProduct) {
      const result = await updateProduct(editingProduct._id, productData);
      if (result.success) {
        setToast({ message: 'Product updated successfully!', type: 'success' });
      } else {
        setToast({ message: result.message || 'Failed to update product', type: 'error' });
      }
    } else {
      const result = await addProduct(productData);
      if (result.success) {
        setToast({ message: 'Product added successfully!', type: 'success' });
      } else {
        setToast({ message: result.message || 'Failed to add product', type: 'error' });
      }
    }
    
    resetForm();
  };

  // Function to generate detailed description
  const generateDetailedDescription = (data) => {
    return `Product: ${data.name}\n\nBrand: ${data.brand}\n\nPrice: ₹${data.price}\nDiscount: ${data.discount}%\nGST: ${data.gst}%\n\n` +
      `About this product:\n` +
      `- High-quality ${data.name} from ${data.brand}\n` +
      `- Perfect for everyday use\n` +
      `- Durable and reliable construction\n` +
      `- Modern design with excellent finish\n` +
      `- Easy to use and maintain\n\n` +
      `Features:\n` +
      `- Brand: ${data.brand}\n` +
      `- Price: ₹${data.price} (${data.discount}% discount available)\n` +
      `- GST: ${data.gst}%\n` +
      `- Quality: Premium\n` +
      `- Warranty: Manufacturer warranty applicable\n\n` +
      `Order now and get it delivered to your doorstep!`;
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      description: product.description || '',
      detailedDescription: product.detailedDescription || '',
      price: product.price?.toString() || '',
      discount: product.discount?.toString() || '0',
      profit: product.profit?.toString() || '0',
      gst: product.gst?.toString() || '18',
      iconName: product.iconName || 'FaBox',
      image: product.image || ''
    });
    setImagePreview(product.image || null);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(productId);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      description: '',
      detailedDescription: '',
      price: '',
      discount: '0',
      profit: '0',
      gst: '18',
      iconName: 'FaBox',
      image: ''
    });
    setImagePreview(null);
  };

  // Handle image file selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear image
  const clearImage = () => {
    setFormData({ ...formData, image: '' });
  };

  return (
    <div className="product-management">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back to Dashboard
      </button>
      <div className="section-header">
        <h2>Product Management</h2>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Search products by name or brand..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  placeholder="Short description (optional - will be auto-generated if left empty)"
                />
              </div>

              <div className="form-group">
                <label>Detailed Description</label>
                <textarea
                  value={formData.detailedDescription}
                  onChange={(e) => setFormData({...formData, detailedDescription: e.target.value})}
                  rows="5"
                  placeholder="Full product details (optional - will be auto-generated if left empty)"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Profit (₹)</label>
                  <input
                    type="number"
                    value={formData.profit}
                    onChange={(e) => setFormData({...formData, profit: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>GST (%)</label>
                  <input
                    type="number"
                    value={formData.gst}
                    onChange={(e) => setFormData({...formData, gst: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Icon Name</label>
                <select
                  value={formData.iconName}
                  onChange={(e) => setFormData({...formData, iconName: e.target.value})}
                >
                  <option value="FaBox">Box</option>
                  <option value="FaLaptop">Laptop</option>
                  <option value="FaMobileAlt">Mobile</option>
                  <option value="FaHeadphones">Headphones</option>
                  <option value="FaShoppingBag">Shopping Bag</option>
                </select>
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <div className="image-upload-container">
                  <div className="image-upload-area">
                    {formData.image || imagePreview ? (
                      <div className="image-preview">
                        <img 
                          src={formData.image || imagePreview} 
                          alt="Product preview" 
                        />
                        <button 
                          type="button" 
                          className="remove-image"
                          onClick={clearImage}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <>
                        <FaImage className="upload-icon" />
                        <span>Click to upload image</span>
                        <span className="upload-hint">PNG, JPG, GIF (max 2MB)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="image-input"
                    />
                  </div>
                  <div className="image-url-option">
                    <span className="or-divider">OR</span>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({...formData, image: e.target.value});
                        setImagePreview(e.target.value);
                      }}
                      placeholder="Paste image URL"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update' : 'Add'} Product
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Discount</th>
              <th>GST</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product._id || product.id}>
                  <td>{(product._id || product.id)?.slice(-8)}</td>
                  <td>{product.name}</td>
                  <td>{product.brand}</td>
                  <td>₹{product.price?.toLocaleString()}</td>
                  <td>{product.discount}%</td>
                  <td>{product.gst}%</td>
                  <td>
                    <button 
                      className="btn-icon edit"
                      onClick={() => handleEdit(product)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-icon delete"
                      onClick={() => handleDelete(product._id || product.id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Statistics */}
      <div className="stats-cards">
        <div className="stat-card">
          <FaBox />
          <div className="stat-info">
            <h4>Total Products</h4>
            <p>{products.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductManagement;
