import React, { useEffect, useRef } from 'react';
import { developerBio } from '../data/projects';
import { GraduationCap, MapPin, Compass } from 'lucide-react';
import { gsap, prefersReducedMotion } from '../utils/motion';

export default function About() {
  const rootRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.from('.about-editorial-section .section-header-wrap', {
        scrollTrigger: {
          trigger: '.about-editorial-section .section-header-wrap',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 35,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out'
      });

      // Left narrative text stagger
      gsap.from('.about-narrative-flow > *', {
        scrollTrigger: {
          trigger: '.about-narrative-flow',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power2.out'
      });

      // Right values list stagger
      gsap.from('.pillar-item', {
        scrollTrigger: {
          trigger: '.pillars-stack',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        x: 35,
        opacity: 0,
        stagger: 0.14,
        duration: 0.75,
        ease: 'power3.out'
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={rootRef} className="about-editorial-section" aria-label="About Charles Naveen">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-wrap">
          <div className="section-pretitle">
            <span className="studio-tag">{developerBio.eyebrow}</span>
            <span style={{ color: 'var(--border-medium)' }}>/</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              BACKGROUND &amp; VALUES
            </span>
          </div>
          <h2 className="about-monument-title">
            Precision in craft. <span className="highlight-serif">Partnership in practice</span>.
          </h2>
        </div>

        <div className="about-editorial-grid">
          {/* Main Narrative */}
          <div className="about-narrative-flow">
            <p className="about-lead-paragraph">
              {developerBio.paragraphs[0]}
            </p>
            <p className="about-body-paragraph">
              {developerBio.paragraphs[1]}
            </p>
            <p className="about-body-paragraph">
              {developerBio.paragraphs[2]}
            </p>

            {/* Quick Credentials Strip */}
            <div className="about-creds-strip">
              <div className="cred-badge">
                <GraduationCap size={16} className="cred-icon" aria-hidden="true" />
                <span>{developerBio.qualification}</span>
              </div>
              <div className="cred-badge">
                <MapPin size={16} className="cred-icon" aria-hidden="true" />
                <span>{developerBio.location}</span>
              </div>
              <div className="cred-badge">
                <Compass size={16} className="cred-icon" aria-hidden="true" />
                <span>Custom React &amp; Modern CSS</span>
              </div>
            </div>
          </div>

          {/* Pillars Column */}
          <aside className="about-pillars-box" aria-label="Development Pillars">
            <div className="about-box-title">GUIDING PILLARS</div>

            <div className="pillars-stack">
              {developerBio.pillars.map((pillar, idx) => (
                <div key={idx} className="pillar-item">
                  <span className="pillar-item-num">0{idx + 1}</span>
                  <h3 className="pillar-item-label">{pillar.label}</h3>
                  <p className="pillar-item-desc">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
