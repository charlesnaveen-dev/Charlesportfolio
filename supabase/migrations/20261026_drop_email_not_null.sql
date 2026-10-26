-- ==============================================================================
-- Migration: Make email column nullable for simplified 3-field enquiry form
-- Date: 2026-10-26
-- ==============================================================================

ALTER TABLE public.enquiries ALTER COLUMN email DROP NOT NULL;
