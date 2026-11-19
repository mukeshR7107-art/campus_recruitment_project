# Campus Recruitment System review

## Live verification update — 19 November 2026

- GitHub main contains redesign commit `61224f02573649c6e7293c17c93cb2c02c966c96`.
- Supabase project `nrfsazthoxmigjzwyxpf`: private resume bucket and recruitment security migration applied successfully. Fixed a nested block-comment token that prevented the older storage migration from parsing.
- Database transaction tests passed for signup ADMIN rejection, self-promotion denial, application to an open job, closed-job rejection, self-hire denial, profile/resume isolation, recruiter status changes, immutable submissions, feedback ownership and student feedback visibility. Test accounts, records and storage metadata were rolled back.
- These are database authorization tests, not full browser login/upload/download tests. Email delivery and actual Storage HTTP uploads/signed downloads still need end-to-end verification.
- Security advisors now report two warnings: the intentional authenticated `is_admin()` helper (returns only the caller's admin status), and disabled leaked-password protection. Anonymous function execution and signup-trigger execution have been revoked.
- The live database has zero ADMIN accounts. The admin screens cannot currently be used until the campus owner designates an existing account for trusted administrator provisioning. No account was promoted automatically.
- GitHub follow-up commit `00ade1b1380be72306ec25ff7d42135179b57326` deployed successfully to production. Vercel deployment `dpl_5heAE84g2RhuNUAM5MHs12d5PAXK` is READY (Vite, about 10.4 seconds building), with the original domain assigned: https://campus-recruitment-project-l7h1.vercel.app/ . Public HTTP returns 200 with the configured CSP, and the redesigned homepage was visually verified on that live domain.

The dated implementation audit below records the earlier state; this update supersedes its migration-pending statements.

Reviewed 18 November 2026. This is an implementation audit with public-page browser checks, not a certification that every production feature works. Authenticated tests and live database migration verification require the owner’s signed-in test sessions.

## Delivered changes

- Rebuilt the public homepage with evergreen branding, warm backgrounds, translucent glass cards, responsive layouts, readable typography, and campus-focused content.
- Extended shared card/header/button colors across student, recruiter and admin screens. Added keyboard focus treatment, reduced-motion handling and associated labels for shared form controls.
- Removed fictional testimonials, placement totals, sample vacancies represented as real listings, the nonfunctional newsletter, and an inert notification button.
- Kept the public homepage accessible when signed in; `/dashboard` routes to the correct role.
- Fixed job open/close updates: the old partial update required a missing job title and would fail validation. Failed job updates and applicant status updates no longer falsely update the UI.
- Fixed feedback reads: the old PostgREST join referenced `public.profiles`, but the schema’s feedback author foreign key points to `auth.users`. Feedback now loads without that invalid join; author email is no longer exposed by that query.
- Resume downloads now request an authorized, 60-second signed URL for private Supabase objects. Stored legacy URL strings remain stable references, not publicly readable links. The recruiter viewer prefers the resume submitted with the application.
- Clearing or rejecting a selected upload clears the parent’s pending file, preventing an old selection being uploaded unintentionally.
- Replaced the skills-count “automated resume score” with an explicitly labelled six-field profile completeness checklist, consistent across dashboard and profile. No AI resume analysis is claimed.
- Reduced duplicate-application lookup from one request per job to one application query. Job search also matches company names.
- Surfaced loading failures on student dashboard, profile, applications, feedback and listings.
- Added Vercel security headers and a restrictive CSP, plus a proper favicon.

## Feature status

“Implemented” means the code and database integration exist; it does not mean production execution has been verified.

| Feature | Result and remaining limits |
| --- | --- |
| Public homepage and section links | Browser checked; new design renders. |
| Responsive homepage | Checked at 390px; document width 384px, no horizontal overflow. |
| Login/register navigation | Browser checked; both pages render. |
| Signed-out student route protection | Browser checked: `/student` redirects to `/login`. |
| Registration, confirmation email, sign-in/sign-out | Implemented with Supabase; live account flow pending. No forgot-password UI. |
| Student profile and department selection | Implemented; live persistence pending. Load errors now visible. |
| Resume upload and download | Code corrected; private bucket/RLS and live upload/download pending. File signatures are checked, but no malware scanning service exists. |
| Profile completeness | Implemented deterministic checklist; not ATS scoring, AI analysis or employability ranking. |
| Job search and job detail modal | Implemented; searches title, company, location, description and requirements. No structured department/job-type/salary filtering schema exists. |
| Submit application and duplicate protection | Implemented; existing unique(student_id, job_id) constraint prevents duplicates. New migration restricts insertion to OPEN jobs and APPLIED status. Live submission pending. |
| Application status timeline and filtering | Implemented; data refresh occurs on page load, not a real-time subscription. |
| Student feedback | Invalid database join corrected; end-to-end recruiter-to-student test pending. |
| Recruiter company profile | Implemented; no recruiter verification/approval workflow. |
| Create/edit/open/close/delete jobs | Implemented; open/close validation fixed. Live persistence and permission tests pending. Deleting a job cascades to its applications under the existing schema. |
| Applicant viewing and status changes | Implemented; status errors handled. Applicant email may remain unavailable due to profile RLS; names/skills come from authorized student profiles. |
| Recruiter feedback submission | Implemented; new database policy restricts submission to own-job applications. Live test pending. |
| Admin roles, institutions and departments | Implemented; live administrator tests pending. Institution/department UI supports creation/listing, not a full edit/delete workflow. |
| Dashboard analytics | Basic counts exist. Admin “placement” percentage is based on hired applications, not unique eligible students; should not be used as an institutional placement-rate KPI. |
| Newsletter and notifications | Not implemented; misleading controls removed. |
| Interview scheduling, assessments, offer letters | Not implemented. |
| Saved jobs, email alerts, deadline reminders | Not implemented. |
| Campus membership approval and tenant isolation | Not implemented. Institutions/departments exist, but open jobs are visible to all authenticated users. A campus-specific deployment is possible; strict campus-only access is not yet enforced. |
| Eligibility rules: CGPA, backlogs, branch, graduation year | Not implemented as server-enforced rules. |

## Security findings and fixes

Apply `supabase/migrations/20261118000000_enforce_recruitment_permissions.sql` after the earlier migrations. A GitHub push/Vercel build does NOT apply Supabase SQL.

1. Critical: signup metadata allowed requesting ADMIN. New trigger only accepts STUDENT or RECRUITER. Frontend also rejects admin signup.
2. Critical: users could update their own profile role to ADMIN. Removed the self-update policy; administrators retain their existing guarded policy.
3. High: students could update their application to HIRED. Removed their UPDATE policy and enforce APPLIED on insert plus an OPEN-job check.
4. High: recruiters could rewrite submitted applicant details. Added an immutable-submission trigger for applicant, job, resume, letter and submission timestamp.
5. High: any recruiter could read every student profile/resume. Restricted profile reads to applicants to their jobs, and storage reads to the submitted resume, its owner or an admin.
6. High: recruiters could insert feedback against unrelated applications. Restricted feedback creation to owned-job applications or an administrator; removed unused feedback update capability.
7. Deployment hardening: CSP, anti-framing, MIME sniffing protection, referrer and browser permission policies.

Important remaining work:
- Verify migrations on the real database, including negative tests with two different recruiters and two students. These SQL changes have NOT been runtime-tested against PostgreSQL in this session.
- Review existing ADMIN accounts for unauthorized historical escalation. Fixing signup does not remove accounts created before the fix.
- Add institution membership verification and recruiter approval. Self-registration currently accepts recruiter accounts.
- Client-side rate limiting and validation are bypassable. Use Supabase Auth controls and server/database enforcement for security-sensitive limits.
- Add server-side file malware scanning if needed, audit trails, and a defined privacy/retention policy before handling real campus recruitment at scale.
- Production dependency audit: 0 known vulnerabilities after compatible updates. Full development audit: 17 high findings remain through picomatch and dependent tooling. Do not expose the development server publicly. Avoid blindly forcing a breaking Tailwind upgrade; recheck upstream fixes and plan a tested tooling upgrade.

## Validation

- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run test:security`: passed (existing rate limiting, input validation and error sanitization assertions now fail the process if an assertion fails).
- `npm audit --omit=dev`: zero vulnerabilities.
- Public browser checks: homepage, mobile overflow, login, registration, signed-out student redirect.
- Authenticated role workflows, SQL execution, data isolation and production deployment: pending separate verification.

## Problem statement for a presentation or SIH-style proposal

**Title: A campus-controlled placement coordination and application transparency system.**

Placement processes often spread student records, resumes, opportunities, applications and feedback across spreadsheets, forms and messages. Students lack a consistent view of application progress; recruiters repeatedly collect candidate details; placement teams spend effort consolidating records. This project centralizes those core workflows in a role-based portal that a campus can operate and customize.

This is an original SIH-style framing, not a claim that the project implements an identified official Smart India Hackathon problem statement.

**A defensible pitch:** “JobBoard brings student profiles, campus opportunities, applications and recruiter feedback into one campus-managed workflow, reducing repeated data entry and giving students a clearer view of their placement journey.”

## Relevant alternatives and differentiation

| Alternative | Fair comparison |
| --- | --- |
| Superset | An established campus placement/recruitment platform, so campus specificity alone is not unique. It offers broader recruitment workflows. Our opportunity is a smaller customizable implementation for a particular campus, with a focused student experience; cost savings need actual cost evidence. |
| Institution-built placement portals, e.g. IIT Bombay | Demonstrate that institution-specific portals already exist. Differentiate with the chosen campus’s workflows, accessibility and integration quality, not the claim that no campus portal exists. |
| Forms + spreadsheets + messaging | Accessible starting point but fragmented status/records; this project provides connected role-based profiles, applications and feedback. |

Source pages: https://joinsuperset.com/ ; https://joinsuperset.com/employer ; https://campus.placements.iitb.ac.in/ . Private storage guidance: https://supabase.com/docs/guides/storage/buckets/fundamentals .

**Differentiators to build next:** verified campus membership, institution-controlled recruiter approval, transparent eligibility with reasons, campus-specific offer rules, interview scheduling, accessible low-bandwidth views and exportable placement reports with correct denominators. These are a roadmap, not delivered features. Measure success using coordinator time saved, duplicate record reduction, application completion, status visibility and student satisfaction; do not invent results.
