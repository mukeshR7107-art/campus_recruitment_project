BEGIN;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, CASE WHEN NEW.raw_user_meta_data->>'role' = 'RECRUITER'
    THEN 'RECRUITER'::public.user_role ELSE 'STUDENT'::public.user_role END);
  RETURN NEW;
END;
$$;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Students can update own applications" ON public.applications;
DROP POLICY IF EXISTS "Students can insert own applications" ON public.applications;
CREATE POLICY "Students can insert own applications" ON public.applications FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid() AND status = 'APPLIED'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'STUDENT')
  AND EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND status = 'OPEN'));
CREATE OR REPLACE FUNCTION public.guard_application_submission()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.student_id IS DISTINCT FROM OLD.student_id OR NEW.job_id IS DISTINCT FROM OLD.job_id
    OR NEW.resume_path IS DISTINCT FROM OLD.resume_path OR NEW.cover_letter IS DISTINCT FROM OLD.cover_letter
    OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
    RAISE EXCEPTION 'Submitted application details are immutable';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_application_submission BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.guard_application_submission();
DROP POLICY IF EXISTS "Recruiters can read student profiles" ON public.student_profiles;
CREATE POLICY "Recruiters can read student profiles" ON public.student_profiles FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.applications a JOIN public.jobs j ON j.id = a.job_id
  WHERE a.student_id = student_profiles.user_id AND j.recruiter_id = auth.uid()));
DROP POLICY IF EXISTS "Authorized roles can read resumes" ON storage.objects;
CREATE POLICY "Authorized roles can read resumes" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'resumes' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()
  OR EXISTS (SELECT 1 FROM public.applications a JOIN public.jobs j ON j.id = a.job_id
    WHERE j.recruiter_id = auth.uid() AND a.student_id::text = (storage.foldername(name))[1]
    AND (a.resume_path = name OR right(a.resume_path, length('/storage/v1/object/public/resumes/' || name)) = '/storage/v1/object/public/resumes/' || name))));
DROP POLICY IF EXISTS "Recruiters can insert feedback" ON public.feedback;
CREATE POLICY "Recruiters can insert feedback" ON public.feedback FOR INSERT TO authenticated
WITH CHECK (from_user_id = auth.uid() AND (public.is_admin() OR
  (type = 'APPLICATION' AND EXISTS (SELECT 1 FROM public.applications a JOIN public.jobs j ON j.id = a.job_id
    WHERE a.id = to_entity_id AND j.recruiter_id = auth.uid()))));
DROP POLICY IF EXISTS "Authors can update own feedback" ON public.feedback;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
COMMIT;
