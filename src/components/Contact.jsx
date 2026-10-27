import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowUpRight,
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { contactConfig } from '../data/contactConfig';
import { useMagnetic } from '../hooks/useMagnetic';
import { gsap, prefersReducedMotion } from '../utils/motion';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: '+91 (India)' },
  { code: '+1', country: 'US', label: '+1 (US / Canada)' },
  { code: '+44', country: 'UK', label: '+44 (UK)' },
  { code: '+971', country: 'AE', label: '+971 (UAE)' },
  { code: '+65', country: 'SG', label: '+65 (Singapore)' },
  { code: '+61', country: 'AU', label: '+61 (Australia)' },
  { code: '+49', country: 'DE', label: '+49 (Germany)' },
  { code: '+33', country: 'FR', label: '+33 (France)' },
  { code: '+other', country: 'GL', label: 'Other' }
];

export default function Contact() {
  const rootRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Banner headline reveal
      gsap.from('.contact-banner-head', {
        scrollTrigger: {
          trigger: '.contact-banner-head',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 35,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out'
      });

      // Animated arrow slide
      gsap.from('.contact-arrow-huge', {
        scrollTrigger: {
          trigger: '.contact-huge-title-row',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        x: -30,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out'
      });

      // Split layout: Channels & Form entrance
      gsap.from('.contact-info-card', {
        scrollTrigger: {
          trigger: '.contact-layout-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out'
      });

      gsap.from('.contact-form-container', {
        scrollTrigger: {
          trigger: '.contact-layout-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        y: 35,
        opacity: 0,
        duration: 0.75,
        ease: 'power2.out'
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const [formData, setFormData] = useState({
    businessName: '',
    countryCode: '+91',
    phone: '',
    email: '',
    _gotcha: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const magneticSubmitBtnRef = useMagnetic(0.2);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.businessName.trim()) {
      errs.businessName = 'Please enter your business name.';
    } else if (formData.businessName.trim().length < 2) {
      errs.businessName = 'Business name must be at least 2 characters.';
    }

    const cleanPhone = formData.phone.replace(/[\s\-()]/g, '');
    if (!cleanPhone) {
      errs.phone = 'Please enter your phone number.';
    } else if (!/^\+?[0-9]{7,15}$/.test(cleanPhone)) {
      errs.phone = 'Please enter a valid phone number (7–15 digits).';
    }

    const emailTrimmed = formData.email.trim();
    if (emailTrimmed) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        errs.email = 'Please enter a valid email address.';
      }
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const rawPhone = formData.phone.trim();
    const fullPhone =
      formData.countryCode === '+other' || rawPhone.startsWith('+')
        ? rawPhone
        : `${formData.countryCode} ${rawPhone}`;

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessName: formData.businessName.trim(),
          name: formData.businessName.trim(),
          phone: fullPhone,
          email: formData.email.trim() || undefined,
          source: 'contact-section',
          _gotcha: formData._gotcha
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit enquiry.');
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('[SUBMISSION_ERROR]', err);
      setSubmitError(
        'Unable to submit enquiry right now. Please try again or reach out directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" ref={rootRef} className="contact-dark-section" aria-label="Contact Charles Naveen">
      <div className="container">
        {/* Headline Banner */}
        <div className="contact-banner-head">
          <div className="contact-meta-eyebrow">
            <span className="contact-live-dot" aria-hidden="true"></span>
            <span>AVAILABLE FOR CLIENT BUILDS &amp; AGENCY PARTNERSHIPS</span>
          </div>

          <div className="contact-huge-title-row">
            <h2 className="contact-monument-heading">
              WRITE ME <span className="contact-arrow-huge">→</span>
            </h2>
          </div>
          <p className="contact-subheading">
            LET'S DISCUSS YOUR PROJECT REQUIREMENTS.
          </p>
        </div>

        {/* Contact Layout Grid */}
        <div className="contact-layout-grid">
          {/* Left Column: Direct Communication Channels */}
          <div className="contact-info-col">
            <div className="contact-info-card">
              <span className="contact-card-label">DIRECT COMMUNICATION CHANNELS</span>

              <p className="contact-editorial-copy">
                Have a project in mind, need an indicative quote, or want to discuss an ongoing agency partnership?
                Reach out directly via email or WhatsApp. I respond to all genuine inquiries within 24 business hours.
              </p>

              <div className="contact-channel-item">
                <span className="channel-tag-label">DIRECT EMAIL</span>
                <a
                  href={`mailto:${contactConfig.emailPlaceholder}`}
                  className="channel-value-link"
                >
                  <Mail size={16} aria-hidden="true" />
                  <span>{contactConfig.emailPlaceholder}</span>
                </a>
              </div>

              <div className="contact-channel-item">
                <span className="channel-tag-label">WHATSAPP DIRECT</span>
                <a
                  href={`https://wa.me/${contactConfig.whatsappPlaceholder}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="channel-value-link"
                >
                  <MessageSquare size={16} aria-hidden="true" />
                  <span>+{contactConfig.whatsappPlaceholder}</span>
                </a>
              </div>

              <div className="contact-channel-item">
                <span className="channel-tag-label">LOCATION &amp; BASE</span>
                <span className="channel-value-text">{contactConfig.location} · Remote Worldwide</span>
              </div>

              <div className="contact-channel-item">
                <span className="channel-tag-label">ESTIMATED RESPONSE</span>
                <span className="channel-value-text highlight-lime">{contactConfig.responseTime}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Secure Enquiry Form */}
          <div className="contact-form-col">
            <div className="contact-form-container">
              {isSubmitted ? (
                <div className="enquiry-success-state" role="status" aria-live="polite">
                  <div className="enquiry-success-icon-wrap">
                    <CheckCircle2 size={36} aria-hidden="true" />
                  </div>
                  <h3 className="enquiry-success-title">Enquiry Submitted Successfully!</h3>
                  <p className="enquiry-success-text">
                    Thank you for reaching out. Your enquiry has been received, and I'll contact you soon.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: 'var(--accent-lime)',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '0.25rem'
                    }}>
                      FAST INQUIRY
                    </span>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-xl)',
                      fontWeight: 800,
                      color: 'var(--bg-ivory)',
                      margin: 0
                    }}>
                      LET'S TALK ABOUT YOUR PROJECT
                    </h3>
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-inverse-muted)',
                      marginTop: '0.35rem',
                      marginBottom: 0
                    }}>
                      Share your details and I'll get back to you promptly.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} noValidate className="contact-form-element">
                  {/* Honeypot Field for Spam Protection */}
                  <input
                    type="text"
                    name="_gotcha"
                    value={formData._gotcha}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  {/* 1. Business Name — Required */}
                  <div className="form-group">
                    <label htmlFor="contact-business" className="input-label">
                      Business Name <span className="req-star">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact-business"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Company, Clinic, or Brand"
                      className="dark-studio-input"
                      aria-required="true"
                      aria-invalid={!!errors.businessName}
                      autoComplete="organization"
                      disabled={isSubmitting}
                    />
                    {errors.businessName && <span className="error-note" role="alert">{errors.businessName}</span>}
                  </div>

                  {/* 2. Phone Number — Required */}
                  <div className="form-group">
                    <label htmlFor="contact-phone" className="input-label">
                      Phone Number <span className="req-star">*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
                        className="dark-studio-select"
                        style={{
                          width: 'auto',
                          minWidth: '105px',
                          flexShrink: 0,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.85rem'
                        }}
                        aria-label="Country Code"
                        disabled={isSubmitting}
                      >
                        {COUNTRY_CODES.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <div style={{ flex: 1 }}>
                        <input
                          type="tel"
                          id="contact-phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="93849 59626"
                          className="dark-studio-input"
                          aria-required="true"
                          aria-invalid={!!errors.phone}
                          autoComplete="tel-national"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    {errors.phone && <span className="error-note" role="alert">{errors.phone}</span>}
                  </div>

                  {/* 3. Email Address — Optional */}
                  <div className="form-group">
                    <label htmlFor="contact-email" className="input-label">
                      Email Address <span className="opt-tag">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className="dark-studio-input"
                      aria-required="false"
                      aria-invalid={!!errors.email}
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                    {errors.email && <span className="error-note" role="alert">{errors.email}</span>}
                  </div>

                  {/* Submission Error Banner */}
                  {submitError && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        padding: '0.85rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 107, 107, 0.12)',
                        border: '1px solid rgba(255, 107, 107, 0.35)',
                        color: '#FF8A8A',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        lineHeight: 1.5
                      }}
                      role="alert"
                    >
                      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#FF6B6B' }} />
                      <div>
                        <strong>Notice:</strong> {submitError}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    ref={magneticSubmitBtnRef}
                    type="submit"
                    className="btn-dark-submit"
                    disabled={isSubmitting}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {isSubmitting ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Loader2 size={16} className="spin-animation" />
                        <span>SUBMITTING ENQUIRY...</span>
                      </span>
                    ) : (
                      <span>Send Enquiry ↗</span>
                    )}
                  </button>
                </form>
              </>
            )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
