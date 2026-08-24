import React, { useState } from "react";
import "../CSS/style.css";
import logo from "../assets/logo.png";

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null); // 'terms' | 'privacy' | null

  const handleNavClick = (hash) => {
    window.location.hash = hash;
    window.scrollTo(0, 0);
  };

  return (
    <>
      <footer id="contact" className="footer bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="footer-container">
            {/* Column 1: About / Logo */}
            <div className="footer-about space-y-4">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); handleNavClick(''); }}
                className="inline-block bg-white rounded-lg px-3 py-2 hover:opacity-95 transition-opacity"
              >
                <img src={logo} alt="BSGUP LMS" className="h-10 w-auto" />
              </a>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Elevate your learning journey with official online training, courses, and certifications from Bharat Scouts & Guides Uttar Pradesh.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="footer-links space-y-3">
              <h4 className="text-white text-base font-semibold border-b border-slate-800 pb-2 inline-block">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handleNavClick(''); }}
                    className="text-slate-300 hover:text-purple-400 hover:underline transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a 
                    href="#courses" 
                    onClick={(e) => { e.preventDefault(); handleNavClick('#courses'); }}
                    className="text-slate-300 hover:text-purple-400 hover:underline transition-colors"
                  >
                    All Courses
                  </a>
                </li>
                <li>
                  <a 
                    href="#about" 
                    onClick={(e) => { e.preventDefault(); handleNavClick('#about'); }}
                    className="text-slate-300 hover:text-purple-400 hover:underline transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a 
                    href="#testimonials" 
                    onClick={(e) => { e.preventDefault(); handleNavClick('#testimonials'); }}
                    className="text-slate-300 hover:text-purple-400 hover:underline transition-colors"
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a 
                    href="#contact" 
                    onClick={(e) => { e.preventDefault(); handleNavClick('#contact'); }}
                    className="text-slate-300 hover:text-purple-400 hover:underline transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Policies */}
            <div className="footer-links space-y-3">
              <h4 className="text-white text-base font-semibold border-b border-slate-800 pb-2 inline-block">
                Legal & Policies
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => setActiveModal('terms')}
                    className="text-slate-300 hover:text-purple-400 hover:underline transition-colors text-left font-medium focus:outline-none"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveModal('privacy')}
                    className="text-slate-300 hover:text-purple-400 hover:underline transition-colors text-left font-medium focus:outline-none"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact Us */}
            <div className="footer-links space-y-3">
              <h4 className="text-white text-base font-semibold border-b border-slate-800 pb-2 inline-block">
                Contact Us
              </h4>
              <div className="text-sm text-slate-300 space-y-2 leading-relaxed">
                <div>
                  <p className="font-semibold text-white">State Headquarters</p>
                  <p className="text-slate-400">Bharat Scouts and Guides, Uttar Pradesh</p>
                  <p className="text-slate-400">Gole Market, Mahanagar, Lucknow Pin - 226006</p>
                </div>
                <div className="pt-1 space-y-1.5">
                  <p className="flex items-center gap-2">
                    <span className="text-purple-400 font-medium">Email:</span>
                    <a href="mailto:bsguplms@gmail.com" className="hover:text-purple-400 underline">bsguplms@gmail.com</a>
                  </p>
                  <p className="flex items-center gap-2 text-slate-400 pl-11 text-xs">
                    <a href="mailto:upscoutsguides@yahoo.com" className="hover:text-purple-400 underline">upscoutsguides@yahoo.com</a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-purple-400 font-medium">Phone:</span>
                    <a href="tel:05224323838" className="hover:text-purple-400 underline">0522 - 4323838</a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-purple-400 font-medium">Website:</span>
                    <a href="https://www.bsgup.org" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 underline">www.bsgup.org</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} BSGUP LMS (Bharat Scouts & Guides Uttar Pradesh). All rights reserved.
          </div>
        </div>
      </footer>

      {/* Modal Popup with Backdrop Blur */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {activeModal === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  BSGUP LMS • Effective Date: 06 July 2026
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors text-lg font-bold"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-sm leading-relaxed">
              {activeModal === 'terms' ? (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-purple-900 text-xs">
                    Welcome to BSGUP LMS (Bharat Scouts & Guides Uttar Pradesh Learning Management System). By accessing or using <a href="https://bsguplms.in" target="_blank" rel="noopener noreferrer" className="underline font-semibold">https://bsguplms.in</a>, you agree to comply with and be bound by the following Terms & Conditions. If you do not agree with these Terms, please do not use this website.
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">1. About BSGUP LMS</h4>
                    <p>BSGUP LMS is the official Learning Management System of U.P. Bharat Scouts & Guides for online registration, training, courses, camps, examinations, certificates, and related educational services.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">2. User Registration</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Users must provide accurate and complete information during registration.</li>
                      <li>Users are responsible for maintaining the confidentiality of their login credentials.</li>
                      <li>Any false information may result in suspension or cancellation of the account.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">3. Courses & Camp Registration</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Admission is subject to seat availability and eligibility criteria.</li>
                      <li>Registration is confirmed only after successful payment.</li>
                      <li>BSGUP reserves the right to cancel or postpone any course, camp, or training program due to administrative or unavoidable reasons.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">4. Payments</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>All payments are processed securely through authorized payment gateways.</li>
                      <li>BSGUP LMS does not store debit card, credit card, UPI PIN, or banking credentials.</li>
                      <li>Users must ensure that payment details entered are accurate.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">5. Refund & Cancellation</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Fees once paid are generally non-refundable unless specifically approved by U.P. Bharat Scouts & Guides.</li>
                      <li>In case a training program or camp is cancelled by BSGUP, eligible participants may receive a refund or adjustment as decided by the organization.</li>
                      <li>Any refund, if approved, will be processed to the original payment method.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">6. Certificates</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Certificates will be issued only after successful completion of the prescribed course or training.</li>
                      <li>Any attempt to obtain certificates fraudulently may result in cancellation and legal action.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">7. User Responsibilities</h4>
                    <p className="mb-1 font-medium">Users agree not to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Share login credentials with others.</li>
                      <li>Upload false, misleading, or illegal information.</li>
                      <li>Attempt to hack, modify, or disrupt the website.</li>
                      <li>Use the LMS for any unlawful activity.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">8. Intellectual Property</h4>
                    <p>All study materials, videos, documents, logos, certificates, designs, and website content are the intellectual property of U.P. Bharat Scouts & Guides. Unauthorized copying, distribution, or reproduction is prohibited.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">9. Privacy</h4>
                    <p>Your personal information is collected and used in accordance with the BSGUP LMS Privacy Policy.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">10. Availability of Services</h4>
                    <p>BSGUP LMS strives to provide uninterrupted services. However, maintenance, technical issues, or circumstances beyond our control may temporarily affect website availability.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">11. Limitation of Liability</h4>
                    <p>BSGUP LMS shall not be liable for any indirect, incidental, or consequential damages arising from the use of the website or services.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">12. Changes to Terms</h4>
                    <p>BSGUP reserves the right to modify these Terms & Conditions at any time. Updated Terms will become effective immediately upon publication on the website.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">13. Governing Law</h4>
                    <p>These Terms & Conditions shall be governed by the laws of India. Any dispute shall be subject to the jurisdiction of the competent courts in Prayagraj, Uttar Pradesh.</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                    <h4 className="font-bold text-slate-900">14. Contact Information</h4>
                    <p className="font-semibold text-slate-800">BSGUP LMS</p>
                    <p>U.P. Bharat Scouts & Guides</p>
                    <p>State Headquarters, Uttar Pradesh, India</p>
                    <p><span className="font-medium">Email:</span> bsguplms@gmail.com</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-purple-900 text-xs">
                    BSGUP LMS (Bharat Scouts & Guides Uttar Pradesh Learning Management System) respects your privacy and is committed to protecting your personal information.
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">1. Information We Collect</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Name</li>
                      <li>Mobile Number</li>
                      <li>Email Address</li>
                      <li>Date of Birth</li>
                      <li>Gender</li>
                      <li>Address</li>
                      <li>District & State</li>
                      <li>Scout/Guide Registration Details</li>
                      <li>Payment Information (Transaction ID only)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">2. How We Use Your Information</h4>
                    <p className="mb-1 font-medium">We use your information to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Register users for courses and camps.</li>
                      <li>Process online payments.</li>
                      <li>Generate certificates.</li>
                      <li>Communicate important updates.</li>
                      <li>Improve our LMS services.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">3. Payment Information</h4>
                    <p>All online payments are securely processed through authorized payment gateways such as Razorpay. BSGUP LMS does not store debit card, credit card, UPI PIN, CVV, or banking credentials.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">4. Data Security</h4>
                    <p>We use industry-standard security measures to protect your information.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">5. Information Sharing</h4>
                    <p>We do not sell or rent your personal information. Information may be shared only when required by law or government authorities.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">6. Cookies</h4>
                    <p>BSGUP LMS may use cookies to improve website functionality and user experience.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">7. Changes</h4>
                    <p>We reserve the right to update this Privacy Policy at any time.</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                    <h4 className="font-bold text-slate-900">8. Contact</h4>
                    <p><span className="font-medium">Email:</span> bsguplms@gmail.com</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-[#7c3aed] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#6d28d9] transition-colors shadow-sm text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
