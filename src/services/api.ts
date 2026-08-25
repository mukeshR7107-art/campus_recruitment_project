import { supabase } from '../lib/supabase';
import type {
  StudentProfile, RecruiterProfile, Job,
  ApplicationStatus, JobStatus, UserRole
} from '../lib/supabase';
import { RateLimiter } from '../lib/security/rateLimiter';
import {
  validateStudentProfileInput,
  validateRecruiterProfileInput,
  validateJobInput,
  validateApplicationInput,
  validateFeedbackInput,
  validateInstitutionInput,
  validateDepartmentInput,
  validateRole,
} from '../lib/security/validation';
import { sanitizeError } from '../lib/security/errorHandler';
import { validateFileUpload } from '../lib/security/fileUploadSecurity';
import { SECURITY_CONFIG } from '../lib/security/securityConfig';
import { logger } from '../lib/security/logger';

// ── Student Profile ──────────────────────────────────────────────────────────

export async function getStudentProfile(userId: string) {
  const rl = RateLimiter.checkAuthenticatedAction(userId);
  if (!rl.allowed) return { data: null, error: { message: rl.message } };

  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*, departments(*, institutions(*))')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function upsertStudentProfile(data: Partial<StudentProfile> & { user_id: string }) {
  const rl = RateLimiter.checkAuthenticatedAction(data.user_id);
  if (!rl.allowed) return { data: null, error: { message: rl.message } };

  const validation = validateStudentProfileInput(data);
  if (!validation.isValid) {
    return { data: null, error: { message: validation.error } };
  }

  try {
    const payload = {
      ...validation.sanitizedValue,
      user_id: data.user_id,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from('student_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .maybeSingle();

    if (error) throw error;
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

// ── Recruiter Profile ────────────────────────────────────────────────────────

export async function getRecruiterProfile(userId: string) {
  const rl = RateLimiter.checkAuthenticatedAction(userId);
  if (!rl.allowed) return { data: null, error: { message: rl.message } };

  try {
    const { data, error } = await supabase
      .from('recruiter_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function upsertRecruiterProfile(data: Partial<RecruiterProfile> & { user_id: string }) {
  const rl = RateLimiter.checkAuthenticatedAction(data.user_id);
  if (!rl.allowed) return { data: null, error: { message: rl.message } };

  const validation = validateRecruiterProfileInput(data);
  if (!validation.isValid) {
    return { data: null, error: { message: validation.error } };
  }

  try {
    const payload = {
      ...validation.sanitizedValue,
      user_id: data.user_id,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from('recruiter_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .maybeSingle();

    if (error) throw error;
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

// ── Jobs ─────────────────────────────────────────────────────────────────────

export async function getJobs(status?: JobStatus) {
  const rl = RateLimiter.checkPublicRoute();
  if (!rl.allowed) return { data: null, error: { message: rl.message } };

  try {
    let q = supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);

    const { data: jobData, error: jobError } = await q;
    if (jobError) throw jobError;
    if (!jobData || jobData.length === 0) return { data: [], error: null };

    // Fetch recruiter profiles for all unique recruiter IDs
    const recruiterIds = [...new Set(jobData.map(j => j.recruiter_id).filter(Boolean))];
    const profileMap = new Map<string, { company_name?: string; designation?: string; company_website?: string }>();

    if (recruiterIds.length > 0) {
      const { data: recProfiles } = await supabase
        .from('recruiter_profiles')
        .select('user_id, company_name, designation, company_website')
        .in('user_id', recruiterIds);

      if (recProfiles) {
        recProfiles.forEach(rp => {
          profileMap.set(rp.user_id, rp);
        });
      }
    }

    const merged = jobData.map(job => ({
      ...job,
      recruiter_profiles: profileMap.get(job.recruiter_id) || { company_name: 'Partner Recruiter', designation: '' },
    }));

    return { data: merged, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function getJobsByRecruiter(recruiterId: string) {
  const rl = RateLimiter.checkAuthenticatedAction(recruiterId);
  if (!rl.allowed) return { data: null, error: { message: rl.message } };

  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function getJobById(id: number) {
  const rl = RateLimiter.checkPublicRoute();
  if (!rl.allowed) return { data: null, error: { message: rl.message } };

  try {
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (jobError) throw jobError;
    if (!job) return { data: null, error: null };

    const { data: rp } = await supabase
      .from('recruiter_profiles')
      .select('company_name, designation, company_website')
      .eq('user_id', job.recruiter_id)
      .maybeSingle();

    return {
      data: {
        ...job,
        recruiter_profiles: rp || { company_name: 'Partner Recruiter', designation: '' },
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function createJob(data: Omit<Job, 'id' | 'created_at' | 'updated_at'>) {
  const rl = RateLimiter.checkAuthenticatedAction(data.recruiter_id);
  if (!rl.allowed) return { data: null, error: { message: rl.message } };

  const validation = validateJobInput(data);
  if (!validation.isValid) {
    return { data: null, error: { message: validation.error } };
  }

  try {
    const payload = {
      ...validation.sanitizedValue,
      recruiter_id: data.recruiter_id,
    };
    const { data: result, error } = await supabase.from('jobs').insert(payload).select().maybeSingle();
    if (error) throw error;
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function updateJob(id: number, data: Partial<Job>) {
  const validation = validateJobInput(data);
  if (!validation.isValid) {
    return { data: null, error: { message: validation.error } };
  }

  try {
    const payload = {
      ...validation.sanitizedValue,
      updated_at: new Date().toISOString(),
    };
    const { data: result, error } = await supabase
      .from('jobs')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function deleteJob(id: number) {
  try {
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

// ── Applications ─────────────────────────────────────────────────────────────

export async function getStudentApplications(studentId: string) {
  const rl = RateLimiter.checkAuthenticatedAction(studentId);
  if (!rl.allowed) return { data: null, error: { message: rl.message } };

  try {
    const { data: apps, error: appError } = await supabase
      .from('applications')
      .select('*, jobs(*)')
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });

    if (appError) throw appError;
    if (!apps || apps.length === 0) return { data: [], error: null };

    const recruiterIds = [...new Set(apps.map(a => (a as any).jobs?.recruiter_id).filter(Boolean))];
    const profileMap = new Map<string, { company_name?: string }>();

    if (recruiterIds.length > 0) {
      const { data: recProfiles } = await supabase
        .from('recruiter_profiles')
        .select('user_id, company_name')
        .in('user_id', recruiterIds);

      if (recProfiles) {
        recProfiles.forEach(rp => profileMap.set(rp.user_id, rp));
      }
    }

    const merged = apps.map(app => {
      const job = (app as any).jobs;
      return {
        ...app,
        jobs: job ? {
          ...job,
          recruiter_profiles: profileMap.get(job.recruiter_id) || { company_name: 'Partner Recruiter' },
        } : null,
      };
    });

    return { data: merged, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function getJobApplications(jobId: number) {
  try {
    const { data: apps, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('job_id', jobId)
      .order('submitted_at', { ascending: false });

    if (appError) throw appError;
    if (!apps || apps.length === 0) return { data: [], error: null };

    const studentIds = [...new Set(apps.map(a => a.student_id).filter(Boolean))];
    const [spRes, profRes] = await Promise.all([
      supabase.from('student_profiles').select('user_id, full_name, phone, skills, cgpa, resume_url').in('user_id', studentIds),
      supabase.from('profiles').select('id, email').in('id', studentIds),
    ]);

    const spMap = new Map<string, any>();
    spRes.data?.forEach(sp => spMap.set(sp.user_id, sp));

    const profMap = new Map<string, any>();
    profRes.data?.forEach(p => profMap.set(p.id, p));

    const merged = apps.map(app => ({
      ...app,
      student_profiles: spMap.get(app.student_id) || null,
      profiles: profMap.get(app.student_id) || null,
    }));

    return { data: merged, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function applyForJob(data: { student_id: string; job_id: number; resume_path: string; cover_letter: string }) {
  const rl = RateLimiter.checkAuthenticatedAction(data.student_id);
  if (!rl.allowed) return { data: null, error: { message: rl.message } };

  const validation = validateApplicationInput(data);
  if (!validation.isValid) {
    return { data: null, error: { message: validation.error } };
  }

  try {
    const { data: result, error } = await supabase.from('applications').insert(validation.sanitizedValue).select().maybeSingle();
    if (error) throw error;
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function updateApplicationStatus(id: number, status: ApplicationStatus) {
  const allowedStatuses: ApplicationStatus[] = ['APPLIED', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED'];
  if (!allowedStatuses.includes(status)) {
    return { data: null, error: { message: 'Invalid application status provided.' } };
  }

  try {
    const { data, error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function checkExistingApplication(studentId: string, jobId: number) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .eq('student_id', studentId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

// ── Feedback ─────────────────────────────────────────────────────────────────

export async function getFeedbackForApplication(applicationId: number) {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*, profiles!feedback_from_user_id_fkey(email)')
      .eq('to_entity_id', applicationId)
      .eq('type', 'APPLICATION')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function getStudentFeedback(studentId: string) {
  try {
    const { data: apps, error: appErr } = await supabase
      .from('applications')
      .select('id')
      .eq('student_id', studentId);

    if (appErr) throw appErr;
    if (!apps || apps.length === 0) return { data: [], error: null };

    const appIds = apps.map(a => a.id);
    const { data, error } = await supabase
      .from('feedback')
      .select('*, profiles!feedback_from_user_id_fkey(email)')
      .in('to_entity_id', appIds)
      .eq('type', 'APPLICATION')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function createFeedback(data: {
  from_user_id: string;
  to_entity_id: number;
  type: string;
  content: string;
  comments: string;
}) {
  const rl = RateLimiter.checkAuthenticatedAction(data.from_user_id);
  if (!rl.allowed) return { data: null, error: { message: rl.message } };

  const validation = validateFeedbackInput(data);
  if (!validation.isValid) {
    return { data: null, error: { message: validation.error } };
  }

  try {
    const { data: result, error } = await supabase.from('feedback').insert(validation.sanitizedValue).select().maybeSingle();
    if (error) throw error;
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

// ── Institutions & Departments ───────────────────────────────────────────────

export async function getInstitutions() {
  const rl = RateLimiter.checkPublicRoute();
  if (!rl.allowed) return { data: null, error: { message: rl.message } };

  try {
    const { data, error } = await supabase.from('institutions').select('*').order('name');
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function createInstitution(data: { name: string; address: string }) {
  const validation = validateInstitutionInput(data);
  if (!validation.isValid) {
    return { data: null, error: { message: validation.error } };
  }

  try {
    const { data: result, error } = await supabase.from('institutions').insert(validation.sanitizedValue).select().maybeSingle();
    if (error) throw error;
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function getDepartments(institutionId?: number) {
  const rl = RateLimiter.checkPublicRoute();
  if (!rl.allowed) return { data: null, error: { message: rl.message } };

  try {
    let q = supabase
      .from('departments')
      .select('*, institutions(name)')
      .order('name');
    if (institutionId) q = q.eq('institution_id', institutionId);

    const { data, error } = await q;
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function createDepartment(data: { institution_id: number; name: string }) {
  const validation = validateDepartmentInput(data);
  if (!validation.isValid) {
    return { data: null, error: { message: validation.error } };
  }

  try {
    const { data: result, error } = await supabase.from('departments').insert(validation.sanitizedValue).select().maybeSingle();
    if (error) throw error;
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

// ── Admin ────────────────────────────────────────────────────────────────────

export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function updateUserRole(userId: string, role: UserRole) {
  const roleCheck = validateRole(role);
  if (!roleCheck.isValid) {
    return { data: null, error: { message: roleCheck.error } };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: roleCheck.sanitizedValue })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function getAdminStats() {
  try {
    const [users, jobs, applications, institutions] = await Promise.all([
      supabase.from('profiles').select('id, role', { count: 'exact' }),
      supabase.from('jobs').select('id, status', { count: 'exact' }),
      supabase.from('applications').select('id, status', { count: 'exact' }),
      supabase.from('institutions').select('id', { count: 'exact' }),
    ]);

    return { users, jobs, applications, institutions };
  } catch (err) {
    logger.error('AdminStats', 'Failed to fetch admin dashboard stats', err);
    return {
      users: { count: 0 },
      jobs: { count: 0 },
      applications: { count: 0 },
      institutions: { count: 0 },
    };
  }
}

// ── Secure File Upload ───────────────────────────────────────────────────────

export async function uploadResumeFile(file: File, userId: string): Promise<{ publicUrl?: string; storagePath?: string; error?: { message: string } }> {
  const rl = RateLimiter.checkFileUpload(userId);
  if (!rl.allowed) {
    return { error: { message: rl.message ?? 'Upload limit reached. Please wait a few minutes before trying again.' } };
  }

  const validation = await validateFileUpload(file, userId);
  if (!validation.isValid) {
    return { error: { message: validation.error ?? 'File failed security verification.' } };
  }

  try {
    const bucket = SECURITY_CONFIG.FILE_UPLOAD.STORAGE_BUCKET;
    const path = validation.storagePath!;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'application/pdf',
      });

    if (uploadError) {
      logger.error('FileUpload', 'Storage upload failed', uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = urlData?.publicUrl || path;

    logger.info('FileUpload', 'Resume uploaded safely', { userId, path, size: file.size });
    return { publicUrl, storagePath: path };
  } catch (err) {
    return { error: sanitizeError(err, 'Failed to upload document to secure storage.') };
  }
}
