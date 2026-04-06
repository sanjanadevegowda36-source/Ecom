import React from 'react';
import { FaAward, FaUsers, FaHeart, FaStar } from 'react-icons/fa';

function About() {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About Us</h1>
        <p>Discover our story and mission</p>
      </div>

      <section className="about-hero">
        <div className="about-hero-content">
          <h2>Welcome to SanjuCart</h2>
          <p>
            We are dedicated to providing the best online shopping experience with quality products
            at competitive prices. Our mission is to make shopping easy, affordable, and enjoyable for everyone.
          </p>
          <p>
            Founded with a vision to revolutionize online shopping, SanjuCart has been
            serving customers with excellence since our inception. We believe in quality,
            integrity, and customer satisfaction.
          </p>
        </div>
        <div className="about-hero-image">
          <div className="about-image-placeholder">🛒</div>
        </div>
      </section>

      <section className="about-stats">
        <div className="stat-item">
          <FaAward className="stat-icon" />
          <h3>10+</h3>
          <p>Years Experience</p>
        </div>
        <div className="stat-item">
          <FaUsers className="stat-icon" />
          <h3>50K+</h3>
          <p>Happy Customers</p>
        </div>
        <div className="stat-item">
          <FaHeart className="stat-icon" />
          <h3>1000+</h3>
          <p>Products</p>
        </div>
        <div className="stat-item">
          <FaStar className="stat-icon" />
          <h3>4.9</h3>
          <p>Rating</p>
        </div>
      </section>

      <section className="about-values">
        <h2>Our Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <h3>Quality First</h3>
            <p>We never compromise on the quality of our products. Every item is carefully selected.</p>
          </div>
          <div className="value-card">
            <h3>Customer Focus</h3>
            <p>Our customers are at the heart of everything we do. Your satisfaction is our priority.</p>
          </div>
          <div className="value-card">
            <h3>Integrity</h3>
            <p>We believe in transparent and honest business practices. Trust is earned.</p>
          </div>
          <div className="value-card">
            <h3>Innovation</h3>
            <p>We constantly innovate to provide you with the best shopping experience.</p>
          </div>
        </div>
      </section>

      <section className="about-team">
        <h2>Why Choose Us</h2>
        <div className="team-grid">
          <div className="team-card">
            <div className="team-icon">🚚</div>
            <h3>Fast Delivery</h3>
            <p>Quick and reliable shipping to your doorstep</p>
          </div>
          <div className="team-card">
            <div className="team-icon">🔒</div>
            <h3>Secure Payment</h3>
            <p>Your payment information is safe with us</p>
          </div>
          <div className="team-card">
            <div className="team-icon">↩️</div>
            <h3>Easy Returns</h3>
            <p>Hassle-free return policy within 30 days</p>
          </div>
          <div className="team-card">
            <div className="team-icon">💬</div>
            <h3>24/7 Support</h3>
            <p>Round-the-clock customer support</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
