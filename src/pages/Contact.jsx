import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaPaperPlane, FaUser } from 'react-icons/fa';
import { useProductContext } from '../context/ProductContext';

function Contact() {
  const { user } = useProductContext();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully! We will get back to you soon.');
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-page">
      <div className="page-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you!</p>
      </div>

      {/* User Info Banner */}
      {user && (
        <div className="user-contact-banner">
          <FaUser className="banner-icon" />
          <span>Welcome, <strong>{user.name || user.email.split('@')[0]}</strong>! Feel free to contact us.</span>
        </div>
      )}

      <div className="contact-container">
        <div className="contact-info-section">
          <h2>Get in Touch</h2>
          <p>Have questions? We're here to help. Reach out to us through any of the following ways.</p>
          
          <div className="contact-info-cards">
            <div className="contact-info-card">
              <FaMapMarkerAlt className="contact-icon" />
              <div>
                <h3>Address</h3>
                <p>123 Shopping Street, City, Country</p>
              </div>
            </div>
            
            <div className="contact-info-card">
              <FaPhone className="contact-icon" />
              <div>
                <h3>Phone</h3>
                <p>+1 234 567 890</p>
              </div>
            </div>
            
            <div className="contact-info-card">
              <FaEnvelope className="contact-icon" />
              <div>
                <h3>Email</h3>
                <p>contact@sanjucart.com</p>
              </div>
            </div>
            
            <div className="contact-info-card">
              <FaClock className="contact-icon" />
              <div>
                <h3>Working Hours</h3>
                <p>Mon - Sat: 9AM - 6PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-section">
          <h2>Send us a Message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={user?.name || "John Doe"}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={user?.email || "john@example.com"}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                rows="5"
                required
              ></textarea>
            </div>
            
            <button type="submit" className="btn-submit">
              <FaPaperPlane /> Send Message
            </button>
          </form>
        </div>
      </div>

      <div className="map-section">
        <div className="map-placeholder">
          <span>📍</span>
          <p>Map View</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
