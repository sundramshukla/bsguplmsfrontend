import React, { useState } from 'react';

function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for reaching out! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="bg-white pt-8 pb-16 md:pb-24">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#7c3aed]">
            Get In Touch
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            Contact Us
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Have questions or want to learn more about the Scout Guide BSGUP platform? Send us a message and we'll be happy to help!
          </p>
          <div className="h-1 w-20 bg-[#7c3aed] mx-auto rounded-full mt-6" />
        </div>

        <div className="bg-slate-50 p-8 md:p-10 rounded-2xl shadow-lg border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed] transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed] transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Your Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed] transition-colors resize-none"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3 bg-[#7c3aed] hover:bg-[#6b21e3] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
