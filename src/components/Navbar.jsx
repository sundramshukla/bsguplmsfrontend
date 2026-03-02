import React from "react";
import "../CSS/style.css";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="container nav-container">
        <div className="logo">
          <span className="logo-icon">📘</span>
          LMS<span className="highlight">PRO</span>
        </div>

        <nav className="nav-links">
          <a href="#">Courses</a>
          <a href="#">About Us</a>
          <a href="#">Testimonials</a>
          <a href="#">Contact</a>
        </nav>

        <div className="nav-actions">
          <a href="#" className="login">Login</a>
          <button className="btn-primary">Sign Up</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;