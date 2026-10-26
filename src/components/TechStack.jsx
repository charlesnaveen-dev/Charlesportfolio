import React, { useEffect, useRef } from 'react';
import { technicalStackData } from '../data/techStack';
import { gsap, prefersReducedMotion } from '../utils/motion';

export default function TechStack() {
  const rootRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.from('.tech-stack-section .section-header-wrap', {
        scrollTrigger: {
          trigger: '.tech-stack-section .section-header-wrap',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out'
      });

      // Category cards stagger reveal
      gsap.from('.tech-category-card', {
        scrollTrigger: {
          trigger: '.tech-stack-grid',
          start: 'top 82%',
          toggleActions: 'play none none reverse'
        },
        y: 35,
        opacity: 0,
        stagger: 0.1,
        duration: 0.65,
        ease: 'power3.out'
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="tech-stack"
      ref={rootRef}
      className="tech-stack-section"
      aria-label="Technical Stack and Technologies"
    >
      <div className="container">
        {/* Section Editorial Header */}
        <div className="section-header-wrap">
          <div className="section-pretitle">
            <span className="studio-tag">{technicalStackData.eyebrow}</span>
            <span style={{ color: 'var(--border-medium)' }}>/</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)'
              }}
            >
              CORE TECHNOLOGIES &amp; TOOLS
            </span>
          </div>
          <h2 className="section-monument-title">{technicalStackData.title}</h2>
          <p className="section-lead-copy">{technicalStackData.subtitle}</p>
        </div>

        {/* Categories Grid */}
        <div className="tech-stack-grid">
          {technicalStackData.categories.map((cat) => (
            <article key={cat.id} className="tech-category-card">
              {/* Category Card Header */}
              <div className="tech-category-header">
                <div className="tech-category-meta">
                  <span className="tech-cat-number">{cat.number}</span>
                  <span className="tech-cat-count">
                    {cat.technologies.length} TECHS
                  </span>
                </div>
                <h3 className="tech-category-title">{cat.title}</h3>
                <p className="tech-category-desc">{cat.description}</p>
              </div>

              {/* Technologies List */}
              <div className="tech-items-list" role="list">
                {cat.technologies.map((tech) => (
                  <div
                    key={tech.name}
                    className="tech-item-row"
                    role="listitem"
                  >
                    <div className="tech-item-lead">
                      <div className="tech-item-icon-frame" aria-hidden="true">
                        <img
                          src={tech.icon}
                          alt=""
                          className="tech-item-icon-img"
                          loading="lazy"
                          decoding="async"
                          width="20"
                          height="20"
                        />
                      </div>
                      <div className="tech-item-text">
                        <span className="tech-item-name">{tech.name}</span>
                        <span className="tech-item-role">{tech.role}</span>
                      </div>
                    </div>

                    <span className="tech-item-tag">{tech.tag}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
