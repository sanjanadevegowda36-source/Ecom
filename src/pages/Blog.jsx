import React from 'react';
import { FaCalendarAlt, FaUser, FaComment, FaArrowRight } from 'react-icons/fa';

function Blog() {
  const blogPosts = [
    { 
      id: 1, 
      title: 'Getting Started with Online Shopping', 
      date: '2024-01-15',
      author: 'SanjuCart Team',
      comments: 12,
      image: '🛍️',
      excerpt: 'Learn the basics of online shopping and how to make the most of your experience.'
    },
    { 
      id: 2, 
      title: 'Tips for Finding the Best Deals', 
      date: '2024-01-10',
      author: 'SanjuCart Team',
      comments: 8,
      image: '💰',
      excerpt: 'Discover strategies to save money and find the best deals on your favorite products.'
    },
    { 
      id: 3, 
      title: 'Why Quality Matters in Products', 
      date: '2024-01-05',
      author: 'SanjuCart Team',
      comments: 15,
      image: '⭐',
      excerpt: 'Understanding the importance of quality when making purchasing decisions.'
    },
    { 
      id: 4, 
      title: 'Shopping Guide for Beginners', 
      date: '2023-12-28',
      author: 'SanjuCart Team',
      comments: 20,
      image: '📚',
      excerpt: 'A comprehensive guide for those new to online shopping.'
    },
  ];

  return (
    <div className="blog-page">
      <div className="page-header">
        <h1>Blog</h1>
        <p>Latest news, tips, and insights from SanjuCart</p>
      </div>

      <div className="blog-grid">
        {blogPosts.map((post) => (
          <article key={post.id} className="blog-card">
            <div className="blog-image">
              <span className="blog-emoji">{post.image}</span>
            </div>
            <div className="blog-content">
              <div className="blog-meta">
                <span><FaCalendarAlt /> {post.date}</span>
                <span><FaUser /> {post.author}</span>
                <span><FaComment /> {post.comments} comments</span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <a href="#" className="read-more">
                Read More <FaArrowRight />
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="blog-newsletter">
        <h3>Subscribe to Our Blog</h3>
        <p>Get the latest articles delivered to your inbox</p>
        <form className="blog-subscribe-form">
          <input type="email" placeholder="Enter your email" />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </div>
  );
}

export default Blog;
