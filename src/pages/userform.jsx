import React, { useState } from "react";
import { Link } from "react-router-dom";

const UserForm = () => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "http://localhost:5000/api/users/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      setMessage(data.message);

      setFormData({
        name: "",
        email: "",
        phone: "",
      });

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="user-form-page">
      <div className="user-form-container">
        <h2>User Form</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="phone"
              placeholder="Enter Phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">
            Submit
          </button>

          {message && (
            <p className="user-form-message">
              {message}
            </p>
          )}
        </form>
        
        <p className="login-redirect">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default UserForm;
