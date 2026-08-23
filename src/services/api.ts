import { supabase } from '../lib/supabase';
import type {
  StudentProfile, RecruiterProfile, Job,
  ApplicationStatus, JobStatus, UserRole
} from '../lib/supabase';

// ── Student Profile ──────────────────────────────────────────────────────────

export async function getStudentProfile(userId: string) {
  return supabase
    .from('student_profiles')
    .select('*, departments(*, institutions(*))')
    .eq('user_id', userId)
    .maybeSingle();
}

export async function upsertStudentProfile(data: Partial<StudentProfile> & { user_id: string }) {
  return supabase
    .from('student_profiles')
    .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .maybeSingle();
}

// ── Recruiter Profile ────────────────────────────────────────────────────────

export async function getRecruiterProfile(userId: string) {
  return supabase
    .from('recruiter_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
}

export async function upsertRecruiterProfile(data: Partial<RecruiterProfile> & { user_id: string }) {
  return supabase
    .from('recruiter_profiles')
    .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .maybeSingle();
}

// ── Jobs ─────────────────────────────────────────────────────────────────────

export async function getJobs(status?: JobStatus) {
  let q = supabase
    .from('jobs')
    .select('*, recruiter_profiles(company_name, designation)')
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  return q;
}

export async function getJobsByRecruiter(recruiterId: string) {
  return supabase
    .from('jobs')
    .select('*')
    .eq('recruiter_id', recruiterId)
    .order('created_at', { ascending: false });
}

export async function getJobById(id: number) {
  return supabase
    .from('jobs')
    .select('*, recruiter_profiles(company_name, designation, company_website)')
    .eq('id', id)
    .maybeSingle();
}

export async function createJob(data: Omit<Job, 'id' | 'created_at' | 'updated_at'>) {
  return supabase.from('jobs').insert(data).select().maybeSingle();
}

export async function updateJob(id: number, data: Partial<Job>) {
  return supabase
    .from('jobs')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();
}

export async function deleteJob(id: number) {
  return supabase.from('jobs').delete().eq('id', id);
}

// ── Applications ─────────────────────────────────────────────────────────────

export async function getStudentApplications(studentId: string) {
  return supabase
    .from('applications')
    .select('*, jobs(title, location, salary_package, status, recruiter_profiles(company_name))')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false });
}

export async function getJobApplications(jobId: number) {
  return supabase
    .from('applications')
    .select('*, student_profiles(full_name, phone, skills, cgpa, resume_url), profiles!applications_student_id_fkey(email)')
    .eq('job_id', jobId)
    .order('submitted_at', { ascending: false });
}

export async function applyForJob(data: { student_id: string; job_id: number; resume_path: string; cover_letter: string }) {
  return supabase.from('applications').insert(data).select().maybeSingle();
}

export async function updateApplicationStatus(id: number, status: ApplicationStatus) {
  return supabase
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();
}

export async function checkExistingApplication(studentId: string, jobId: number) {
  return supabase
    .from('applications')
    .select('id')
    .eq('student_id', studentId)
    .eq('job_id', jobId)
    .maybeSingle();
}

// ── Feedback ─────────────────────────────────────────────────────────────────

export async function getFeedbackForApplication(applicationId: number) {
  return supabase
    .from('feedback')
    .select('*, profiles!feedback_from_user_id_fkey(email)')
    .eq('to_entity_id', applicationId)
    .eq('type', 'APPLICATION')
    .order('created_at', { ascending: false });
}

export async function getStudentFeedback(studentId: string) {
  const { data: apps } = await supabase
    .from('applications')
    .select('id')
    .eq('student_id', studentId);

  if (!apps || apps.length === 0) return { data: [], error: null };

  const appIds = apps.map(a => a.id);
  return supabase
    .from('feedback')
    .select('*, profiles!feedback_from_user_id_fkey(email)')
    .in('to_entity_id', appIds)
    .eq('type', 'APPLICATION')
    .order('created_at', { ascending: false });
}

export async function createFeedback(data: {
  from_user_id: string;
  to_entity_id: number;
  type: string;
  content: string;
  comments: string;
}) {
  return supabase.from('feedback').insert(data).select().maybeSingle();
}

// ── Institutions & Departments ───────────────────────────────────────────────

export async function getInstitutions() {
  return supabase.from('institutions').select('*').order('name');
}

export async function createInstitution(data: { name: string; address: string }) {
  return supabase.from('institutions').insert(data).select().maybeSingle();
}

export async function getDepartments(institutionId?: number) {
  let q = supabase
    .from('departments')
    .select('*, institutions(name)')
    .order('name');
  if (institutionId) q = q.eq('institution_id', institutionId);
  return q;
}

export async function createDepartment(data: { institution_id: number; name: string }) {
  return supabase.from('departments').insert(data).select().maybeSingle();
}

// ── Admin ────────────────────────────────────────────────────────────────────

export async function getAllUsers() {
  return supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
}

export async function updateUserRole(userId: string, role: UserRole) {
  return supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .maybeSingle();
}

export async function getAdminStats() {
  const [users, jobs, applications, institutions] = await Promise.all([
    supabase.from('profiles').select('id, role', { count: 'exact' }),
    supabase.from('jobs').select('id, status', { count: 'exact' }),
    supabase.from('applications').select('id, status', { count: 'exact' }),
    supabase.from('institutions').select('id', { count: 'exact' }),
  ]);

  return { users, jobs, applications, institutions };
}
