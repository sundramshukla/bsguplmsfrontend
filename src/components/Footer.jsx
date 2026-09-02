import React, { useEffect, useState } from "react";
import "../CSS/style.css";
import logo from "../assets/logo.png";

/* ---------------- Icons ---------------- */

const ArrowUpIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 19V5" />
    <path d="m5 12 7-7 7 7" />
  </svg>
);

const ArrowRightIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const MailIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const PhoneIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 5.18 2 2 0 0 1 5.06 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 4.27 4.27l1.27-1.23a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MapPinIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const ShieldIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const BookIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </svg>
);

const ExternalLinkIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14 3h7v7" />
    <path d="M10 14 21 3" />
    <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
  </svg>
);

const CloseIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

/* ---------------- Footer ---------------- */

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  const handleNavClick = (hash) => {
    if (hash) {
      window.location.hash = hash;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* Close modal with ESC + prevent background scroll */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveModal(null);
      }
    };

    if (activeModal) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModal]);

  const quickLinks = [
    { label: "Home", hash: "" },
    { label: "All Courses", hash: "#courses" },
    { label: "About Us", hash: "#about" },
    { label: "Testimonials", hash: "#testimonials" },
    { label: "Contact Us", hash: "#contact" },
  ];

  return (
    <>
      <footer
        id="contact"
        className="relative overflow-hidden bg-slate-950 text-slate-300"
      >
        {/* Decorative background */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ───────────── CTA ───────────── */}
          <div className="border-b border-white/10 py-10 sm:py-12">
            <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                  <BookIcon size={14} />
                  Learn • Grow • Lead
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Start your learning journey with BSGUP LMS
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                  Explore courses, training programs and learning
                  opportunities designed for Bharat Scouts & Guides.
                </p>
              </div>

              <a
                href="#courses"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("#courses");
                }}
                className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Explore Courses
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRightIcon />
                </span>
              </a>
            </div>
          </div>

          {/* ───────────── Main Footer ───────────── */}
          <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-14">
            {/* Brand */}
            <div className="lg:col-span-4">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("");
                }}
                className="inline-flex rounded-xl bg-white p-2 shadow-lg shadow-black/10 transition-transform duration-300 hover:-translate-y-0.5"
                aria-label="BSGUP LMS Home"
              >
                <img
                  src={logo}
                  alt="BSGUP LMS"
                  className="h-11 w-auto object-contain"
                />
              </a>

              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
                Elevate your learning journey with official online training,
                courses, certifications and educational services from Bharat
                Scouts & Guides Uttar Pradesh.
              </p>

              {/* Trust badge */}
              <div className="mt-6 flex max-w-sm items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <ShieldIcon />
                </div>

                <div>
                  <p className="text-xs font-semibold text-white">
                    Secure Learning Platform
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Your learning experience matters to us.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
                Explore
              </h3>

              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.hash || "#"}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link.hash);
                      }}
                      className="group inline-flex items-center gap-2 text-sm text-slate-400 transition-colors duration-200 hover:text-purple-400"
                    >
                      <span className="h-px w-0 bg-purple-400 transition-all duration-200 group-hover:w-3" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-2">
              <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
                Legal
              </h3>

              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => setActiveModal("terms")}
                    className="group inline-flex items-center gap-2 text-left text-sm text-slate-400 transition-colors duration-200 hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <span className="h-px w-0 bg-purple-400 transition-all duration-200 group-hover:w-3" />
                    Terms & Conditions
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => setActiveModal("privacy")}
                    className="group inline-flex items-center gap-2 text-left text-sm text-slate-400 transition-colors duration-200 hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <span className="h-px w-0 bg-purple-400 transition-all duration-200 group-hover:w-3" />
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-4">
              <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
                Contact Us
              </h3>

              <div className="space-y-4">
                {/* Address */}
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                    <MapPinIcon />
                  </div>

                  <div className="text-sm leading-6">
                    <p className="font-semibold text-slate-200">
                      State Headquarters
                    </p>
                    <p className="text-slate-400">
                      Bharat Scouts and Guides, Uttar Pradesh
                    </p>
                    <p className="text-slate-400">
                      Gole Market, Mahanagar, Lucknow - 226006
                    </p>
                  </div>
                </div>

                {/* Email */}
                <a
                  href="mailto:bsguplms@gmail.com"
                  className="group flex items-center gap-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 transition-colors group-hover:bg-purple-500/20">
                    <MailIcon />
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      Email
                    </p>
                    <p className="text-sm text-slate-300 transition-colors group-hover:text-purple-400">
                      bsguplms@gmail.com
                    </p>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href="tel:05224323838"
                  className="group flex items-center gap-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 transition-colors group-hover:bg-purple-500/20">
                    <PhoneIcon />
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      Phone
                    </p>
                    <p className="text-sm text-slate-300 transition-colors group-hover:text-purple-400">
                      0522 - 4323838
                    </p>
                  </div>
                </a>

                {/* Website */}
                <a
                  href="https://www.bsgup.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-purple-400"
                >
                  Official Website
                  <ExternalLinkIcon />
                </a>
              </div>
            </div>
          </div>

          {/* ───────────── Bottom ───────────── */}
          <div className="flex flex-col gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              © {new Date().getFullYear()} BSGUP LMS. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <span className="hidden text-xs text-slate-600 sm:block">
                Bharat Scouts & Guides Uttar Pradesh
              </span>

              <button
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                aria-label="Back to top"
                title="Back to top"
              >
                <ArrowUpIcon />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════
          LEGAL MODAL
      ═══════════════════════════════════════ */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
          onMouseDown={() => setActiveModal(null)}
          role="presentation"
        >
          <div
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <ShieldIcon size={16} />
                  </div>

                  <h2
                    id="legal-modal-title"
                    className="text-lg font-bold text-slate-900 sm:text-xl"
                  >
                    {activeModal === "terms"
                      ? "Terms & Conditions"
                      : "Privacy Policy"}
                  </h2>
                </div>

                <p className="text-xs text-slate-500">
                  BSGUP LMS • Effective Date: 06 July 2026
                </p>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                aria-label="Close modal"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto px-5 py-6 text-sm leading-7 text-slate-700 sm:px-7">
              {activeModal === "terms" ? (
                <TermsContent />
              ) : (
                <PrivacyContent />
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3 sm:px-6">
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
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

/* ---------------- Terms ---------------- */

const TermsContent = () => (
  <div className="space-y-6">
    <div className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm text-purple-900">
      Welcome to BSGUP LMS (Bharat Scouts & Guides Uttar Pradesh Learning
      Management System). By accessing or using BSGUP LMS, you agree to comply
      with and be bound by these Terms & Conditions.
    </div>

    <LegalSection title="1. About BSGUP LMS">
      BSGUP LMS is the official Learning Management System of U.P. Bharat
      Scouts & Guides for online registration, training, courses, camps,
      examinations, certificates, and related educational services.
    </LegalSection>

    <LegalSection title="2. User Registration">
      <ul>
        <li>Users must provide accurate and complete information.</li>
        <li>
          Users are responsible for maintaining the confidentiality of their
          login credentials.
        </li>
        <li>
          False or misleading information may result in account suspension or
          cancellation.
        </li>
      </ul>
    </LegalSection>

    <LegalSection title="3. Courses & Camp Registration">
      <ul>
        <li>Admission is subject to availability and eligibility criteria.</li>
        <li>
          Registration is confirmed only after successful payment where
          applicable.
        </li>
        <li>
          BSGUP reserves the right to cancel or postpone programs due to
          administrative or unavoidable reasons.
        </li>
      </ul>
    </LegalSection>

    <LegalSection title="4. Payments">
      <ul>
        <li>
          Payments are processed securely through authorized payment gateways.
        </li>
        <li>
          BSGUP LMS does not store debit card, credit card, UPI PIN, or banking
          credentials.
        </li>
        <li>Users must ensure payment details are accurate.</li>
      </ul>
    </LegalSection>

    <LegalSection title="5. Refund & Cancellation">
      <ul>
        <li>
          Fees once paid are generally non-refundable unless specifically
          approved by U.P. Bharat Scouts & Guides.
        </li>
        <li>
          If a program is cancelled by BSGUP, eligible participants may receive
          a refund or adjustment as decided by the organization.
        </li>
        <li>
          Approved refunds will generally be processed to the original payment
          method.
        </li>
      </ul>
    </LegalSection>

    <LegalSection title="6. Certificates">
      <ul>
        <li>
          Certificates are issued only after successful completion of the
          prescribed course or training.
        </li>
        <li>
          Fraudulent attempts to obtain certificates may result in cancellation
          and legal action.
        </li>
      </ul>
    </LegalSection>

    <LegalSection title="7. User Responsibilities">
      <p className="mb-2 font-medium text-slate-900">Users agree not to:</p>
      <ul>
        <li>Share login credentials with others.</li>
        <li>Upload false, misleading, or illegal information.</li>
        <li>Attempt to hack, modify, or disrupt the website.</li>
        <li>Use the LMS for unlawful activities.</li>
      </ul>
    </LegalSection>

    <LegalSection title="8. Intellectual Property">
      All study materials, videos, documents, logos, certificates, designs,
      and website content are the intellectual property of U.P. Bharat Scouts
      & Guides. Unauthorized copying, distribution, or reproduction is
      prohibited.
    </LegalSection>

    <LegalSection title="9. Privacy">
      Your personal information is collected and used in accordance with the
      BSGUP LMS Privacy Policy.
    </LegalSection>

    <LegalSection title="10. Availability of Services">
      BSGUP LMS strives to provide uninterrupted services. However, maintenance,
      technical issues, or circumstances beyond our control may temporarily
      affect website availability.
    </LegalSection>

    <LegalSection title="11. Limitation of Liability">
      BSGUP LMS shall not be liable for indirect, incidental, or consequential
      damages arising from use of the website or services.
    </LegalSection>

    <LegalSection title="12. Changes to Terms">
      BSGUP reserves the right to modify these Terms & Conditions at any time.
      Updated Terms become effective upon publication on the website.
    </LegalSection>

    <LegalSection title="13. Governing Law">
      These Terms & Conditions shall be governed by the laws of India. Any
      dispute shall be subject to the jurisdiction of the competent courts in
      Prayagraj, Uttar Pradesh.
    </LegalSection>

    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
      <h3 className="mb-2 font-bold text-slate-900">14. Contact Information</h3>
      <p className="font-semibold text-slate-800">BSGUP LMS</p>
      <p>U.P. Bharat Scouts & Guides</p>
      <p>State Headquarters, Uttar Pradesh, India</p>
      <p className="mt-1">
        <span className="font-medium">Email:</span> bsguplms@gmail.com
      </p>
    </div>
  </div>
);

/* ---------------- Privacy ---------------- */

const PrivacyContent = () => (
  <div className="space-y-6">
    <div className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm text-purple-900">
      BSGUP LMS respects your privacy and is committed to protecting your
      personal information.
    </div>

    <LegalSection title="1. Information We Collect">
      <ul>
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
    </LegalSection>

    <LegalSection title="2. How We Use Your Information">
      <p className="mb-2 font-medium text-slate-900">
        We use your information to:
      </p>

      <ul>
        <li>Register users for courses and camps.</li>
        <li>Process online payments.</li>
        <li>Generate certificates.</li>
        <li>Communicate important updates.</li>
        <li>Improve LMS services.</li>
      </ul>
    </LegalSection>

    <LegalSection title="3. Payment Information">
      All online payments are securely processed through authorized payment
      gateways such as Razorpay. BSGUP LMS does not store debit card, credit
      card, UPI PIN, CVV, or banking credentials.
    </LegalSection>

    <LegalSection title="4. Data Security">
      We use industry-standard security measures to protect your information.
    </LegalSection>

    <LegalSection title="5. Information Sharing">
      We do not sell or rent your personal information. Information may be
      shared only when required by law or government authorities.
    </LegalSection>

    <LegalSection title="6. Cookies">
      BSGUP LMS may use cookies to improve website functionality and user
      experience.
    </LegalSection>

    <LegalSection title="7. Changes">
      We reserve the right to update this Privacy Policy at any time.
    </LegalSection>

    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
      <h3 className="mb-2 font-bold text-slate-900">8. Contact</h3>
      <p>
        <span className="font-medium">Email:</span> bsguplms@gmail.com
      </p>
    </div>
  </div>
);

/* ---------------- Legal Section ---------------- */

const LegalSection = ({ title, children }) => (
  <section>
    <h3 className="mb-2 text-base font-bold text-slate-900">{title}</h3>

    {typeof children === "string" ? (
      <p>{children}</p>
    ) : (
      children
    )}
  </section>
);

export default Footer;
