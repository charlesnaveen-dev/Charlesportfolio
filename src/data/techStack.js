/**
 * Technical Stack Configuration
 * 
 * Organized into four core disciplines for Charles Naveen's portfolio.
 * Modify, add, or remove technologies as your stack evolves.
 */

export const technicalStackData = {
  eyebrow: 'ENGINEERING TOOLKIT',
  title: 'TECHNICAL STACK',
  subtitle: 'A disciplined, production-grade toolkit spanning responsive frontend interfaces, reliable backend services, structured relational databases, and automated deployment workflows.',
  categories: [
    {
      id: 'frontend',
      number: '01',
      title: 'Frontend Development',
      description: 'Component architecture, semantic accessibility, reactive state, and modern bundling.',
      technologies: [
        {
          name: 'HTML5',
          role: 'Semantic Structure & SEO',
          icon: '/images/tech/html5.svg',
          tag: 'Markup'
        },
        {
          name: 'CSS3',
          role: 'Layouts & Responsive Systems',
          icon: '/images/tech/css3.svg',
          tag: 'Styling'
        },
        {
          name: 'JavaScript',
          role: 'ES6+ Logic & Async DOM',
          icon: '/images/tech/javascript.svg',
          tag: 'Core Language'
        },
        {
          name: 'React',
          role: 'Component Architecture & Hooks',
          icon: '/images/tech/react.svg',
          tag: 'UI Library'
        },
        {
          name: 'Vite',
          role: 'Fast HMR & Production Bundler',
          icon: '/images/tech/vite.svg',
          tag: 'Build Tool'
        }
      ]
    },
    {
      id: 'backend',
      number: '02',
      title: 'Backend Development',
      description: 'RESTful API services, server-side business logic, routing, and scalable endpoints.',
      technologies: [
        {
          name: 'Python',
          role: 'Data Logic & Automation',
          icon: '/images/tech/python.svg',
          tag: 'Language'
        },
        {
          name: 'Flask',
          role: 'Lightweight REST Services',
          icon: '/images/tech/flask.svg',
          tag: 'Framework'
        },
        {
          name: 'Node.js',
          role: 'Server Runtime & Asynchronous I/O',
          icon: '/images/tech/nodejs.svg',
          tag: 'Runtime'
        },
        {
          name: 'Express.js',
          role: 'API Routing & Middleware',
          icon: '/images/tech/express.svg',
          tag: 'Framework'
        },
        {
          name: 'Java',
          role: 'Object-Oriented Architecture',
          icon: '/images/tech/java.svg',
          tag: 'Language'
        }
      ]
    },
    {
      id: 'database',
      number: '03',
      title: 'Database & Data',
      description: 'Structured relational data modeling, query integrity, and realtime cloud databases.',
      technologies: [
        {
          name: 'MySQL',
          role: 'Relational Schemas & SQL Queries',
          icon: '/images/tech/mysql.svg',
          tag: 'RDBMS'
        },
        {
          name: 'Supabase',
          role: 'Postgres Engine & Row-Level Security',
          icon: '/images/tech/supabase.svg',
          tag: 'BaaS / DB'
        }
      ]
    },
    {
      id: 'tools',
      number: '04',
      title: 'Tools & Platforms',
      description: 'Version control workflows, cloud continuous deployment, and development environments.',
      technologies: [
        {
          name: 'Git',
          role: 'Version Control & Branching',
          icon: '/images/tech/git.svg',
          tag: 'VCS'
        },
        {
          name: 'GitHub',
          role: 'Repository Host & Collaboration',
          icon: '/images/tech/github.svg',
          tag: 'Platform'
        },
        {
          name: 'Vercel',
          role: 'Edge Cloud & Production Hosting',
          icon: '/images/tech/vercel.svg',
          tag: 'Cloud Platform'
        },
        {
          name: 'VS Code',
          role: 'Primary Development Environment',
          icon: '/images/tech/vscode.svg',
          tag: 'Editor'
        }
      ]
    }
  ]
};
