import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  Briefcase,
  FileCheck2,
  Loader2
} from 'lucide-react';
import { projectEnquiryData } from '../data/projects';
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
  { code: '+966', country: 'SA', label: '+966 (Saudi Arabia)' },
  { code: '+60', country: 'MY', label: '+60 (Malaysia)' },
  { code: '+other', country: 'GL', label: 'Other' }
];

export default function StartProject() {
  const rootRef = useRef(null);
  const magneticSubmitBtnRef = useMagnetic(0.2);

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

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.from('.start-project-section .section-header-wrap', {
        scrollTrigger: {
          trigger: '.start-project-section .section-header-wrap',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out'
      });

      // Pillars stagger
      gsap.from('.engagement-pillar-card', {
        scrollTrigger: {
          trigger: '.engagement-pillars-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        y: 35,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out'
      });

      // Enquiry form card entrance
      gsap.from('.enquiry-form-card', {
        scrollTrigger: {
          trigger: '.enquiry-form-card',
          start: 'top 82%',
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
          source: 'start-project-section',
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
    <section
      id="start-project"
      ref={rootRef}
      className="start-project-section"
      aria-label="Start a Project — Project Enquiries"
    >
      {/* Invisible anchor for backward compatibility */}
      <span id="pricing" style={{ display: 'block', position: 'relative', top: '-100px', visibility: 'hidden' }} aria-hidden="true"></span>

      <div className="container">
        {/* Section Header */}
        <div className="section-header-wrap" style={{ maxWidth: '960px' }}>
          <div className="section-pretitle">
            <span className="studio-tag">{projectEnquiryData.eyebrow}</span>
            <span style={{ color: 'var(--border-medium)' }}>/</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              START A PROJECT
            </span>
          </div>
          <h2 className="section-title-large">
            {projectEnquiryData.headline}
          </h2>
          <p className="section-lead">
            {projectEnquiryData.supportingCopy}
          </p>
        </div>

        {/* Three Engagement Sections: Businesses, Agencies, Scope & Quotation */}
        <div className="engagement-pillars-grid">
          {projectEnquiryData.engagements.map((item, idx) => {
            const icons = [Building2, Briefcase, FileCheck2];
            const IconComp = icons[idx] || Building2;
            return (
              <div key={item.number} className="engagement-pillar-card">
                <div className="pillar-header">
                  <div className="pillar-tag-strip">
                    <span className="pillar-index-num">/{item.number}</span>
                    <span className="pillar-tag-pill">{item.tag}</span>
                  </div>
                  <div className="pillar-icon-box">
                    <IconComp size={18} aria-hidden="true" />
                  </div>
                </div>

                <h3 className="pillar-audience-title">{item.audience}</h3>

                <blockquote className="pillar-quote">
                  "{item.statement}"
                </blockquote>

                <p className="pillar-desc">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Simplified, Clean & Focused Project Enquiry Form Container */}
        <div className="enquiry-form-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div className="enquiry-card-header">
            <div>
              <span className="enquiry-card-eyebrow">DIRECT INQUIRY</span>
              <h3 className="enquiry-card-title">LET'S TALK ABOUT YOUR PROJECT</h3>
              <p className="enquiry-card-subtitle">
                Share your details and I'll get back to you promptly.
              </p>
            </div>
            <span className="enquiry-response-tag">
              ● Direct response within 24h
            </span>
          </div>

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
            <form onSubmit={handleSubmit} noValidate className="enquiry-form-body">
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
                <label htmlFor="enquiry-business" className="input-label">
                  Business Name <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  id="enquiry-business"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Company, Brand, or Clinic"
                  className="editorial-input"
                  aria-required="true"
                  aria-invalid={!!errors.businessName}
                  autoComplete="organization"
                  disabled={isSubmitting}
                />
                {errors.businessName && (
                  <span className="error-note" role="alert">
                    {errors.businessName}
                  </span>
                )}
              </div>

              {/* 2. Phone Number — Required */}
              <div className="form-group">
                <label htmlFor="enquiry-phone" className="input-label">
                  Phone Number <span className="req-star">*</span>
                </label>
                <div className="phone-input-row">
                  <select
                    id="enquiry-country-code"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="editorial-select phone-code-select"
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
                      id="enquiry-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="93849 59626"
                      className="editorial-input"
                      aria-required="true"
                      aria-invalid={!!errors.phone}
                      autoComplete="tel-national"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                {errors.phone && (
                  <span className="error-note" role="alert">
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* 3. Email Address — Optional */}
              <div className="form-group">
                <label htmlFor="enquiry-email" className="input-label">
                  Email Address <span className="opt-tag">(Optional)</span>
                </label>
                <input
                  type="email"
                  id="enquiry-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="editorial-input"
                  aria-required="false"
                  aria-invalid={!!errors.email}
                  autoComplete="email"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <span className="error-note" role="alert">
                    {errors.email}
                  </span>
                )}
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
                    backgroundColor: 'rgba(211, 47, 47, 0.08)',
                    border: '1.5px solid #D32F2F',
                    color: '#B71C1C',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    lineHeight: 1.5
                  }}
                  role="alert"
                >
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#D32F2F' }} />
                  <div>
                    <strong>Notice:</strong> {submitError}
                  </div>
                </div>
              )}

              {/* Single Prominent Lime-Green Submit Button */}
              <div className="enquiry-submit-row" style={{ marginTop: '0.75rem' }}>
                <button
                  ref={magneticSubmitBtnRef}
                  type="submit"
                  className="btn-enquiry-submit"
                  disabled={isSubmitting}
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
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
