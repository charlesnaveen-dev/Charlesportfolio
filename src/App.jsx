import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Navbar from './components/Navbar';
import PageHeader from './components/PageHeader';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Statement from './components/Statement';
import Services from './components/Services';
import ServiceDetail from './components/ServiceDetail';
import ImpactComparison from './components/ImpactComparison';
import ProjectGrid from './components/ProjectGrid';
import Process from './components/Process';
import StartProject from './components/StartProject';
import Collaboration from './components/Collaboration';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProjectModal from './components/ProjectModal';
import CustomCursor from './components/CustomCursor';
import { services } from './data/projects';
import { useScrollReveal } from './hooks/useScrollReveal';

function getInitialRoute() {
  if (typeof window === 'undefined') return '/';

  const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  const hash = window.location.hash.toLowerCase();

  // Support hash routing fallback like #/services/website-development
  if (hash.startsWith('#/')) {
    const hashRoute = hash.slice(1).replace(/\/$/, '') || '/';
    return hashRoute;
  }

  if (path === '/work') return '/work';
  if (path === '/services') return '/services';
  if (path === '/contact') return '/contact';

  const matchedService = services.find((s) => s.slug === path);
  if (matchedService) return matchedService.slug;

  return '/';
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [activeModalProject, setActiveModalProject] = useState(null);
  const [contactIntent, setContactIntent] = useState('direct');
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  const [projectIntent, setProjectIntent] = useState('business');
  const mainRef = useRef(null);
  useScrollReveal(mainRef);

  // Sync route on popstate and hashchange
  useEffect(() => {
    const handlePopState = () => {
      const newRoute = getInitialRoute();
      setCurrentRoute(newRoute);
      if (window.location.hash && !window.location.hash.startsWith('#/')) {
        setTimeout(() => {
          const el = document.querySelector(window.location.hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Synchronize document title, meta description, and canonical link
  useEffect(() => {
    const canonicalEl = document.querySelector('link[rel="canonical"]');
    const metaDescEl = document.querySelector('meta[name="description"]');
    const ogTitleEl = document.querySelector('meta[property="og:title"]');
    const ogDescEl = document.querySelector('meta[property="og:description"]');
    const ogUrlEl = document.querySelector('meta[property="og:url"]');

    const service = services.find((s) => s.slug === currentRoute);

    let title = 'Charles Naveen — Freelance Web Developer | Websites for Businesses & Agencies';
    let description =
      'Websites built to turn business attention into enquiries. Charles Naveen designs and develops modern, responsive websites for businesses and provides dependable development.';
    let url = `https://charlesportfolio-self.vercel.app${currentRoute === '/' ? '' : currentRoute}`;

    if (service) {
      title = service.metaTitle;
      description = service.metaDescription;
    } else if (currentRoute === '/services') {
      title = 'Services & Capabilities — Charles Naveen | Freelance Web Developer';
      description =
        'Explore web development services: business websites, landing pages, e-commerce stores, mobile applications, and custom feature integrations.';
    } else if (currentRoute === '/work') {
      title = 'Selected Work & Demonstrations — Charles Naveen | Freelance Web Developer';
      description =
        'A curated index of production client engineering and bespoke concept demonstrations. Engineered with custom React, modern typography, and responsive craftsmanship.';
    } else if (currentRoute === '/contact') {
      title = 'Contact & Start a Project — Charles Naveen | Freelance Web Developer';
      description =
        'Direct communication channels, interactive scope blueprint, and prompt developer turnaround for businesses.';
    }

    document.title = title;
    if (metaDescEl) metaDescEl.setAttribute('content', description);
    if (canonicalEl) canonicalEl.setAttribute('href', url);
    if (ogTitleEl) ogTitleEl.setAttribute('content', title);
    if (ogDescEl) ogDescEl.setAttribute('content', description);
    if (ogUrlEl) ogUrlEl.setAttribute('content', url);
  }, [currentRoute]);

  // Handle cross-page and intra-page navigation
  const navigateTo = (toRoute, targetHash = null) => {
    let route = toRoute.toLowerCase().replace(/\/$/, '') || '/';
    if (route === '/home') route = '/';

    setCurrentRoute(route);

    const newUrl = targetHash ? `${route}${targetHash}` : route;
    if (window.location.pathname !== route || window.location.hash !== (targetHash || '')) {
      window.history.pushState(null, '', newUrl);
    }

    if (targetHash) {
      setTimeout(() => {
        const el = document.querySelector(targetHash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartProject = (typeOrIntent = 'business') => {
    if (typeOrIntent === 'agency') {
      setProjectIntent('agency');
      setSelectedProjectType('agency-whitelabel');
    } else if (typeOrIntent && typeOrIntent !== 'business' && typeOrIntent !== 'direct') {
      setSelectedProjectType(typeOrIntent);
      setProjectIntent('business');
    } else {
      setProjectIntent('business');
    }

    if (currentRoute === '/') {
      const el = document.querySelector('#start-project');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigateTo('/contact', '#start-project');
  };

  const handleOpenContact = (intent = 'direct') => {
    setContactIntent(intent);
    if (currentRoute === '/') {
      const el = document.querySelector('#contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigateTo('/contact', '#contact');
  };

  const activeService = services.find((s) => s.slug === currentRoute);

  return (
    <div className="portfolio-app-root">
      {/* Desktop Custom Magnetic Cursor */}
      <CustomCursor />

      {/* Primary Fixed Header with Navigation Links */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        onOpenContact={handleOpenContact}
      />

      {/* Main Content Landmark */}
      <main id="main-content" ref={mainRef}>
        {/* =========================================================================
            PAGE 1: HOME (Route: /)
            Complete portfolio landing page containing ALL sections
            ========================================================================= */}
        {currentRoute === '/' && (
          <div className="page-view page-home">
            {/* Section 1: Hero — First Screen Impact */}
            <Hero
              onOpenContact={() => handleOpenContact('direct')}
              onNavigate={navigateTo}
            />

            {/* Section 2: Kinetic Studio Marquee Ribbon */}
            <Marquee />

            {/* Section 3: High-Contrast Ethos Statement */}
            <Statement onOpenContact={() => handleStartProject('business')} />

            {/* Section 4: Capabilities & Core Offerings */}
            <Services
              onSelectServiceForContact={(serviceId) => handleStartProject(serviceId)}
              onNavigate={navigateTo}
            />

            {/* Section 5: Engineering Standards & Production Benchmarks */}
            <div id="impact">
              <ImpactComparison />
            </div>

            {/* Section 6: Editorial Showcase (Selected Work) */}
            <ProjectGrid onSelectProject={setActiveModalProject} />

            {/* Section 7: Five-Stage Working Process */}
            <Process />

            {/* Section 8: Start a Project (Project Enquiry Experience) */}
            <StartProject
              preselectedType={selectedProjectType}
              defaultIntent={projectIntent}
            />

            {/* Section 9: Digital Marketing Agency Collaboration */}
            <Collaboration onOpenContact={() => handleStartProject('agency')} />

            {/* Section 10: About Charles Naveen */}
            <About />

            {/* Section 11: Closing Screen / Form */}
            <Contact
              defaultIntent={contactIntent}
              preselectedType={selectedProjectType}
            />
          </div>
        )}

        {/* =========================================================================
            PAGE 2: SELECTED WORK (Route: /work)
            Dedicated portfolio showcase page
            ========================================================================= */}
        {currentRoute === '/work' && (
          <div className="page-view page-work">
            <PageHeader
              breadcrumb="SELECTED WORK"
              pageNumber="02 / 04"
              title="Selected Work & Demonstrations"
              description="A curated index of production client engineering and bespoke concept demonstrations. Engineered with custom React, modern typography, and responsive craftsmanship."
              onBackToHome={() => navigateTo('/')}
            />

            <div id="work">
              <ProjectGrid onSelectProject={setActiveModalProject} />
            </div>
          </div>
        )}

        {/* =========================================================================
            PAGE 3: SERVICES OVERVIEW (Route: /services)
            Dedicated services and methodology page
            ========================================================================= */}
        {currentRoute === '/services' && (
          <div className="page-view page-services">
            <PageHeader
              breadcrumb="SERVICES & CAPABILITIES"
              pageNumber="03 / 04"
              title="Practice Areas & Delivery Capabilities"
              description="Custom business websites, high-intent landing pages, e-commerce stores, mobile applications, and custom feature integrations engineered with clean React craftsmanship."
              onBackToHome={() => navigateTo('/')}
            />

            <div id="services">
              <Services
                onSelectServiceForContact={(serviceId) => handleStartProject(serviceId)}
                onNavigate={navigateTo}
              />
            </div>

            <div id="process">
              <Process />
            </div>

            <div className="services-overview-cta-strip">
              <div className="container">
                <div className="services-overview-cta-box">
                  <div className="overview-cta-copy">
                    <span className="closing-kicker">READY TO BEGIN?</span>
                    <h3 className="overview-cta-title">HAVE A SPECIFIC PROJECT IN MIND?</h3>
                    <p className="overview-cta-desc">
                      Tell me what you're building, your goals, and what you need. Let's discuss the right approach, features, and next steps for your business.
                    </p>
                  </div>
                  <div className="overview-cta-action">
                    <button
                      type="button"
                      className="btn-closing-primary"
                      onClick={() => handleStartProject('business')}
                    >
                      <span>START A PROJECT</span>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PAGES: DEDICATED SERVICE DETAIL PAGES
            Routes: /services/website-development, /services/landing-pages-redesign,
                    /services/ecommerce, /services/mobile-app-development,
                    /services/custom-integrations
            ========================================================================= */}
        {activeService && (
          <div className="page-view page-service-detail">
            <ServiceDetail
              service={activeService}
              onNavigate={navigateTo}
              onStartProject={handleStartProject}
              onSelectProject={setActiveModalProject}
            />
          </div>
        )}

        {/* =========================================================================
            PAGE 4: CONTACT & START A PROJECT (Route: /contact)
            Dedicated enquiry, estimator & contact page
            ========================================================================= */}
        {currentRoute === '/contact' && (
          <div className="page-view page-contact">
            <PageHeader
              breadcrumb="CONTACT & START A PROJECT"
              pageNumber="04 / 04"
              title="Start a Project or Send an Enquiry"
              description="Direct communication channels, interactive scope blueprint, and prompt developer turnaround for modern business websites and custom development."
              onBackToHome={() => navigateTo('/')}
            />

            <div id="start-project">
              <StartProject
                preselectedType={selectedProjectType}
                defaultIntent={projectIntent}
              />
            </div>

            <div id="contact">
              <Contact
                defaultIntent={contactIntent}
                preselectedType={selectedProjectType}
              />
            </div>
          </div>
        )}
      </main>

      {/* Primary Master Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Interactive Project Case Spec Modal */}
      {activeModalProject && (
        <ProjectModal
          project={activeModalProject}
          onClose={() => setActiveModalProject(null)}
        />
      )}
    </div>
  );
}
