import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Attempt to load local .env if running in Node runtime with native support
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }
} catch {
  // Silent catch: file does not exist (expected in production Vercel container)
}

// Default constants
const DEFAULT_SUPABASE_URL = 'https://eawlkwgsedswftjaqfaf.supabase.co';
const DEFAULT_TO_EMAIL = 'naveen.charles03@gmail.com';
const DEFAULT_FROM_EMAIL = 'Charles Portfolio <onboarding@resend.dev>';

/**
 * Strips surrounding quotes and whitespace from environment variable values
 */
export function sanitizeEnvValue(val) {
  if (typeof val !== 'string') return '';
  let cleaned = val.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

/**
 * Robustly retrieves environment variables handling:
 * - Direct lookup
 * - Fallback names (e.g. VITE_ prefix from Vite conventions)
 * - Trailing/leading whitespace in key names from dashboard copy-paste
 * - Case-insensitive match on Linux containers
 */
export function getEnvVar(primaryName, fallbackNames = []) {
  const candidates = [primaryName, ...fallbackNames];

  // 1. Direct match
  for (const name of candidates) {
    const val = process.env[name];
    if (typeof val === 'string' && val.trim().length > 0) {
      return sanitizeEnvValue(val);
    }
  }

  // 2. Trimmed key match or case-insensitive match from process.env keys
  const envKeys = Object.keys(process.env);
  for (const name of candidates) {
    const target = name.trim().toLowerCase();
    const matchedKey = envKeys.find((k) => k.trim().toLowerCase() === target);
    if (matchedKey) {
      const val = process.env[matchedKey];
      if (typeof val === 'string' && val.trim().length > 0) {
        return sanitizeEnvValue(val);
      }
    }
  }

  return undefined;
}

export function getResendApiKey() {
  return getEnvVar('RESEND_API_KEY', [
    'VITE_RESEND_API_KEY',
    'RESEND_KEY',
    'RESEND_TOKEN',
    'RESEND_SECRET'
  ]);
}

export function getNotificationToEmail() {
  return (
    getEnvVar('NOTIFICATION_TO_EMAIL', [
      'VITE_NOTIFICATION_TO_EMAIL',
      'TO_EMAIL',
      'NOTIFICATION_EMAIL'
    ]) || DEFAULT_TO_EMAIL
  );
}

export function getNotificationFromEmail() {
  return (
    getEnvVar('NOTIFICATION_FROM_EMAIL', [
      'VITE_NOTIFICATION_FROM_EMAIL',
      'FROM_EMAIL',
      'RESEND_FROM_EMAIL'
    ]) || DEFAULT_FROM_EMAIL
  );
}

export function getSupabaseCredentials() {
  const url =
    getEnvVar('SUPABASE_URL', ['VITE_SUPABASE_URL']) || DEFAULT_SUPABASE_URL;

  const key = getEnvVar('SUPABASE_SERVICE_ROLE_KEY', [
    'VITE_SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SERVICE_KEY',
    'SUPABASE_SECRET_KEY',
    'SUPABASE_KEY',
    'SUPABASE_ANON_KEY',
    'VITE_SUPABASE_ANON_KEY'
  ]);

  return { url, key };
}

/**
 * Returns safe diagnostic information that reveals key existence and metadata,
 * NEVER revealing secret values.
 */
export function getSafeResendDiagnostics() {
  const directKey = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
  const viteKey = Boolean(process.env.VITE_RESEND_API_KEY && process.env.VITE_RESEND_API_KEY.trim());
  const resolvedKey = getResendApiKey();
  const isResolved = Boolean(resolvedKey);

  const matchedEnvKeys = Object.keys(process.env)
    .filter((k) => /resend|email/i.test(k.trim()))
    .map((k) => {
      const val = process.env[k];
      return {
        keyName: k,
        length: typeof val === 'string' ? val.length : 0,
        hasQuotes:
          typeof val === 'string' &&
          ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      };
    });

  return {
    has_RESEND_API_KEY: directKey,
    has_VITE_RESEND_API_KEY: viteKey,
    is_resend_resolved: isResolved,
    detected_email_env_keys: matchedEnvKeys,
    vercel_env: process.env.VERCEL_ENV || 'not_set',
    node_env: process.env.NODE_ENV || 'not_set'
  };
}

/**
 * Generates plain-text representation of the enquiry for email clients
 */
function generateEmailText({ businessName, phone, email, createdAt }) {
  const lines = [
    `========================================`,
    `NEW BUSINESS ENQUIRY — CHARLES NAVEEN`,
    `========================================`,
    ``,
    `Business Name: ${businessName}`,
    `Phone Number:  ${phone}`
  ];

  if (email) {
    lines.push(`Email Address: ${email}`);
  }

  lines.push(`Submitted At:  ${createdAt || new Date().toISOString()}`);
  lines.push(``);
  lines.push(`----------------------------------------`);
  lines.push(`Direct WhatsApp: https://wa.me/${phone.replace(/[^0-9]/g, '')}`);
  if (email) {
    lines.push(`Direct Reply:    mailto:${email}`);
  }
  lines.push(`========================================`);

  return lines.join('\n');
}

/**
 * Generates modern, high-contrast HTML email template matching the portfolio design language
 */
function generateEmailHtml({ businessName, phone, email, createdAt }) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedTime = new Date(createdAt || Date.now()).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'UTC'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Business Enquiry from ${escapeHtml(businessName)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0E0F0D;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #F4F3EE;
    }
    .wrapper {
      max-width: 620px;
      margin: 30px auto;
      background: #141612;
      border: 1px solid #2B2F25;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background-color: #1A1D17;
      padding: 24px 32px;
      border-bottom: 2px solid #D8F33A;
    }
    .eyebrow {
      font-family: 'SF Mono', Consolas, Monaco, monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #D8F33A;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #F4F3EE;
      margin: 0;
    }
    .body-content {
      padding: 32px;
    }
    .field-grid {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .field-grid td {
      padding: 12px 0;
      border-bottom: 1px solid #252820;
      font-size: 14px;
      vertical-align: top;
    }
    .field-label {
      width: 35%;
      color: #8E9285;
      font-family: 'SF Mono', Consolas, Monaco, monospace;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .field-val {
      width: 65%;
      color: #F4F3EE;
      font-weight: 600;
    }
    .field-val a {
      color: #D8F33A;
      text-decoration: none;
    }
    .btn-row {
      margin-top: 24px;
      display: flex;
      gap: 12px;
    }
    .btn-primary {
      display: inline-block;
      background-color: #D8F33A;
      color: #0E0F0D !important;
      font-weight: 700;
      font-size: 13px;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 9999px;
      margin-right: 10px;
    }
    .btn-secondary {
      display: inline-block;
      background-color: #22261E;
      color: #F4F3EE !important;
      border: 1px solid #3A3F32;
      font-weight: 600;
      font-size: 13px;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 9999px;
    }
    .footer {
      padding: 20px 32px;
      background-color: #0E0F0D;
      border-top: 1px solid #2B2F25;
      font-family: 'SF Mono', Consolas, Monaco, monospace;
      font-size: 11px;
      color: #6C7063;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="eyebrow">PORTFOLIO BUSINESS ENQUIRY</div>
      <h1 class="title">New Enquiry from ${escapeHtml(businessName)}</h1>
    </div>
    <div class="body-content">
      <table class="field-grid">
        <tr>
          <td class="field-label">Business Name</td>
          <td class="field-val"><strong>${escapeHtml(businessName)}</strong></td>
        </tr>
        <tr>
          <td class="field-label">Phone Number</td>
          <td class="field-val"><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></td>
        </tr>
        ${email ? `
        <tr>
          <td class="field-label">Email Address</td>
          <td class="field-val"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
        </tr>` : ''}
        <tr>
          <td class="field-label">Submission Date</td>
          <td class="field-val">${formattedTime} UTC</td>
        </tr>
      </table>

      <div class="btn-row">
        ${cleanPhone ? `
        <a href="https://wa.me/${cleanPhone}" target="_blank" class="btn-primary">
          Message on WhatsApp ↗
        </a>` : ''}
        ${email ? `
        <a href="mailto:${escapeHtml(email)}?subject=${encodeURIComponent('Regarding your business enquiry — Charles Naveen')}" class="btn-secondary">
          Reply via Email →
        </a>` : ''}
      </div>
    </div>
    <div class="footer">
      Captured securely via Charles Naveen Portfolio · Supabase Database
    </div>
  </div>
</body>
</html>
  `.trim();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Primary Vercel Serverless Function Handler
 */
export default async function handler(req, res) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Preflight check
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Method check
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Only POST enquiries are accepted.'
    });
  }

  try {
    const payload = req.body || {};

    // 1. Honeypot Spam Protection
    // Hidden bot fields: if populated, silently accept without executing side effects
    if (payload.hp_company || payload._gotcha || payload.honeypot || payload.website_url_hp) {
      console.warn('[SPAM_BLOCKED] Honeypot field was filled. Dropping submission silently.');
      return res.status(200).json({
        success: true,
        message: 'Enquiry received successfully.'
      });
    }

    // 2. Sanitize & Validate Inputs
    // Form now uses Business Name (Required), Phone Number (Required), and Email (Optional)
    const businessName = (
      typeof payload.businessName === 'string' ? payload.businessName.trim() :
      typeof payload.business_name === 'string' ? payload.business_name.trim() :
      typeof payload.name === 'string' ? payload.name.trim() : ''
    );

    // Compatibility: populate name column with businessName if name is not explicitly passed
    const name = (typeof payload.name === 'string' && payload.name.trim().length > 0)
      ? payload.name.trim()
      : businessName;

    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const phone = typeof payload.phone === 'string' ? payload.phone.trim() : '';
    const source = typeof payload.source === 'string' && payload.source.trim().length > 0
      ? payload.source.trim()
      : 'portfolio-form';

    // 1. Business Name — Required
    if (!businessName || businessName.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid business name (at least 2 characters).'
      });
    }

    // 2. Phone Number — Required
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    if (!cleanPhone || !/^\+?[0-9]{7,18}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid mobile or WhatsApp number (7–18 digits).'
      });
    }

    // 3. Email Address — Optional (validate format ONLY when supplied)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    // 3. Supabase Integration
    const { url: supabaseUrl, key: supabaseKey } = getSupabaseCredentials();

    if (!supabaseKey && !req._supabaseClient) {
      console.error('[CONFIG_ERROR] SUPABASE_SERVICE_ROLE_KEY environment variable is missing.');
      return res.status(503).json({
        success: false,
        error: 'Backend integration pending: Missing Supabase service-role secret key. Please configure SUPABASE_SERVICE_ROLE_KEY in your Vercel project environment variables.'
      });
    }

    const supabase = req._supabaseClient || createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const enquiryRecord = {
      name,
      email: email || null,
      phone,
      business_name: businessName,
      project_type: typeof payload.projectType === 'string' ? payload.projectType.trim() || null : null,
      budget: typeof payload.budget === 'string' ? payload.budget.trim() || null : null,
      message: typeof payload.message === 'string' ? payload.message.trim() || null : null,
      source,
      status: 'new'
    };

    const { data: insertedData, error: dbError } = await supabase
      .from('enquiries')
      .insert([enquiryRecord])
      .select('id, created_at, name, email')
      .single();

    if (dbError) {
      console.error('[DATABASE_ERROR] Failed to insert enquiry into Supabase:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Unable to save enquiry right now. Please try again or reach out directly.'
      });
    }

    const enquiryId = insertedData?.id;
    const createdAt = insertedData?.created_at || new Date().toISOString();

    // 4. Resend Email Notification Integration
    let emailSent = false;
    let emailError = null;
    const resendApiKey = getResendApiKey();
    const resendDiagnostics = getSafeResendDiagnostics();

    // Safe Diagnostic Log (Never logs key values)
    console.log('[CONFIG_DIAGNOSTIC] Resend configuration check:', JSON.stringify(resendDiagnostics));

    if (resendApiKey || req._resendClient) {
      try {
        const resend = req._resendClient || new Resend(resendApiKey);
        const toEmail = getNotificationToEmail();
        const fromEmail = getNotificationFromEmail();

        console.log(`[EMAIL_DISPATCH] Attempting email notification to: ${toEmail} from: ${fromEmail}`);

        const emailPayload = {
          from: fromEmail,
          to: toEmail,
          subject: `New Business Enquiry: ${businessName}`,
          html: generateEmailHtml({
            businessName,
            phone,
            email: email || null,
            createdAt
          }),
          text: generateEmailText({
            businessName,
            phone,
            email: email || null,
            createdAt
          })
        };

        if (email) {
          emailPayload.replyTo = email;
        }

        const emailResult = await resend.emails.send(emailPayload);

        if (emailResult?.error) {
          console.error('[RESEND_ERROR] Resend returned an error:', emailResult.error);
          emailError = emailResult.error.message || 'Resend error';
        } else {
          emailSent = true;
          console.log('[NOTIFICATION_SUCCESS] Resend email dispatched for enquiry:', enquiryId, 'Email ID:', emailResult?.data?.id);
        }
      } catch (err) {
        console.error('[EMAIL_EXCEPTION] Failed to dispatch Resend notification:', err);
        emailError = err.message;
      }
    } else {
      console.warn('[CONFIG_NOTICE] RESEND_API_KEY not configured. Email notification skipped.', resendDiagnostics);
    }

    // 5. Successful Response
    return res.status(200).json({
      success: true,
      message: 'Enquiry successfully submitted and recorded.',
      enquiryId,
      emailSent
    });
  } catch (err) {
    console.error('[SERVER_ERROR] Unexpected error in enquiry handler:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred while processing your enquiry.'
    });
  }
}
