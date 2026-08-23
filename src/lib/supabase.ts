import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'STUDENT' | 'RECRUITER' | 'ADMIN';
export type JobStatus = 'OPEN' | 'CLOSED';
export type ApplicationStatus = 'APPLIED' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
export type FeedbackType = 'APPLICATION' | 'JOB';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Institution {
  id: number;
  name: string;
  address: string;
  created_at: string;
}

export interface Department {
  id: number;
  institution_id: number;
  name: string;
  created_at: string;
  institutions?: Institution;
}

export interface StudentProfile {
  id: number;
  user_id: string;
  full_name: string;
  phone: string;
  department_id: number | null;
  skills: string;
  cgpa: number;
  resume_url: string;
  resume_score: number;
  created_at: string;
  updated_at: string;
  departments?: Department;
}

export interface RecruiterProfile {
  id: number;
  user_id: string;
  company_name: string;
  designation: string;
  department_id: number | null;
  company_website: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: number;
  recruiter_id: string;
  title: string;
  description: string;
  requirements: string;
  salary_package: string;
  location: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  recruiter_profiles?: RecruiterProfile;
}

export interface Application {
  id: number;
  student_id: string;
  job_id: number;
  resume_path: string;
  status: ApplicationStatus;
  cover_letter: string;
  submitted_at: string;
  updated_at: string;
  jobs?: Job;
  student_profiles?: StudentProfile;
  profiles?: Profile;
}

export interface Feedback {
  id: number;
  from_user_id: string;
  to_entity_id: number;
  type: FeedbackType;
  content: string;
  comments: string;
  created_at: string;
  profiles?: Profile;
}
