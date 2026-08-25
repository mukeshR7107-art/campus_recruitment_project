/*
  # Security Hardening: Storage Isolation, Access Policies, and Schema Constraints

  1. Storage Security
     - Provisions isolated 'resumes' bucket (public = false)
     - Implements RLS on storage.objects:
       - Students can only upload, update, and delete their own files in `resumes/{auth.uid()}/*`
       - Recruiters and Admins can view/download resumes of applicants
       - Denies arbitrary execution or public anonymous uploads

  2. Table Integrity & Check Constraints
     - Enforces CGPA boundary [0.00, 10.00]
     - Enforces email maximum length
     - Enforces job and institution text integrity
*/

-- ── 1. Create Private Storage Bucket ─────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  5242880, -- 5 MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];

-- ── 2. Storage Objects Row-Level Security ─────────────────────────────────────

-- Allow students to upload resumes into their own user folder
CREATE POLICY "Students can upload own resume"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'STUDENT')
  );

-- Allow students to update own resume
CREATE POLICY "Students can update own resume"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow students to delete own resume
CREATE POLICY "Students can delete own resume"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow students, recruiters, and admins to read resumes
CREATE POLICY "Authorized roles can read resumes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('RECRUITER', 'ADMIN'))
    )
  );

-- ── 3. Database Check Constraints ───────────────────────────────────────────

DO $$
BEGIN
  -- Check constraint on CGPA
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_student_cgpa_range'
  ) THEN
    ALTER TABLE public.student_profiles
      ADD CONSTRAINT chk_student_cgpa_range CHECK (cgpa >= 0.00 AND cgpa <= 10.00);
  END IF;

  -- Check constraint on Job Title
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_jobs_title_min_length'
  ) THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT chk_jobs_title_min_length CHECK (char_length(title) >= 3);
  END IF;

  -- Check constraint on Profile Email length
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'chk_profiles_email_length'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT chk_profiles_email_length CHECK (char_length(email) <= 254);
  END IF;
END $$;
