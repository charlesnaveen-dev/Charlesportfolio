import React, { useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { services, featuredProject, demoProjects } from '../data/projects';
import { gsap, prefersReducedMotion } from '../utils/motion';

export default function ServiceDetail({
  service,
  onNavigate,
  onStartProject,
  onSelectProject
}) {
  const rootRef = useRef(null);

  // Scroll to top when service changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [service.slug]);

  // Entrance animations
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from('.service-hero-content', {
        y: 35,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out'
      });

      gsap.from('.service-explanation-grid > *', {
        scrollTrigger: {
          trigger: '.service-explanation-section',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.65,
        ease: 'power2.out'
      });

      gsap.from('.deliverable-card', {
        scrollTrigger: {
          trigger: '.service-deliverables-grid',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 25,
        opacity: 0,
        stagger: 0.06,
        duration: 0.55,
        ease: 'power2.out'
      });

      gsap.from('.service-closing-box', {
        scrollTrigger: {
          trigger: '.service-closing-section',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 35,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out'
      });
    }, rootRef);

    return () => ctx.revert();
  }, [service.slug]);

  // Find all projects matching service.relevantProjects
  const allProjects = [featuredProject, ...demoProjects];
  const matchedProjects = (service.relevantProjects || [])
    .map((pid) => allProjects.find((p) => p.id === pid))
    .filter(Boolean);

  // Find previous and next service for navigation strip
  const currentIndex = services.findIndex((s) => s.id === service.id);
  const prevService = currentIndex > 0 ? services[currentIndex - 1] : null;
  const nextService = currentIndex < services.length - 1 ? services[currentIndex + 1] : null;

  const handleCtaClick = (e) => {
    e.preventDefault();
    if (onStartProject) {
      onStartProject(service.id);
    } else if (onNavigate) {
      onNavigate('/contact', '#start-project');
    }
  };

  return (
    <div className="service-detail-view" ref={rootRef}>
      {/* 1. Page Header & Editorial Breadcrumbs */}
      <div className="page-editorial-header">
        <div className="container">
          <div className="page-header-meta">
            <button
              type="button"
              className="page-back-link"
              onClick={() => onNavigate('/services')}
              aria-label="Back to Services Overview"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              <span>ALL SERVICES</span>
            </button>
            <span className="page-meta-sep" aria-hidden="true">/</span>
            <span className="page-breadcrumb-text">SERVICE {service.number}</span>
            <span className="page-meta-num">{service.number} / 05</span>
          </div>

          <div className="page-header-title-box">
            <h1 className="page-main-heading">{service.title}</h1>
            <p className="page-main-description">{service.shortDescription}</p>
          </div>
        </div>
      </div>

      {/* 2. Section A: Hero Section */}
      <section className="service-hero-section" aria-label={`${service.title} Introduction`}>
        <div className="container">
          <div className="service-hero-content">
            <div className="service-hero-badge-strip">
              <span className="service-num-badge">PRACTICE AREA {service.number}</span>
              <span className="service-hero-dot" aria-hidden="true"></span>
              <span className="service-hero-spec">CUSTOM ARCHITECTURE</span>
            </div>

            <h2 className="service-hero-monument">
              {service.heroHeadline}
            </h2>

            <p className="service-hero-lead">
              {service.heroCopy}
            </p>

            <div className="service-hero-actions">
              <button
                type="button"
                className="btn-service-primary-cta"
                onClick={handleCtaClick}
                aria-label={service.heroCta}
              >
                <span>{service.heroCta}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>

              <a
                href="#capabilities"
                className="btn-service-secondary-cta"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector('#capabilities');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>VIEW DELIVERABLES</span>
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section B: Service Explanation */}
      <section className="service-explanation-section" aria-label="Service Details and Problem Solving">
        <div className="container">
          <div className="service-section-header">
            <span className="service-section-kicker">PROBLEM SOLVING &amp; SUITABILITY</span>
            <h3 className="service-section-title">WHY THIS SERVICE MATTERS</h3>
          </div>

          <div className="service-overview-block">
            <p className="service-overview-text">
              {service.overview}
            </p>
          </div>

          {service.problemAndSuitability && service.problemAndSuitability.length > 0 && (
            <div className="service-explanation-grid">
              {service.problemAndSuitability.map((item, idx) => (
                <div key={idx} className="service-problem-card">
                  <div className="service-card-num">0{idx + 1}</div>
                  <h4 className="service-card-title">{item.title}</h4>
                  <p className="service-card-desc">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Section C: Capabilities and Deliverables */}
      <section id="capabilities" className="service-deliverables-section" aria-label="Capabilities and What is Included">
        <div className="container">
          <div className="service-section-header">
            <span className="service-section-kicker">WHAT IS INCLUDED</span>
            <h3 className="service-section-title">CAPABILITIES &amp; DELIVERABLES</h3>
            <p className="service-section-subtitle">
              Every deliverable is engineered with precision, tailored to agreed project scope, and verified across real viewports before handover.
            </p>
          </div>

          <div className="service-deliverables-grid">
            {(service.capabilitiesAndDeliverables || []).map((item, idx) => (
              <div key={idx} className="deliverable-card">
                <div className="deliverable-icon-wrap">
                  <CheckCircle2 size={18} className="deliverable-check-icon" aria-hidden="true" />
                </div>
                <div className="deliverable-text-wrap">
                  <h4 className="deliverable-title">{item.title}</h4>
                  <p className="deliverable-desc">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="service-scope-note">
            <Info size={16} className="scope-note-icon" aria-hidden="true" />
            <p className="scope-note-text">
              <strong>Scope Notice:</strong> Deliverables and technical integrations are planned and confirmed during initial consultation. Exact feature sets, page counts, and third-party services are tailored to your business requirements.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Section D: Relevant Work */}
      <section className="service-work-section" aria-label="Relevant Portfolio Work and Demonstrations">
        <div className="container">
          <div className="service-section-header">
            <span className="service-section-kicker">DEMONSTRATED WORK</span>
            <h3 className="service-section-title">RELEVANT WORK &amp; DEMOS</h3>
            <p className="service-section-subtitle">
              Verified demonstrations reflecting this practice area. Completed client builds and self-initiated concept demonstrations are truthfully labeled.
            </p>
          </div>

          {matchedProjects.length > 0 ? (
            <div className="service-projects-grid">
              {matchedProjects.map((proj) => (
                <div key={proj.id} className="service-project-card">
                  <div className="service-project-media">
                    <img
                      src={proj.image}
                      alt={proj.imageAlt || proj.title}
                      className="service-project-img"
                      loading="lazy"
                    />
                    <div className="service-project-badge-overlay">
                      <span className={`service-status-pill ${proj.badgeClass || ''}`}>
                        {proj.statusBadge}
                      </span>
                    </div>
                  </div>

                  <div className="service-project-info">
                    <div className="service-project-category">{proj.category}</div>
                    <h4 className="service-project-title">{proj.title}</h4>
                    <p className="service-project-desc">{proj.tagline || proj.description}</p>

                    <div className="service-project-actions">
                      {proj.url && (
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-project-link-out"
                        >
                          <span>VISIT SITE / DEMO</span>
                          <ExternalLink size={13} aria-hidden="true" />
                        </a>
                      )}
                      {onSelectProject && (
                        <button
                          type="button"
                          className="btn-project-details"
                          onClick={() => onSelectProject(proj)}
                        >
                          <span>VIEW DETAILS</span>
                          <ArrowUpRight size={13} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="service-honest-notice-card">
              <div className="honest-notice-header">
                <Sparkles size={20} className="honest-notice-icon" aria-hidden="true" />
                <h4 className="honest-notice-title">Tailored Engineering &amp; Custom Project Scoping</h4>
              </div>
              <p className="honest-notice-body">
                {service.honestNote ||
                  'This service is provided on a custom-scoped project basis. Every engagement starts with a thorough technical feasibility assessment and clear architecture planning. No fabricated client work or unverified case studies are published here.'}
              </p>
              <div className="honest-notice-action">
                <button
                  type="button"
                  className="btn-service-primary-cta"
                  onClick={handleCtaClick}
                >
                  <span>{service.heroCta}</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. Section E: Closing CTA Banner */}
      <section className="service-closing-section" aria-label="Start a Project">
        <div className="container">
          <div className="service-closing-box">
            <div className="closing-content">
              <span className="closing-kicker">NEXT STEPS</span>
              <h3 className="closing-headline">
                {service.closingHeadline || 'Ready to Build Something Better?'}
              </h3>
              <p className="closing-lead">
                {service.closingCopy ||
                  "Tell me about your project, your goals, and what you need. Let's discuss the right solution for your business."}
              </p>
              <div className="closing-actions">
                <button
                  type="button"
                  className="btn-closing-primary"
                  onClick={handleCtaClick}
                  aria-label={service.closingCta || 'START A PROJECT'}
                >
                  <span>{service.closingCta || 'START A PROJECT'}</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Service Navigation Strip */}
      <section className="service-nav-strip" aria-label="Browse Other Services">
        <div className="container">
          <div className="service-nav-grid">
            {prevService ? (
              <a
                href={prevService.slug}
                className="service-nav-item is-prev"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(prevService.slug);
                }}
              >
                <span className="nav-arrow-label">
                  <ArrowLeft size={14} aria-hidden="true" />
                  <span>PREVIOUS SERVICE</span>
                </span>
                <span className="nav-service-title">{prevService.number} — {prevService.title}</span>
              </a>
            ) : (
              <div className="service-nav-item is-placeholder" />
            )}

            <a
              href="/services"
              className="service-nav-center-link"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/services');
              }}
            >
              <span>ALL SERVICES OVERVIEW (05)</span>
            </a>

            {nextService ? (
              <a
                href={nextService.slug}
                className="service-nav-item is-next"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(nextService.slug);
                }}
              >
                <span className="nav-arrow-label">
                  <span>NEXT SERVICE</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
                <span className="nav-service-title">{nextService.number} — {nextService.title}</span>
              </a>
            ) : (
              <div className="service-nav-item is-placeholder" />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
