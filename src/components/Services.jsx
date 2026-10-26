import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { services } from '../data/projects';
import { gsap, prefersReducedMotion } from '../utils/motion';

export default function Services({ onSelectServiceForContact, onNavigate }) {
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.from('.services-section .section-header-wrap', {
        scrollTrigger: {
          trigger: '.services-section .section-header-wrap',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 35,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out'
      });

      // Staggered capability rows reveal
      gsap.from('.capability-row', {
        scrollTrigger: {
          trigger: '.capabilities-container',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out'
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const handleRowClick = (slug) => {
    if (onNavigate) {
      onNavigate(slug);
    } else {
      window.location.pathname = slug;
    }
  };

  return (
    <section id="services" ref={rootRef} className="services-section" aria-label="Capabilities and Services">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-wrap">
          <div className="section-pretitle">
            <span className="studio-tag">SERVICES &amp; SOLUTIONS</span>
            <span style={{ color: 'var(--border-medium, #C2BEB5)' }}>/</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted-ivory)' }}>
              CORE OFFERINGS
            </span>
          </div>
          <h2 className="section-title-large">
            SERVICES &amp; CAPABILITIES
          </h2>
          <p className="section-lead">
            Straightforward web development services for business owners who need high-performing websites
            that build trust, communicate clearly, and generate genuine customer enquiries.
          </p>
        </div>

        {/* Interactive Capability Rows */}
        <div className="capabilities-container" role="list">
          {services.map((item, idx) => {
            const isActive = activeServiceIndex === idx;
            return (
              <div
                key={item.number}
                className={`capability-row ${isActive ? 'is-active' : ''}`}
                onClick={() => handleRowClick(item.slug)}
                onMouseEnter={() => setActiveServiceIndex(idx)}
                onFocus={() => setActiveServiceIndex(idx)}
                tabIndex={0}
                role="listitem"
                aria-label={`${item.number} — ${item.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRowClick(item.slug);
                  }
                }}
              >
                <div className="capability-row-main">
                  <div className="capability-identity">
                    <span className="capability-num">{item.number}</span>
                    <div className="capability-title-desc-wrap">
                      <h3 className="capability-title">{item.title}</h3>
                      <p className="capability-short-desc">{item.shortDescription}</p>
                    </div>
                  </div>

                  <div className="capability-action-wrap">
                    <a
                      href={item.slug}
                      className="btn-capability-learn-more"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRowClick(item.slug);
                      }}
                      aria-label={`Learn more about ${item.title}`}
                    >
                      <span>LEARN MORE</span>
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
