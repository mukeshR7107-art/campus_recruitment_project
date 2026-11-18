import type { StudentProfile } from './supabase';
export function profileCompleteness(profile: Partial<StudentProfile> | null) {
  return Math.round([profile?.full_name?.trim(), profile?.phone?.trim(), profile?.department_id, profile?.skills?.trim(), profile?.resume_url?.trim(), Number(profile?.cgpa) > 0].filter(Boolean).length / 6 * 100);
}
