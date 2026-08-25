-- Migration: Fix Jobs & Recruiter Profiles RLS & Relationships
-- Ensures that students can query open jobs and recruiter branding without any schema errors.

-- 1. Ensure helper functions exist
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'ADMIN'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2. Drop and recreate jobs SELECT policy to prevent any subquery recursion
DROP POLICY IF EXISTS "Anyone authenticated can read open jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public and authenticated can read open jobs" ON public.jobs;

CREATE POLICY "Anyone authenticated can read open jobs"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (
    status = 'OPEN' 
    OR recruiter_id = auth.uid() 
    OR public.is_admin()
  );

-- 3. Ensure recruiter_profiles can be read by all authenticated users (students & recruiters)
DROP POLICY IF EXISTS "Students and admins can read recruiter profiles" ON public.recruiter_profiles;
DROP POLICY IF EXISTS "Recruiters can read own profile" ON public.recruiter_profiles;
DROP POLICY IF EXISTS "Authenticated can read recruiter profiles" ON public.recruiter_profiles;

CREATE POLICY "Authenticated can read recruiter profiles"
  ON public.recruiter_profiles FOR SELECT
  TO authenticated
  USING (true);

-- 4. Re-verify job status default and indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status_created ON public.jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON public.jobs(recruiter_id);
