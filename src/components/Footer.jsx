import React from 'react';
import { ArrowUp } from 'lucide-react';
import { contactConfig } from '../data/contactConfig';

export default function Footer({ onNavigate }) {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Home', href: '/', route: '/' },
    { label: 'Work', href: '/work', route: '/work' },
    { label: 'Services', href: '/services', route: '/services' },
    { label: 'Contact', href: '/contact', route: '/contact' }
  ];

  const handleLinkClick = (e, link) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(link.route, link.targetHash);
    } else {
      window.location.href = link.href;
    }
  };

  return (
    <footer className="master-footer" role="contentinfo">
      <div className="container">
        <div className="footer-top-row">
          <div className="footer-identity-col">
            <div className="footer-monument-brand">
              <span>CHARLES NAVEEN</span>
              <span className="brand-dot-lime" aria-hidden="true"></span>
            </div>
            <p className="footer-mission-statement">
              Freelance Web Developer crafting high-performance websites for businesses and dependable white-label development for marketing agencies.
            </p>
            <div className="footer-contact-fast">
              <a href={`mailto:${contactConfig.emailPlaceholder}`} className="footer-fast-link">
                {contactConfig.emailPlaceholder}
              </a>
              <span className="footer-sep">·</span>
              <span className="footer-loc-text">{contactConfig.location}</span>
            </div>
          </div>

          <nav aria-label="Footer Navigation" className="footer-nav-col">
            <span className="footer-col-title">NAVIGATION</span>
            <ul className="footer-links-list">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="footer-nav-anchor"
                    onClick={(e) => handleLinkClick(e, link)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer-bottom-row">
          <p className="footer-legal-copy">
            © {currentYear} Charles Naveen. Freelance Web Developer. Engineered with custom React &amp; modern CSS.
          </p>

          <button
            type="button"
            className="footer-top-btn"
            onClick={handleScrollToTop}
            aria-label="Scroll back to top of page"
          >
            <span>BACK TO TOP</span>
            <ArrowUp size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
