-- ==============================================================================
-- Supabase Schema for Charles Naveen Portfolio Contact & Project Enquiries
-- Project ID: eawlkwgsedswftjaqfaf
-- ==============================================================================

-- 1. Create the enquiries table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_name TEXT,
  project_type TEXT,
  budget TEXT,
  message TEXT,
  source TEXT DEFAULT 'portfolio-form',
  status TEXT NOT NULL DEFAULT 'new'
);

-- 2. Create indexes for quick lookup & filtering in dashboard
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_email ON public.enquiries(email);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- 4. RLS Security Policies:
-- Service role key (used by backend serverless API) automatically bypasses RLS.
-- Allow authenticated users (e.g. Supabase dashboard users) full access:
CREATE POLICY "Allow authenticated full access"
  ON public.enquiries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow public inserts via anon key if configured as fallback:
CREATE POLICY "Allow public insert"
  ON public.enquiries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Notice: No SELECT policy is created for anon, ensuring client visitors can NEVER read enquiries!

COMMENT ON TABLE public.enquiries IS 'Client contact & project enquiries captured from Charles Naveen portfolio';
