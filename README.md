# Campus Recruitment Management System (CRMS)

A modern, full-featured web platform designed to streamline and automate campus placement and recruitment workflows for educational institutions, corporate recruiters, and students.

---

## 📌 Project Overview

The **Campus Recruitment Management System (CRMS)** bridges the gap between graduating students and prospective employers. It provides dedicated, role-based workflows for students, company recruiters, and campus placement administrators—facilitating job discovery, applicant tracking, candidate evaluation, resume scoring, and structured feedback in a single, unified interface.

---

## ✨ Key Features

### 🎓 Student Portal
- **Profile & Portfolio Management**: Create and maintain detailed academic profiles, including contact information, bio, CGPA, graduation year, institution, department, and technical skill tags.
- **Resume Upload & Resume Scoring**: Upload resumes with automatic calculation of a profile/resume completeness score to help students optimize their application readiness.
- **Smart Job Search & Filtering**: Browse curated job listings with search by title, department, job type (Full-time, Part-time, Internship, Contract), experience level, salary package, and location.
- **Application Tracking**: Submit applications with customized cover letters and track live status progression (`SUBMITTED`, `REVIEWED`, `SHORTLISTED`, `INTERVIEWING`, `OFFERED`, `REJECTED`).
- **Recruiter Feedback**: View direct evaluations and structured interview feedback provided by recruiters.

### 🏢 Recruiter Portal
- **Company Branding**: Manage company profile, designation, official website, and organizational details.
- **Job Posting & Management**: Create, edit, publish, or close job openings with requirements, eligibility criteria, department targeting, and salary packages.
- **Applicant Pipeline Management**: Review student applications, inspect detailed student profiles, download/view resumes, and transition applicants through hiring stages.
- **Structured Feedback System**: Leave qualitative comments and feedback for applicants to maintain transparent communication during recruitment drives.

### 🛡️ Admin & Placement Cell Portal
- **Platform Analytics**: High-level statistical overview of total registered users, active job postings, total applications submitted, and affiliated institutions.
- **User Role Management**: View all platform users and dynamically assign or update user roles (`STUDENT`, `RECRUITER`, `ADMIN`).
- **Institution Registry**: Add and manage participating colleges, universities, and institutions.
- **Department Hierarchy**: Configure academic departments mapped to corresponding institutions for precise student and job categorization.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite](https://vitejs.dev/) |
| **Styling & Design** | [Tailwind CSS](https://tailwindcss.com/) & PostCSS |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Backend & Database** | [Supabase](https://supabase.com/) (PostgreSQL, Authentication, Row-Level Security) |

---

## 📁 Project Structure

```text
Mukesh-main/
├── src/
│   ├── components/
│   │   ├── layout/          # DashboardLayout, Sidebar, Navbar
│   │   └── ui/              # Reusable UI components (Button, Card, Badge, Modal, Input, etc.)
│   ├── context/
│   │   └── AuthContext.tsx  # Authentication & RBAC state management
│   ├── lib/
│   │   └── supabase.ts      # Supabase client setup & TypeScript database types
│   ├── pages/
│   │   ├── admin/           # Admin Dashboard, User, Institution & Department Management
│   │   ├── auth/            # Login and Register pages
│   │   ├── recruiter/       # Recruiter Dashboard, Job Management, Applicant Tracking
│   │   ├── student/         # Student Dashboard, Job Listings, Applications, Feedback
│   │   └── LandingPage.tsx  # Marketing landing page
│   ├── routes/
│   │   └── ProtectedRoute.tsx # Route protection based on user role
│   ├── services/
│   │   └── api.ts           # Supabase API abstraction layer
│   ├── App.tsx              # Main routing configuration
│   ├── index.css            # Global CSS & Tailwind imports
│   └── main.tsx             # Application entry point
├── supabase/
│   └── migrations/          # PostgreSQL database schema & RLS policies
├── package.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) project instance

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Mukesh-main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Run the SQL migrations located in `supabase/migrations/` in your Supabase SQL Editor to set up:
- Core tables (`profiles`, `student_profiles`, `recruiter_profiles`, `jobs`, `applications`, `feedback`, `institutions`, `departments`)
- Row Level Security (RLS) policies
- Automatic user profile sync triggers

### 5. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 6. Build for Production
```bash
npm run build
```

---

## 🔒 Role-Based Access Control (RBAC)

The system enforces strict client-side route protection and database-level Row Level Security (RLS):
- **Students** can only view/edit their own applications and profiles, and browse published jobs.
- **Recruiters** can only create and manage their own job postings and review applications submitted to their listings.
- **Admins** possess administrative privileges to manage institutions, departments, and user roles across the platform.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
