import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDown, CheckCircle2 } from 'lucide-react';
import { services } from '../data/projects';
import { useMagnetic } from '../hooks/useMagnetic';
import { gsap, prefersReducedMotion } from '../utils/motion';

export default function Hero({ onOpenContact, onNavigate }) {
  const rootRef = useRef(null);
  const magneticPrimaryRef = useMagnetic(0.25);
  const magneticSecondaryRef = useMagnetic(0.2);
  const badgeRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Meta bar entrance
      tl.from('.hero-meta-bar', {
        y: -20,
        opacity: 0,
        duration: 0.6
      });

      // Monumental title reveal
      tl.from('.hero-giant-heading', {
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8
      }, '-=0.3');

      // DEV Circular badge pop in
      tl.from('.circular-dev-badge', {
        scale: 0,
        rotation: -180,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.8)'
      }, '-=0.6');

      // Tagline reveal
      tl.from('.hero-heading-tagline', {
        x: -20,
        opacity: 0,
        duration: 0.5
      }, '-=0.5');

      // Narrative text & CTAs
      tl.fromTo('.hero-narrative-box',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      );

      tl.fromTo('.hero-cta-cluster > *',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.5 },
        '-=0.4'
      );

      // Right preview card entrance
      tl.fromTo('.hero-preview-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
        '-=0.5'
      );

      // Fact items stagger
      tl.fromTo('.fact-item',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.5 },
        '-=0.3'
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const handleWorkClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('/work');
    } else {
      const el = document.querySelector('#work');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleServicesClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('/services');
    } else {
      const el = document.querySelector('#services');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    if (onOpenContact) {
      onOpenContact('direct');
    } else if (onNavigate) {
      onNavigate('/contact');
    } else {
      const el = document.querySelector('#contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={rootRef} className="hero-editorial-section" aria-label="Charles Naveen — Portfolio Hero">
      <div className="container">
        {/* Top Metadata Bar */}
        <div className="hero-meta-bar">
          <div className="hero-meta-left">
            <span className="hero-meta-name">CHARLES NAVEEN</span>
            <span className="meta-sep" aria-hidden="true">/</span>
            <span className="hero-meta-role">Freelance Web Developer</span>
            <span className="meta-sep" aria-hidden="true">/</span>
            <span className="hero-meta-loc">Tamil Nadu, India</span>
          </div>

          <div className="hero-availability-badge" role="status">
            <span className="pulse-dot" aria-hidden="true"></span>
            <span>AVAILABLE FOR CLIENT BUILDS &amp; AGENCY PARTNERSHIPS</span>
          </div>
        </div>

        {/* 2-Column Balanced Hero Stage (Improvement A) */}
        <div className="hero-split-stage">
          {/* Left Column: Monumental Typography, Positioning & CTAs */}
          <div className="hero-left-column">
            <div className="hero-typography-block">
              <div className="hero-line-row">
                <h1 className="hero-giant-heading">
                  CHARLES
                </h1>
                {/* Circular Interactive DEV Badge */}
                <div ref={badgeRef} className="circular-dev-badge" aria-hidden="true">
                  <svg className="badge-rotating-text" viewBox="0 0 100 100">
                    <path
                      id="circlePath"
                      d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                      fill="none"
                    />
                    <text>
                      <textPath href="#circlePath" startOffset="0%">
                        ★ FREELANCE WEB DEV ★ CLEAN REACT
                      </textPath>
                    </text>
                  </svg>
                  <div className="badge-center-core">
                    <span>DEV</span>
                  </div>
                </div>
              </div>

              <div className="hero-line-row second-row">
                <h1 className="hero-giant-heading">
                  NAVEEN
                </h1>
                <span className="hero-heading-tagline">
                  [FREELANCE WEB DEVELOPER]
                </span>
              </div>
            </div>

            <div className="hero-narrative-box">
              <h2 className="hero-value-headline">
                Websites built to turn business attention into enquiries.
              </h2>
              <p className="hero-lead-text">
                I design and develop modern websites for businesses and creative teams, combining thoughtful design, smooth interactions, and performance-focused development.
              </p>
            </div>

            <div className="hero-cta-cluster">
              <button
                ref={magneticPrimaryRef}
                type="button"
                className="btn-hero-primary"
                onClick={handleContactClick}
              >
                <span>DISCUSS A PROJECT</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>

              <a
                ref={magneticSecondaryRef}
                href="/work"
                className="btn-hero-secondary"
                onClick={handleWorkClick}
              >
                <span>EXPLORE WORK</span>
                <ArrowDown size={15} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Right Column: Authentic Capabilities & Engineering Practice Index */}
          <div className="hero-right-column">
            <div className="hero-preview-card">
              {/* Card Header */}
              <div className="hero-preview-header">
                <div className="hero-preview-badge">
                  <span className="preview-badge-dot" aria-hidden="true"></span>
                  <span>CORE DISCIPLINES &amp; OFFERINGS</span>
                </div>
                <span className="hero-preview-count">04 PRACTICE AREAS</span>
              </div>

              {/* Authentic Quick Services Index */}
              <div className="hero-services-list" role="list">
                {services.map((s) => (
                  <a
                    key={s.number}
                    href={s.slug || "/services"}
                    className="hero-service-item"
                    role="listitem"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(s.slug || '/services');
                    }}
                  >
                    <div className="hero-service-meta">
                      <span className="hero-service-num">{s.number}</span>
                      <span className="hero-service-title">{s.title}</span>
                    </div>
                    <span className="hero-service-tag">EXPLORE ↗</span>
                  </a>
                ))}
              </div>

              {/* Engineering Delivery Standards (Authentic from Impact/Pillars) */}
              <div className="hero-pillars-box">
                <div className="pillars-label">DEVELOPMENT STANDARDS</div>
                <ul className="pillars-list">
                  <li className="pillar-item">
                    <CheckCircle2 size={13} className="pillar-icon" aria-hidden="true" />
                    <span>Sub-second loading &amp; 95+ Core Web Vitals target</span>
                  </li>
                  <li className="pillar-item">
                    <CheckCircle2 size={13} className="pillar-icon" aria-hidden="true" />
                    <span>Tested across real iPhone, Android &amp; desktop viewports</span>
                  </li>
                  <li className="pillar-item">
                    <CheckCircle2 size={13} className="pillar-icon" aria-hidden="true" />
                    <span>Direct developer access &amp; agency white-label discretion</span>
                  </li>
                </ul>
              </div>

              {/* Action Pathways Strip */}
              <div className="hero-pathways-strip">
                <a
                  href="/work"
                  className="pathway-link"
                  onClick={handleWorkClick}
                >
                  <span>Selected Work (5 Projects) →</span>
                </a>
                <a
                  href="/services"
                  className="pathway-link"
                  onClick={handleServicesClick}
                >
                  <span>5-Stage Process →</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* At-a-glance Strip */}
        <div className="hero-fact-strip" aria-label="At a glance details">
          <div className="fact-item">
            <span className="fact-number">01</span>
            <div className="fact-info">
              <span className="fact-label">CORE STACK</span>
              <span className="fact-value">React 18 · Modern CSS · Vite</span>
            </div>
          </div>

          <div className="fact-item">
            <span className="fact-number">02</span>
            <div className="fact-info">
              <span className="fact-label">PRIMARY FOCUS</span>
              <span className="fact-value">Business Websites &amp; Agency Subcontracting</span>
            </div>
          </div>

          <div className="fact-item">
            <span className="fact-number">03</span>
            <div className="fact-info">
              <span className="fact-label">LOCATION</span>
              <span className="fact-value">Tamil Nadu, India · Remote Worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
