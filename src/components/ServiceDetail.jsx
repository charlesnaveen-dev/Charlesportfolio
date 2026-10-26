import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Clock,
  Compass,
  AlertTriangle,
  FolderKanban
} from 'lucide-react';
import { services, featuredProject, demoProjects } from '../data/projects';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../utils/motion';

export default function ServiceDetail({
  service,
  onNavigate,
  onStartProject,
  onSelectProject
}) {
  const rootRef = useRef(null);
  const [imageErrors, setImageErrors] = useState({});

  // Scroll to top when service changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setImageErrors({});
  }, [service.slug]);

  // Entrance animations with safety checks
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from('.service-hero-content', {
        y: 25,
        opacity: 0,
        duration: 0.65,
        ease: 'power3.out'
      });

      // Refresh ScrollTrigger to recalculate layout positions
      if (typeof ScrollTrigger !== 'undefined') {
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 150);
      }
    }, rootRef);

    return () => ctx.revert();
  }, [service.slug]);

  const handleImageError = (projectId) => {
    setImageErrors((prev) => ({ ...prev, [projectId]: true }));
  };

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
            <span className="page-meta-num">{service.number} / 08</span>
          </div>

          <div className="page-header-title-box">
            <h1 className="page-main-heading">{service.title}</h1>
            <p className="page-main-description">{service.shortDescription}</p>
          </div>
        </div>
      </div>

      {/* 2. Section A: Service Introduction (Hero) */}
      <section className="service-hero-section" aria-label={`${service.title} Introduction`}>
        <div className="container">
          <div className="service-hero-content">
            <div className="service-hero-badge-strip">
              <span className="service-num-badge">SERVICE {service.number}</span>
              <span className="service-hero-dot" aria-hidden="true"></span>
              <span className="service-hero-spec">PRACTICE AREA</span>
            </div>

            <h2 className="service-hero-monument">
              {service.heroHeadline}
            </h2>

            <p className="service-hero-lead">
              {service.heroCopy}
            </p>

            {/* Optional Technology / Platform References */}
            {service.platforms && service.platforms.length > 0 && (
              <div className="service-platform-pills" aria-label="Supported platforms and technologies">
                <span className="platform-pills-label">CORE TECHNOLOGIES:</span>
                <div className="platform-pills-list">
                  {service.platforms.map((tech, idx) => (
                    <span key={idx} className="platform-pill-item">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

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

      {/* 3. Section B: The Business Challenge */}
      {service.businessChallenge && service.businessChallenge.length > 0 && (
        <section className="service-challenge-section" aria-label="The Business Challenge">
          <div className="container">
            <div className="service-section-header">
              <span className="service-section-kicker">THE BUSINESS CHALLENGE</span>
              <h3 className="service-section-title">PROBLEMS THIS SERVICE SOLVES</h3>
              <p className="service-section-subtitle">
                Common obstacles organizations face before bringing in focused technical engineering and structured development.
              </p>
            </div>

            <div className="service-challenge-grid">
              {service.businessChallenge.map((item, idx) => (
                <div key={idx} className="service-problem-card">
                  <div className="service-card-num">CHALLENGE 0{idx + 1}</div>
                  <h4 className="service-card-title">{item.title}</h4>
                  <p className="service-card-desc">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Section C: Our Approach */}
      <section className="service-approach-section" aria-label="Our Approach and Methodology">
        <div className="container">
          <div className="service-section-header">
            <span className="service-section-kicker">TAILORED EXECUTION</span>
            <h3 className="service-section-title">OUR APPROACH &amp; STRATEGY</h3>
          </div>

          <div className="service-overview-block">
            <p className="service-overview-text">
              {service.ourApproach || service.overview}
            </p>
          </div>

          {service.approachSteps && service.approachSteps.length > 0 && (
            <div className="service-approach-steps-grid">
              {service.approachSteps.map((step, idx) => (
                <div key={idx} className="approach-step-card">
                  <div className="approach-step-header">
                    <Compass size={18} className="approach-step-icon" aria-hidden="true" />
                    <span className="approach-step-label">PILLAR 0{idx + 1}</span>
                  </div>
                  <h4 className="approach-step-title">{step.title}</h4>
                  <p className="approach-step-desc">{step.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Section D: Capabilities & Deliverables */}
      <section id="capabilities" className="service-deliverables-section" aria-label="Capabilities and Deliverables">
        <div className="container">
          <div className="service-section-header">
            <span className="service-section-kicker">WHAT IS INCLUDED</span>
            <h3 className="service-section-title">CAPABILITIES &amp; DELIVERABLES</h3>
            <p className="service-section-subtitle">
              Specific, tangible items delivered as part of this service. Every deliverable is tested and verified before handover.
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
              <strong>Scope Notice:</strong> Exact deliverables and technical choices are confirmed during the initial project discovery. Features, page counts, and third-party integrations are tailored to your business requirements.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Section E: Project Process */}
      {service.processStages && service.processStages.length > 0 && (
        <section className="service-process-section" aria-label="Project Delivery Stages">
          <div className="container">
            <div className="service-section-header">
              <span className="service-section-kicker">WORKING METHODOLOGY</span>
              <h3 className="service-section-title">HOW THIS PROJECT WORKS</h3>
              <p className="service-section-subtitle">
                A predictable, transparent step-by-step path from initial requirements to delivery and ongoing support.
              </p>
            </div>

            <div className="service-process-grid">
              {service.processStages.map((st, idx) => (
                <div key={idx} className="service-process-card">
                  <span className="process-step-num">{st.step}</span>
                  <h4 className="process-step-title">{st.title}</h4>
                  <p className="process-step-desc">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Section F: Relevant Work & Demos */}
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
              {matchedProjects.map((proj) => {
                const isImgBroken = imageErrors[proj.id];
                return (
                  <div key={proj.id} className="service-project-card">
                    <div className="service-project-media">
                      {!isImgBroken && proj.image ? (
                        <img
                          src={proj.image}
                          alt={proj.imageAlt || proj.title}
                          className="service-project-img"
                          loading="lazy"
                          decoding="async"
                          width="1200"
                          height="750"
                          onError={() => handleImageError(proj.id)}
                        />
                      ) : (
                        <div className="project-image-fallback">
                          <FolderKanban size={36} className="fallback-icon" aria-hidden="true" />
                          <span className="fallback-title">{proj.title}</span>
                          <span className="fallback-category">{proj.category}</span>
                        </div>
                      )}
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
                );
              })}
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

      {/* 8. Section G: Closing CTA Banner */}
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

      {/* 9. Service Navigation Strip */}
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
              <span>ALL SERVICES OVERVIEW (08)</span>
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
