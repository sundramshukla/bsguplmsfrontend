import React from "react";
import "../CSS/style.css";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-about">
          <div className="inline-block bg-white rounded-lg px-3 py-2 mb-3">
            <img src={logo} alt="BSGUP" className="h-9 w-auto" />
          </div>
          <p>
            Elevate your professional journey with world-class education
            designed to help you succeed.
          </p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <a href="#">All Courses</a>
          <a href="#">Career Services</a>
          <a href="#">Success Stories</a>
        </div>

        <div className="footer-links">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>

        <div className="footer-links">
          <h4>Contact Us</h4>
          <p>hello@lmspro.edu</p>
          <p>+1 (555) 123-4567</p>
          <p>123 Education Plaza</p>
        </div>
      </div>

      <div className="footer-bottom">
        © 2024 BSGUP Platforms. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
