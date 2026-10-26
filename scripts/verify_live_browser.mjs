import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import handler from '../api/enquiry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2'
};

function createStaticServer(port = 4173) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    let pathname = decodeURIComponent(url.pathname);

    // Mock API endpoint for testing enquiry submissions
    if (pathname === '/api/enquiry' || pathname === '/api/contact') {
      if (req.method === 'POST') {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf-8');
        try {
          req.body = raw ? JSON.parse(raw) : {};
        } catch {
          req.body = {};
        }
      } else {
        req.body = {};
      }

      // Add express-like helpers for handler
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
      };

      // Mock DB & Resend for full end-to-end browser test
      if (process.env.TEST_MOCK_SUCCESS === 'true') {
        if (!req.body.businessName || req.body.businessName.length < 2) {
          return res.status(400).json({ success: false, error: 'Please provide a valid business name.' });
        }
        if (!req.body.phone || req.body.phone.length < 7) {
          return res.status(400).json({ success: false, error: 'Please provide a valid phone number.' });
        }
        return res.status(200).json({
          success: true,
          message: 'Enquiry successfully submitted and recorded.',
          enquiryId: 'mock-test-uuid-12345',
          emailSent: true
        });
      }

      await handler(req, res);
      return;
    }

    // Static file serving with cleanUrls support
    let filePath = path.join(distDir, pathname);

    // If directory or no extension, look for index.html or .html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (!fs.existsSync(filePath) && fs.existsSync(path.join(distDir, pathname, 'index.html'))) {
      filePath = path.join(distDir, pathname, 'index.html');
    } else if (!fs.existsSync(filePath)) {
      // SPA Fallback
      filePath = path.join(distDir, 'index.html');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`Static preview & test server listening on http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function main() {
  process.env.TEST_MOCK_SUCCESS = 'true';
  const server = await createStaticServer(4173);

  // Launch Chrome Headless
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=/tmp/chrome-test-profile-' + Date.now(),
    'about:blank'
  ]);

  // Wait for Chrome CDP port
  await new Promise((r) => setTimeout(r, 1200));

  try {
    const targetsRes = await fetch('http://127.0.0.1:9222/json');
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === 'page');

    if (!pageTarget) {
      throw new Error('No Chrome page target found');
    }

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) cb.reject(msg.error);
        else cb.resolve(msg.result);
      }
    };

    const send = (method, params = {}) => {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        callbacks.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    };

    await new Promise((r) => (ws.onopen = r));

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    const consoleErrors = [];
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        const text = msg.params.args.map((a) => a.value || a.description).join(' ');
        consoleErrors.push(text);
      }
    });

    console.log('\n--- 1. Testing Homepage (Desktop 1440x900) ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false
    });

    await send('Page.navigate', { url: 'http://localhost:4173/' });
    await new Promise((r) => setTimeout(r, 1500));

    // Check title and indexable content
    const titleVal = await send('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
    console.log('Homepage document.title:', titleVal.result.value);

    const hasStartProjectForm = await send('Runtime.evaluate', {
      expression: 'Boolean(document.querySelector("#enquiry-business") && document.querySelector("#enquiry-phone"))',
      returnByValue: true
    });
    console.log('Enquiry form rendered with business & phone fields:', hasStartProjectForm.result.value);

    const hasOldFields = await send('Runtime.evaluate', {
      expression: 'Boolean(document.querySelector("#enquiry-project-type") || document.querySelector("#enquiry-budget"))',
      returnByValue: true
    });
    console.log('Old fields (project type, budget) removed:', !hasOldFields.result.value);

    // Screenshot homepage
    fs.mkdirSync(path.resolve(rootDir, 'screenshots/audit-verification'), { recursive: true });
    const snapHome = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(rootDir, 'screenshots/audit-verification/desktop-home.png'), Buffer.from(snapHome.data, 'base64'));
    console.log('Saved screenshot: screenshots/audit-verification/desktop-home.png');

    console.log('\n--- 2. Testing Form Submission & Success State ---');
    // Fill out the simplified form
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const bizInput = document.querySelector("#enquiry-business");
          const phoneInput = document.querySelector("#enquiry-phone");
          const emailInput = document.querySelector("#enquiry-email");
          const form = document.querySelector(".enquiry-form-card form");

          const setVal = (el, val) => {
            if (!el) return;
            const proto = Object.getPrototypeOf(el);
            const set = Object.getOwnPropertyDescriptor(proto, 'value').set;
            set.call(el, val);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          };

          setVal(bizInput, "Apex Global Ventures");
          setVal(phoneInput, "9876543210");
          setVal(emailInput, "hello@apexglobal.com");
          if (form) form.requestSubmit();
        })()
      `
    });

    await new Promise((r) => setTimeout(r, 1200));

    // Verify success state copy
    const successTitle = await send('Runtime.evaluate', {
      expression: 'document.querySelector(".enquiry-success-title")?.textContent',
      returnByValue: true
    });
    const successText = await send('Runtime.evaluate', {
      expression: 'document.querySelector(".enquiry-success-text")?.textContent',
      returnByValue: true
    });

    console.log('Success title displayed:', `"${successTitle.result.value}"`);
    console.log('Success text displayed:', `"${successText.result.value}"`);
    console.assert(
      successTitle.result.value === 'Enquiry Submitted Successfully!',
      'Success title must match exact copy: Enquiry Submitted Successfully!'
    );
    console.assert(
      successText.result.value === "Thank you for reaching out. Your enquiry has been received, and I'll contact you soon.",
      'Success text must match exact copy!'
    );

    // Scroll to success box and screenshot
    await send('Runtime.evaluate', {
      expression: 'document.querySelector(".enquiry-form-card")?.scrollIntoView({ behavior: "instant", block: "center" })'
    });
    const snapSuccess = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(rootDir, 'screenshots/audit-verification/desktop-success-state.png'), Buffer.from(snapSuccess.data, 'base64'));
    console.log('Saved screenshot: screenshots/audit-verification/desktop-success-state.png');

    console.log('\n--- 3. Testing Work Page (/work) ---');
    await send('Page.navigate', { url: 'http://localhost:4173/work' });
    await new Promise((r) => setTimeout(r, 1000));
    const workTitle = await send('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
    console.log('Work page document.title:', workTitle.result.value);
    const snapWork = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(rootDir, 'screenshots/audit-verification/desktop-work.png'), Buffer.from(snapWork.data, 'base64'));

    console.log('\n--- 4. Testing Services Page (/services) ---');
    await send('Page.navigate', { url: 'http://localhost:4173/services' });
    await new Promise((r) => setTimeout(r, 1000));
    const servicesTitle = await send('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
    console.log('Services page document.title:', servicesTitle.result.value);

    console.log('\n--- 5. Testing Contact Page (/contact) ---');
    await send('Page.navigate', { url: 'http://localhost:4173/contact' });
    await new Promise((r) => setTimeout(r, 1000));
    const contactTitle = await send('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
    console.log('Contact page document.title:', contactTitle.result.value);

    console.log('\n--- 6. Testing Mobile Viewport (390x844) ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Page.navigate', { url: 'http://localhost:4173/contact' });
    await new Promise((r) => setTimeout(r, 1000));
    const snapMobile = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(rootDir, 'screenshots/audit-verification/mobile-contact.png'), Buffer.from(snapMobile.data, 'base64'));
    console.log('Saved mobile screenshot: screenshots/audit-verification/mobile-contact.png');

    console.log('\n--- Console Error Audit ---');
    if (consoleErrors.length === 0) {
      console.log('✓ PASS: Zero browser console errors detected across all tested routes and viewport sizes!');
    } else {
      console.warn('Console errors detected:', consoleErrors);
    }

    ws.close();
  } finally {
    chromeProc.kill();
    server.close();
  }
}

main().catch((err) => {
  console.error('Browser test failed:', err);
  process.exit(1);
});
