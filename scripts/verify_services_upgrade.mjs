import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { services, featuredProject, demoProjects, projectEnquiryData } from '../src/data/projects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('   PORTFOLIO SERVICES UPGRADE — QUALITY AUDIT       ');
console.log('====================================================\n');

let failed = false;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed = true;
  } else {
    console.log(`✓ PASS: ${message}`);
  }
}

// 1. Five Services Specification Check
console.log('[AUDIT 1] Final Service Categories & Data Integrity');
assert(services.length === 5, `Expected exactly 5 services, found ${services.length}`);

const expectedServices = [
  {
    num: '01',
    id: 'website-development',
    slug: '/services/website-development',
    title: 'Website Design & Development',
    heroHeadline: 'Your Business Deserves a Better Website.',
    heroCta: "LET'S DISCUSS YOUR WEBSITE",
    shortDesc: 'Professional websites that help businesses build trust, showcase their services, and generate enquiries.'
  },
  {
    num: '02',
    id: 'landing-pages-redesign',
    slug: '/services/landing-pages-redesign',
    title: 'Landing Pages & Website Redesign',
    heroHeadline: 'Make Every Visit Count.',
    heroCta: "LET'S IMPROVE YOUR WEBSITE",
    shortDesc: 'Focused landing pages and modern website redesigns that improve clarity, usability, and the customer experience.'
  },
  {
    num: '03',
    id: 'ecommerce',
    slug: '/services/ecommerce',
    title: 'E-commerce Website Development',
    heroHeadline: 'Take Your Business Online.',
    heroCta: "LET'S BUILD YOUR ONLINE STORE",
    shortDesc: 'Online stores designed to showcase products, simplify shopping, and help businesses sell online.'
  },
  {
    num: '04',
    id: 'mobile-app-development',
    slug: '/services/mobile-app-development',
    title: 'Mobile App Development',
    heroHeadline: "Have an App Idea? Let's Build It.",
    heroCta: "LET'S DISCUSS YOUR APP",
    shortDesc: 'User-focused mobile applications designed around your product idea, essential features, and business goals.'
  },
  {
    num: '05',
    id: 'custom-integrations',
    slug: '/services/custom-integrations',
    title: 'Custom Features & AI Integrations',
    heroHeadline: 'Make Your Website Work Smarter.',
    heroCta: "LET'S AUTOMATE YOUR WORKFLOW",
    shortDesc: 'Add useful website features, AI assistants, and business integrations that reduce manual work and improve customer interactions.'
  }
];

expectedServices.forEach((exp, idx) => {
  const actual = services[idx];
  assert(actual.number === exp.num, `Service ${idx + 1} number is ${actual.number} (expected ${exp.num})`);
  assert(actual.id === exp.id, `Service ${idx + 1} id is ${actual.id} (expected ${exp.id})`);
  assert(actual.slug === exp.slug, `Service ${idx + 1} slug is ${actual.slug} (expected ${exp.slug})`);
  assert(actual.title === exp.title, `Service ${idx + 1} title is "${actual.title}"`);
  assert(actual.shortDescription === exp.shortDesc, `Service ${idx + 1} short description matches requirement`);
  assert(actual.heroHeadline === exp.heroHeadline, `Service ${idx + 1} hero headline is "${actual.heroHeadline}"`);
  assert(actual.heroCta === exp.heroCta, `Service ${idx + 1} hero CTA is "${actual.heroCta}"`);
  assert(actual.capabilitiesAndDeliverables && actual.capabilitiesAndDeliverables.length >= 6, `Service ${idx + 1} deliverables count (${actual.capabilitiesAndDeliverables.length})`);
  assert(actual.problemAndSuitability && actual.problemAndSuitability.length >= 3, `Service ${idx + 1} problem/suitability count (${actual.problemAndSuitability.length})`);
  assert(actual.metaTitle && actual.metaTitle.includes(actual.title), `Service ${idx + 1} meta title configured`);
  assert(actual.metaDescription && actual.metaDescription.length > 50, `Service ${idx + 1} meta description configured`);
});

// 2. Unwanted Category Labels & Agency sections check
console.log('\n[AUDIT 2] Verification of Disallowed Labels & Elements');
const disallowRegex = /CORPORATE & SME|ONLINE COMMERCE|SMARTER WORKFLOWS/i;
services.forEach((s) => {
  assert(!disallowRegex.test(s.title), `Disallowed labels absent from title for ${s.title}`);
  assert(!s.tag, `No unnecessary tag pill on ${s.title}`);
});

// 3. Contact Form Preselection & Compatibility
console.log('\n[AUDIT 3] Contact Form Field Alignment');
const projectTypeValues = projectEnquiryData.projectTypes.map((t) => t.value);
services.forEach((s) => {
  assert(projectTypeValues.includes(s.id), `Contact form dropdown includes option for "${s.id}"`);
});

// 4. File existence & JSX component checks
console.log('\n[AUDIT 4] Codebase Components & Routing Integration');
const serviceDetailCode = fs.readFileSync(path.join(__dirname, '../src/components/ServiceDetail.jsx'), 'utf-8');
assert(serviceDetailCode.includes('service.heroHeadline'), 'ServiceDetail renders heroHeadline');
assert(serviceDetailCode.includes('service.heroCta'), 'ServiceDetail renders heroCta');
assert(serviceDetailCode.includes('service.capabilitiesAndDeliverables'), 'ServiceDetail renders capabilities and deliverables');
assert(serviceDetailCode.includes('service.problemAndSuitability'), 'ServiceDetail renders problems solved & suitability');
assert(serviceDetailCode.includes('service.closingHeadline'), 'ServiceDetail renders closing headline');
assert(serviceDetailCode.includes('onStartProject'), 'ServiceDetail connects CTA to existing onStartProject');

const appCode = fs.readFileSync(path.join(__dirname, '../src/App.jsx'), 'utf-8');
assert(appCode.includes('import ServiceDetail from \'./components/ServiceDetail\''), 'App.jsx imports ServiceDetail');
assert(appCode.includes('page-service-detail'), 'App.jsx renders page-service-detail route');
assert(appCode.includes('preselectedType={selectedProjectType}'), 'App.jsx passes preselectedType to Contact and StartProject');

const contactCode = fs.readFileSync(path.join(__dirname, '../src/components/Contact.jsx'), 'utf-8');
assert(contactCode.includes('preselectedType'), 'Contact.jsx supports preselectedType prop');

const servicesCompCode = fs.readFileSync(path.join(__dirname, '../src/components/Services.jsx'), 'utf-8');
assert(servicesCompCode.includes('LEARN MORE'), 'Services.jsx renders LEARN MORE button/link');
assert(servicesCompCode.includes('item.shortDescription'), 'Services.jsx displays concise short description');

console.log('\n====================================================');
if (failed) {
  console.error('❌ SOME AUDIT CHECKS FAILED');
  process.exit(1);
} else {
  console.log('✓ ALL AUDIT CHECKS PASSED PERFECTLY!');
  console.log('====================================================');
}
