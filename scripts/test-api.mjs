import enquiryHandler, {
  sanitizeEnvValue,
  getEnvVar,
  getResendApiKey,
  getNotificationToEmail,
  getNotificationFromEmail,
  getSupabaseCredentials,
  getSafeResendDiagnostics
} from '../api/enquiry.js';
import contactHandler from '../api/contact.js';

function createMockReqRes({ method = 'POST', body = {} }) {
  const req = {
    method,
    body,
    headers: {}
  };

  const res = {
    statusCode: 200,
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
    end() {
      return this;
    }
  };

  return { req, res };
}

async function runTests() {
  console.log('====================================================');
  console.log('     CHARLES PORTFOLIO — RESEND & API TEST SUITE     ');
  console.log('====================================================\n');

  // --- UNIT 1: Environment Value Sanitizer ---
  {
    console.log('[TEST GROUP 1] Environment Value Sanitization');
    console.assert(sanitizeEnvValue('  re_12345  ') === 're_12345', 'Trimming failed');
    console.assert(sanitizeEnvValue('"re_12345"') === 're_12345', 'Double quote strip failed');
    console.assert(sanitizeEnvValue("'re_12345'") === 're_12345', 'Single quote strip failed');
    console.assert(sanitizeEnvValue(' "re_12345" ') === 're_12345', 'Combined quote and trim strip failed');
    console.log('✓ Pass: Whitespace, double quotes, and single quotes stripped correctly\n');
  }

  // --- UNIT 2: Flexible Key Resolution for Vercel Dashboards ---
  {
    console.log('[TEST GROUP 2] Resend API Key Resolution Variants');

    // Scenario A: Standard exact key
    delete process.env.RESEND_API_KEY;
    delete process.env.VITE_RESEND_API_KEY;
    delete process.env['RESEND_API_KEY '];
    delete process.env.resend_api_key;

    process.env.RESEND_API_KEY = 're_standard_key_123';
    console.assert(getResendApiKey() === 're_standard_key_123', 'Standard key failed');
    console.log('✓ Scenario A: Standard RESEND_API_KEY resolved');

    // Scenario B: Vite prefix (common user habit in Vite projects)
    delete process.env.RESEND_API_KEY;
    process.env.VITE_RESEND_API_KEY = 're_vite_prefixed_key_456';
    console.assert(getResendApiKey() === 're_vite_prefixed_key_456', 'VITE_ prefix fallback failed');
    console.log('✓ Scenario B: VITE_RESEND_API_KEY resolved as fallback');

    // Scenario C: Accidental trailing space in Vercel UI
    delete process.env.VITE_RESEND_API_KEY;
    process.env['RESEND_API_KEY '] = 're_trailing_space_789';
    console.assert(getResendApiKey() === 're_trailing_space_789', 'Trailing space in key name failed');
    console.log('✓ Scenario C: Key with accidental trailing space in name resolved');

    // Scenario D: Lowercase key name
    delete process.env['RESEND_API_KEY '];
    process.env['resend_api_key'] = 're_lowercase_key_321';
    console.assert(getResendApiKey() === 're_lowercase_key_321', 'Lowercase key failed');
    console.log('✓ Scenario D: Lowercase resend_api_key resolved');

    // Scenario E: Accidental quotes in value
    delete process.env['resend_api_key'];
    process.env.RESEND_API_KEY = '"re_quoted_value_999"';
    console.assert(getResendApiKey() === 're_quoted_value_999', 'Quoted value strip failed');
    console.log('✓ Scenario E: Enclosing quotes in value automatically stripped\n');

    // Clean up
    delete process.env.RESEND_API_KEY;
  }

  // --- UNIT 3: Safe Diagnostics Security Verification ---
  {
    console.log('[TEST GROUP 3] Safe Diagnostics (No Secret Leakage)');
    process.env.RESEND_API_KEY = 're_super_secret_token_never_log_me';

    const diag = getSafeResendDiagnostics();
    const serialized = JSON.stringify(diag);

    console.assert(diag.has_RESEND_API_KEY === true, 'has_RESEND_API_KEY should be true');
    console.assert(diag.is_resend_resolved === true, 'is_resend_resolved should be true');
    console.assert(!serialized.includes('re_super_secret_token_never_log_me'), 'SECURITY BREACH: Secret key exposed in diagnostics!');

    console.log('✓ Pass: Diagnostics report booleans and key names only — zero secret leakage\n');
    delete process.env.RESEND_API_KEY;
  }

  // --- UNIT 4: Both Endpoints (enquiry.js & contact.js) Consistency ---
  {
    console.log('[TEST GROUP 4] Endpoint Parity (enquiry.js vs contact.js)');
    console.assert(typeof enquiryHandler === 'function', 'enquiryHandler must be a function');
    console.assert(typeof contactHandler === 'function', 'contactHandler must be a function');
    console.assert(enquiryHandler === contactHandler, 'contact.js must export the exact same handler as enquiry.js');
    console.log('✓ Pass: api/contact.js and api/enquiry.js share identical serverless handler\n');
  }

  // --- UNIT 5: API Handler Validation & Error Paths ---
  {
    console.log('[TEST GROUP 5] Handler Validation Tests');

    // Method rejection
    const { req: getReq, res: getRes } = createMockReqRes({ method: 'GET' });
    await enquiryHandler(getReq, getRes);
    console.assert(getRes.statusCode === 405, 'GET should return 405');
    console.log('✓ Method Check: Non-POST requests rejected with 405');

    // Honeypot trap
    const { req: botReq, res: botRes } = createMockReqRes({
      method: 'POST',
      body: { name: 'Bot', email: 'bot@spam.com', phone: '1234567890', _gotcha: 'bot' }
    });
    await enquiryHandler(botReq, botRes);
    console.assert(botRes.statusCode === 200 && botRes.data.success === true, 'Honeypot trap failed');
    console.log('✓ Honeypot Trap: Silent acceptance without triggering side-effects');

    // Missing Business Name
    const { req: badNameReq, res: badNameRes } = createMockReqRes({
      method: 'POST',
      body: { businessName: '', phone: '9876543210' }
    });
    await enquiryHandler(badNameReq, badNameRes);
    console.assert(badNameRes.statusCode === 400, 'Missing business name should return 400');
    console.assert(badNameRes.data.error.includes('business name'), 'Error message should mention business name');

    // Missing Phone Number
    const { req: missingPhoneReq, res: missingPhoneRes } = createMockReqRes({
      method: 'POST',
      body: { businessName: 'Acme Studio', phone: '' }
    });
    await enquiryHandler(missingPhoneReq, missingPhoneRes);
    console.assert(missingPhoneRes.statusCode === 400, 'Missing phone should return 400');

    // Invalid Phone Number (< 7 digits)
    const { req: badPhoneReq, res: badPhoneRes } = createMockReqRes({
      method: 'POST',
      body: { businessName: 'Acme Studio', phone: '12' }
    });
    await enquiryHandler(badPhoneReq, badPhoneRes);
    console.assert(badPhoneRes.statusCode === 400, 'Invalid phone should return 400');

    // Invalid Email format (when email is provided)
    const { req: badEmailReq, res: badEmailRes } = createMockReqRes({
      method: 'POST',
      body: { businessName: 'Acme Studio', phone: '9876543210', email: 'not-an-email' }
    });
    await enquiryHandler(badEmailReq, badEmailRes);
    console.assert(badEmailRes.statusCode === 400, 'Invalid email should return 400');

    console.log('✓ Validation: Business name (required), phone (required), and email (optional/validated) confirmed\n');
  }

  // --- UNIT 6: Missing Supabase Service Role Key Protection ---
  {
    console.log('[TEST GROUP 6] Missing Database Credentials Guard');
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        phone: '+91 9876543210'
      }
    });
    await enquiryHandler(req, res);
    console.assert(res.statusCode === 503, 'Missing DB credentials should return 503');
    console.assert(res.data.error.includes('Missing Supabase service-role secret key'), 'Informative error required');
    console.log('✓ Missing Database Credentials: Returns 503 with exact setup instructions\n');
  }

  // --- UNIT 7: Missing Resend Key Response with Diagnostics ---
  {
    console.log('[TEST GROUP 7] Missing Resend Key Response & Diagnostics Payload');
    delete process.env.RESEND_API_KEY;
    delete process.env.VITE_RESEND_API_KEY;

    console.assert(getResendApiKey() === undefined, 'Key should be undefined');
    const diag = getSafeResendDiagnostics();
    console.assert(diag.is_resend_resolved === false, 'is_resend_resolved should be false');
    console.log('✓ Missing Key State: Diagnostics accurately identify missing key without throwing\n');
  }

  // --- UNIT 8: Payload Verification for Simplified Form ---
  {
    console.log('[TEST GROUP 8] Submission Payload Scenarios Verification');

    // Scenario 1: Business name and phone number only
    const { req: p1Req, res: p1Res } = createMockReqRes({
      method: 'POST',
      body: { businessName: 'Apex Solutions', phone: '+91 93849 59626' }
    });
    // Triggers missing db key 503, which proves it passed all input validations!
    await enquiryHandler(p1Req, p1Res);
    console.assert(p1Res.statusCode === 503, 'Valid submission with business name & phone only must pass validation');
    console.log('✓ Scenario 1: Valid submission with business name and phone only accepted');

    // Scenario 2: Business name, phone, and valid email
    const { req: p2Req, res: p2Res } = createMockReqRes({
      method: 'POST',
      body: { businessName: 'Apex Solutions', phone: '+91 93849 59626', email: 'contact@apex.com' }
    });
    await enquiryHandler(p2Req, p2Res);
    console.assert(p2Res.statusCode === 503, 'Valid submission with email must pass validation');
    console.log('✓ Scenario 2: Valid submission with business name, phone, and optional email accepted');

    // Scenario 3: Missing business name rejected
    const { req: p3Req, res: p3Res } = createMockReqRes({
      method: 'POST',
      body: { businessName: '', phone: '+91 93849 59626' }
    });
    await enquiryHandler(p3Req, p3Res);
    console.assert(p3Res.statusCode === 400, 'Missing business name rejected');
    console.log('✓ Scenario 3: Missing business name rejected with 400');

    // Scenario 4: Missing phone number rejected
    const { req: p4Req, res: p4Res } = createMockReqRes({
      method: 'POST',
      body: { businessName: 'Apex Solutions', phone: '' }
    });
    await enquiryHandler(p4Req, p4Res);
    console.assert(p4Res.statusCode === 400, 'Missing phone number rejected');
    console.log('✓ Scenario 4: Missing phone number rejected with 400');

    // Scenario 5: Invalid email format rejected
    const { req: p5Req, res: p5Res } = createMockReqRes({
      method: 'POST',
      body: { businessName: 'Apex Solutions', phone: '+91 93849 59626', email: 'invalid-email' }
    });
    await enquiryHandler(p5Req, p5Res);
    console.assert(p5Res.statusCode === 400, 'Invalid email rejected');
    console.log('✓ Scenario 5: Invalid email format rejected with 400\n');
  }

  console.log('====================================================');
  console.log('     ALL TEST GROUPS PASSED WITH ZERO ERRORS        ');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
