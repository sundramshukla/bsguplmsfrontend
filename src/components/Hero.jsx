import React, { useState, useEffect } from "react";
import "../CSS/style.css";
import defaultHeroImage from "../assets/Images/Scout_heropage.jpeg";

const Hero = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Load slider images on mount
  useEffect(() => {
    const loadSlides = () => {
      const cached = localStorage.getItem("homepage_slider_images");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            setSlides(parsed);
            return;
          }
        } catch (err) {
          console.error("Failed to parse slider images", err);
        }
      }
      // Fallback if none uploaded
      setSlides([{ id: "default", url: defaultHeroImage }]);
    };

    loadSlides();

    // Listen for storage or custom events if the slider changes
    window.addEventListener("sliderImagesChanged", loadSlides);
    return () => {
      window.removeEventListener("sliderImagesChanged", loadSlides);
    };
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 3000); // change slide every 3 seconds

    return () => clearInterval(timer);
  }, [slides]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const selectSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="hero">
      {/* Background Slides */}
      <div className="hero-slider">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slide ${index === currentSlide ? "active" : ""}`}
            style={{ backgroundImage: `url("${slide.url}")` }}
          />
        ))}
      </div>

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

      {/* Slider Controls (only display if we have more than 1 slide) */}
      {slides.length > 1 && (
        <>
          <button onClick={handlePrev} className="hero-arrow prev" aria-label="Previous Slide">
            <span className="material-symbols-outlined text-2xl">chevron_left</span>
          </button>
          <button onClick={handleNext} className="hero-arrow next" aria-label="Next Slide">
            <span className="material-symbols-outlined text-2xl">chevron_right</span>
          </button>

          <div className="hero-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => selectSlide(index)}
                className={`hero-dot ${index === currentSlide ? "active" : ""}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default Hero;

