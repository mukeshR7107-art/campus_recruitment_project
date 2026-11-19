BEGIN;
DO $test$
DECLARE
 s uuid := gen_random_uuid(); other_s uuid := gen_random_uuid(); r uuid := gen_random_uuid(); other_r uuid := gen_random_uuid(); admin_attempt uuid := gen_random_uuid();
 job bigint; closed_job bigint; app bigint; n integer;
BEGIN
 INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES
 (s,'crs-test-'||s||'@example.invalid','{"role":"STUDENT"}'),
 (other_s,'crs-test-'||other_s||'@example.invalid','{"role":"STUDENT"}'),
 (r,'crs-test-'||r||'@example.invalid','{"role":"RECRUITER"}'),
 (other_r,'crs-test-'||other_r||'@example.invalid','{"role":"RECRUITER"}'),
 (admin_attempt,'crs-test-'||admin_attempt||'@example.invalid','{"role":"ADMIN"}');
 IF (SELECT role FROM public.profiles WHERE id=admin_attempt) <> 'STUDENT' THEN RAISE EXCEPTION 'FAIL: admin signup'; END IF;
 INSERT INTO public.student_profiles(user_id,full_name) VALUES (s,'Test Candidate'),(other_s,'Unrelated Candidate');
 INSERT INTO public.jobs(recruiter_id,title,status) VALUES(r,'Temporary policy verification','OPEN') RETURNING id INTO job;
 INSERT INTO public.jobs(recruiter_id,title,status) VALUES(r,'Temporary closed verification','CLOSED') RETURNING id INTO closed_job;
 INSERT INTO storage.objects(bucket_id,name) VALUES('resumes',s||'/test.pdf');
 PERFORM set_config('request.jwt.claim.sub',s::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 UPDATE public.profiles SET role='ADMIN' WHERE id=s;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>0 THEN RAISE EXCEPTION 'FAIL: self promotion'; END IF;
 INSERT INTO public.applications(student_id,job_id,resume_path,status) VALUES(s,job,'https://nrfsazthoxmigjzwyxpf.supabase.co/storage/v1/object/public/resumes/'||s||'/test.pdf','APPLIED') RETURNING id INTO app;
 BEGIN
  INSERT INTO public.applications(student_id,job_id,status) VALUES(s,closed_job,'APPLIED');
  RAISE EXCEPTION 'FAIL: closed job accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 UPDATE public.applications SET status='HIRED' WHERE id=app;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>0 THEN RAISE EXCEPTION 'FAIL: self hire'; END IF;
 IF (SELECT count(*) FROM storage.objects WHERE bucket_id='resumes' AND name=s||'/test.pdf')<>1 THEN RAISE EXCEPTION 'FAIL: own resume'; END IF;
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub',other_r::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 IF EXISTS(SELECT 1 FROM public.student_profiles WHERE user_id=s) THEN RAISE EXCEPTION 'FAIL: unrelated student exposed'; END IF;
 IF EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='resumes' AND name=s||'/test.pdf') THEN RAISE EXCEPTION 'FAIL: unrelated resume exposed'; END IF;
 BEGIN
  INSERT INTO public.feedback(from_user_id,to_entity_id,type,content) VALUES(other_r,app,'APPLICATION','Test feedback');
  RAISE EXCEPTION 'FAIL: unrelated feedback accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub',r::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 IF (SELECT count(*) FROM public.student_profiles WHERE user_id=s)<>1 THEN RAISE EXCEPTION 'FAIL: own applicant inaccessible'; END IF;
 IF EXISTS(SELECT 1 FROM public.student_profiles WHERE user_id=other_s) THEN RAISE EXCEPTION 'FAIL: unsubmitted profile exposed'; END IF;
 IF (SELECT count(*) FROM storage.objects WHERE bucket_id='resumes' AND name=s||'/test.pdf')<>1 THEN RAISE EXCEPTION 'FAIL: submitted resume inaccessible'; END IF;
 UPDATE public.applications SET status='REVIEWED' WHERE id=app;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'FAIL: recruiter status change'; END IF;
 INSERT INTO public.feedback(from_user_id,to_entity_id,type,content) VALUES(r,app,'APPLICATION','Test feedback');
 BEGIN
  UPDATE public.applications SET cover_letter='tampered' WHERE id=app;
  RAISE EXCEPTION 'FAIL: submission editable';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'Submitted application details are immutable' THEN RAISE; END IF;
 END;
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub',s::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 IF NOT EXISTS(SELECT 1 FROM public.feedback WHERE to_entity_id=app) THEN RAISE EXCEPTION 'FAIL: student cannot read feedback'; END IF;
 EXECUTE 'RESET ROLE';
END;
$test$;
SELECT 'PASS: signup role, self-promotion, open/closed jobs, self-hire, student isolation, resume isolation, recruiter status, immutable submission, feedback ownership and visibility' AS verification;
ROLLBACK;
