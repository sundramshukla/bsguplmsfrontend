import React from "react";
import "../CSS/style.css";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>

      <div className="hero-content container">
        <p className="tagline">Unlock Your Career</p>

        <h1>
          Master Your Future with <br />
          <span className="highlight-text">Expert-Led</span> Courses
        </h1>

        <p className="hero-description">
          Join 10,000+ students in mastering industry-standard skills with our
          curated learning paths and professional growth programs.
        </p>

        <div className="hero-buttons">
          <button className="btn-primary large">Enroll Now</button>
          <button className="btn-secondary large">View Catalog</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;