/*
  # Campus Recruitment Management System - Core Schema

  ## Overview
  Creates the full database schema for a campus recruitment platform supporting three roles:
  STUDENT, RECRUITER, and ADMIN.

  ## New Tables

  ### profiles
  - Extends Supabase auth.users with role and basic info
  - role: ENUM ('STUDENT', 'RECRUITER', 'ADMIN')

  ### institutions
  - Academic institutions (universities, colleges)
  - Fields: name, address

  ### departments
  - Departments within institutions
  - FK: institution_id -> institutions.id

  ### student_profiles
  - Student-specific profile data
  - FK: user_id -> auth.users.id
  - FK: department_id -> departments.id
  - Stores: full_name, phone, skills, cgpa, resume_url, resume_score

  ### recruiter_profiles
  - Recruiter/company profile data
  - FK: user_id -> auth.users.id
  - Stores: company_name, designation, company_website

  ### jobs
  - Job postings created by recruiters
  - FK: recruiter_id -> auth.users.id
  - status: ENUM ('OPEN', 'CLOSED')

  ### applications
  - Student job applications
  - FK: student_id -> auth.users.id, job_id -> jobs.id
  - status: ENUM ('APPLIED', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED')

  ### feedback
  - Feedback from recruiters to students on applications
  - FK: from_user_id -> auth.users.id
  - type: ENUM ('APPLICATION', 'JOB')

  ## Security
  - RLS enabled on all tables
  - Policies scoped per role using auth.uid()
  - Public read for jobs (OPEN listings)
  - Students see their own data, recruiters see their own postings/applications
  - Admin policies require ADMIN role check via profiles table
*/

-- Create role enum
CREATE TYPE user_role AS ENUM ('STUDENT', 'RECRUITER', 'ADMIN');
CREATE TYPE job_status AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE application_status AS ENUM ('APPLIED', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED');
CREATE TYPE feedback_type AS ENUM ('APPLICATION', 'JOB');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role user_role NOT NULL DEFAULT 'STUDENT',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  );

-- Function to insert profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STUDENT')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Institutions
CREATE TABLE IF NOT EXISTS institutions (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  address text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read institutions"
  ON institutions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert institutions"
  ON institutions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins can update institutions"
  ON institutions FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can delete institutions"
  ON institutions FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id bigserial PRIMARY KEY,
  institution_id bigint REFERENCES institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins can update departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can delete departments"
  ON departments FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  id bigserial PRIMARY KEY,
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  department_id bigint REFERENCES departments(id) ON DELETE SET NULL,
  skills text DEFAULT '',
  cgpa numeric(3,2) DEFAULT 0.00,
  resume_url text DEFAULT '',
  resume_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own profile"
  ON student_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own profile"
  ON student_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own profile"
  ON student_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recruiters can read student profiles"
  ON student_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'RECRUITER')
  );

CREATE POLICY "Admins can read all student profiles"
  ON student_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Recruiter Profiles
CREATE TABLE IF NOT EXISTS recruiter_profiles (
  id bigserial PRIMARY KEY,
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL DEFAULT '',
  designation text DEFAULT '',
  department_id bigint REFERENCES departments(id) ON DELETE SET NULL,
  company_website text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters can read own profile"
  ON recruiter_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can insert own profile"
  ON recruiter_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recruiters can update own profile"
  ON recruiter_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students and admins can read recruiter profiles"
  ON recruiter_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('STUDENT', 'ADMIN'))
  );

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id bigserial PRIMARY KEY,
  recruiter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  requirements text DEFAULT '',
  salary_package text DEFAULT '',
  location text DEFAULT '',
  status job_status DEFAULT 'OPEN',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read open jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (status = 'OPEN' OR recruiter_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Recruiters can insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = recruiter_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'RECRUITER')
  );

CREATE POLICY "Recruiters can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = recruiter_id)
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = recruiter_id);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
  id bigserial PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id bigint NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  resume_path text DEFAULT '',
  status application_status DEFAULT 'APPLIED',
  cover_letter text DEFAULT '',
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, job_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'STUDENT')
  );

CREATE POLICY "Students can update own applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Recruiters can read applications for their jobs"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can update application status"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.recruiter_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Feedback
CREATE TABLE IF NOT EXISTS feedback (
  id bigserial PRIMARY KEY,
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_entity_id bigint NOT NULL,
  type feedback_type NOT NULL DEFAULT 'APPLICATION',
  content text DEFAULT '',
  comments text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read feedback addressed to their entities"
  ON feedback FOR SELECT
  TO authenticated
  USING (
    auth.uid() = from_user_id OR
    EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = feedback.to_entity_id AND a.student_id = auth.uid()
        AND feedback.type = 'APPLICATION'
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Recruiters can insert feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = from_user_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('RECRUITER', 'ADMIN'))
  );

CREATE POLICY "Authors can update own feedback"
  ON feedback FOR UPDATE
  TO authenticated
  USING (auth.uid() = from_user_id)
  WITH CHECK (auth.uid() = from_user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_user_id ON recruiter_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_feedback_from_user ON feedback(from_user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_to_entity ON feedback(to_entity_id);
CREATE INDEX IF NOT EXISTS idx_departments_institution ON departments(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Seed some institutions and departments
INSERT INTO institutions (name, address) VALUES
  ('MIT Institute of Technology', '77 Massachusetts Ave, Cambridge, MA'),
  ('State University of Engineering', '100 University Blvd, Springfield'),
  ('National College of Sciences', '45 Science Park Drive, Boston')
ON CONFLICT DO NOTHING;

INSERT INTO departments (institution_id, name) VALUES
  (1, 'Computer Science'),
  (1, 'Electrical Engineering'),
  (1, 'Mechanical Engineering'),
  (2, 'Information Technology'),
  (2, 'Civil Engineering'),
  (3, 'Data Science'),
  (3, 'Biotechnology')
ON CONFLICT DO NOTHING;
