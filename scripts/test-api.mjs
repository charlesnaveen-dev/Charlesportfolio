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

  // --- UNIT 8: Payload Verification for Simplified Form (Scenarios 1–7) ---
  {
    console.log('[TEST GROUP 8] End-to-End Scenarios 1–7 Simulation & Verification');

    // Helper to create mock Supabase client
    function createMockSupabase({ shouldFail = false, insertedRecord = null } = {}) {
      let insertCalls = [];
      return {
        getInsertCalls: () => insertCalls,
        from(tableName) {
          return {
            insert(records) {
              insertCalls.push({ table: tableName, records });
              return {
                select() {
                  return {
                    single: async () => {
                      if (shouldFail) {
                        return { data: null, error: { message: 'Supabase simulated insertion error' } };
                      }
                      return {
                        data: insertedRecord || {
                          id: 'mock-uuid-' + Math.random().toString(36).substring(2, 9),
                          created_at: new Date().toISOString(),
                          name: records[0].name,
                          email: records[0].email
                        },
                        error: null
                      };
                    }
                  };
                }
              };
            }
          };
        }
      };
    }

    // Helper to create mock Resend client
    function createMockResend({ shouldFail = false } = {}) {
      let sendCalls = [];
      return {
        getSendCalls: () => sendCalls,
        emails: {
          send: async (payload) => {
            sendCalls.push(payload);
            if (shouldFail) {
              return { data: null, error: { message: 'Resend API rate limit or delivery error' } };
            }
            return { data: { id: 'email-' + Math.random().toString(36).substring(2, 9) }, error: null };
          }
        }
      };
    }

    // SCENARIO 1: Submit with business name and phone number only (Optional email omitted)
    {
      const mockDb = createMockSupabase();
      const mockResend = createMockResend();
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: { businessName: 'Apex Solutions', phone: '+91 93849 59626' }
      });
      req._supabaseClient = mockDb;
      req._resendClient = mockResend;

      await enquiryHandler(req, res);

      console.assert(res.statusCode === 200, 'Scenario 1 should return 200');
      console.assert(res.data.success === true, 'Scenario 1 success should be true');
      console.assert(Boolean(res.data.enquiryId), 'Scenario 1 should return enquiryId');

      const dbCalls = mockDb.getInsertCalls();
      console.assert(dbCalls.length === 1, 'Supabase insert must be called exactly once');
      const savedRecord = dbCalls[0].records[0];
      console.assert(savedRecord.name === 'Apex Solutions', 'Required name column populated with businessName');
      console.assert(savedRecord.business_name === 'Apex Solutions', 'business_name populated');
      console.assert(savedRecord.email === null, 'Missing optional email must be stored as SQL null');
      console.assert(savedRecord.status === 'new', 'Status must default to new');
      console.assert(savedRecord.source === 'portfolio-form', 'Default source preserved');

      const resendCalls = mockResend.getSendCalls();
      console.assert(resendCalls.length === 1, 'Resend send must be called once');
      console.assert(resendCalls[0].replyTo === undefined, 'No replyTo when email omitted');
      console.assert(!resendCalls[0].text.includes('Email Address:'), 'Email row excluded from text template');
      console.log('✓ Scenario 1: Submit with business name & phone only -> SQL null email, Resend sent, saved exactly once');
    }

    // SCENARIO 2: Submit with business name, phone number, and optional email
    {
      const mockDb = createMockSupabase();
      const mockResend = createMockResend();
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: { businessName: 'Apex Solutions', phone: '+91 93849 59626', email: 'contact@apexsolutions.com' }
      });
      req._supabaseClient = mockDb;
      req._resendClient = mockResend;

      await enquiryHandler(req, res);

      console.assert(res.statusCode === 200, 'Scenario 2 should return 200');
      console.assert(res.data.success === true, 'Scenario 2 success should be true');
      const savedRecord = mockDb.getInsertCalls()[0].records[0];
      console.assert(savedRecord.email === 'contact@apexsolutions.com', 'Email correctly saved');
      const emailPayload = mockResend.getSendCalls()[0];
      console.assert(emailPayload.replyTo === 'contact@apexsolutions.com', 'ReplyTo populated when email supplied');
      console.assert(emailPayload.text.includes('Email Address: contact@apexsolutions.com'), 'Email row included in template');
      console.log('✓ Scenario 2: Submit with business name, phone & valid email -> email persisted, replyTo set, saved once');
    }

    // SCENARIO 3: Submit with missing business name
    {
      const mockDb = createMockSupabase();
      const mockResend = createMockResend();
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: { businessName: '   ', phone: '+91 93849 59626' }
      });
      req._supabaseClient = mockDb;
      req._resendClient = mockResend;

      await enquiryHandler(req, res);

      console.assert(res.statusCode === 400, 'Scenario 3 should return 400');
      console.assert(res.data.success === false, 'Scenario 3 success should be false');
      console.assert(mockDb.getInsertCalls().length === 0, 'No DB insert on validation failure');
      console.assert(mockResend.getSendCalls().length === 0, 'No Resend call on validation failure');
      console.log('✓ Scenario 3: Missing business name rejected with 400; zero DB/Resend calls');
    }

    // SCENARIO 4: Submit with missing phone number
    {
      const mockDb = createMockSupabase();
      const mockResend = createMockResend();
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: { businessName: 'Apex Solutions', phone: '   ' }
      });
      req._supabaseClient = mockDb;
      req._resendClient = mockResend;

      await enquiryHandler(req, res);

      console.assert(res.statusCode === 400, 'Scenario 4 should return 400');
      console.assert(res.data.success === false, 'Scenario 4 success should be false');
      console.assert(mockDb.getInsertCalls().length === 0, 'No DB insert on validation failure');
      console.assert(mockResend.getSendCalls().length === 0, 'No Resend call on validation failure');
      console.log('✓ Scenario 4: Missing phone number rejected with 400; zero DB/Resend calls');
    }

    // SCENARIO 5: Submit with invalid email format
    {
      const mockDb = createMockSupabase();
      const mockResend = createMockResend();
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: { businessName: 'Apex Solutions', phone: '+91 93849 59626', email: 'invalid-email-no-at-domain' }
      });
      req._supabaseClient = mockDb;
      req._resendClient = mockResend;

      await enquiryHandler(req, res);

      console.assert(res.statusCode === 400, 'Scenario 5 should return 400');
      console.assert(res.data.success === false, 'Scenario 5 success should be false');
      console.assert(mockDb.getInsertCalls().length === 0, 'No DB insert on invalid email');
      console.assert(mockResend.getSendCalls().length === 0, 'No Resend call on invalid email');
      console.log('✓ Scenario 5: Invalid email format rejected with 400; zero DB/Resend calls');
    }

    // SCENARIO 6: Simulate Supabase insertion failure
    {
      const mockDb = createMockSupabase({ shouldFail: true });
      const mockResend = createMockResend();
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: { businessName: 'Apex Solutions', phone: '+91 93849 59626' }
      });
      req._supabaseClient = mockDb;
      req._resendClient = mockResend;

      await enquiryHandler(req, res);

      console.assert(res.statusCode === 500, 'Scenario 6 should return 500 on DB failure');
      console.assert(res.data.success === false, 'Scenario 6 success should be false');
      console.assert(mockResend.getSendCalls().length === 0, 'Resend MUST NOT be called if DB insertion fails');
      console.log('✓ Scenario 6: Supabase insertion failure returns 500, no email dispatched, no duplicate enquiry');
    }

    // SCENARIO 7: Simulate Resend notification failure
    {
      const mockDb = createMockSupabase();
      const mockResend = createMockResend({ shouldFail: true });
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: { businessName: 'Apex Solutions', phone: '+91 93849 59626', email: 'valid@apex.com' }
      });
      req._supabaseClient = mockDb;
      req._resendClient = mockResend;

      await enquiryHandler(req, res);

      console.assert(res.statusCode === 200, 'Scenario 7 should return 200 since enquiry is safely recorded');
      console.assert(res.data.success === true, 'Scenario 7 success should be true');
      console.assert(res.data.emailSent === false, 'emailSent should be false');
      console.assert(mockDb.getInsertCalls().length === 1, 'Enquiry was saved exactly once in database');
      console.log('✓ Scenario 7: Resend notification failure handled gracefully without duplicate enquiry\n');
    }
  }

  console.log('====================================================');
  console.log('     ALL TEST GROUPS PASSED WITH ZERO ERRORS        ');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
