import React from "react";
import "../CSS/style.css";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>

      <div className="hero-content container">
        <p className="tagline">Unlock Your Leadership Journey</p>

        <h1>
          Build Character and Skills with <br />
          <span className="highlight-text">Scout & Guide</span> Training
        </h1>

        <div className="hero-description text-lg leading-relaxed flex flex-col gap-3">
          <p>
            Join thousands of young learners and volunteers in developing leadership, discipline, and life skills through our BSGUP Scout & Guide training programs. Our platform helps Scouts and Guides grow through structured activities, practical learning, and community service.
          </p>
          <p>
            Become part of a movement that builds confidence, teamwork, and responsibility while preparing you to serve society and lead with integrity.
          </p>
        </div>

        <div className="hero-buttons">
          <button className="btn-primary large" onClick={() => window.location.hash = '#courses'}>Explore Courses</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
