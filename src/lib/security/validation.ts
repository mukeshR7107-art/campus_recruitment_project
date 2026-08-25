/**
 * Strict Input Validation Schemas
 *
 * Enforces strict type, length, format, and boundary checks.
 * Rejects non-compliant inputs rather than only attempting sanitization.
 */

import { SECURITY_CONFIG } from './securityConfig';
import { UserRole, JobStatus, FeedbackType } from '../supabase';

export interface ValidationResult<T = unknown> {
  isValid: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  sanitizedValue?: T;
}

// ── Atomic Validators ────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;
const SAFE_TEXT_REGEX = /^[\p{L}\p{N}\s.,!?'"()\-–—_@/+#&%:]*$/u;

export function validateEmail(email: unknown): ValidationResult<string> {
  if (typeof email !== 'string') {
    return { isValid: false, error: 'Email must be a valid text string.' };
  }
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' };
  }
  if (trimmed.length > SECURITY_CONFIG.VALIDATION.EMAIL.MAX_LENGTH) {
    return { isValid: false, error: `Email cannot exceed ${SECURITY_CONFIG.VALIDATION.EMAIL.MAX_LENGTH} characters.` };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid, well-formed email address.' };
  }
  return { isValid: true, sanitizedValue: trimmed.toLowerCase() };
}

export function validatePassword(password: unknown): ValidationResult<string> {
  if (typeof password !== 'string') {
    return { isValid: false, error: 'Password must be a valid string.' };
  }
  const { MIN_LENGTH, MAX_LENGTH } = SECURITY_CONFIG.VALIDATION.PASSWORD;
  if (password.length < MIN_LENGTH) {
    return { isValid: false, error: `Password must be at least ${MIN_LENGTH} characters long.` };
  }
  if (password.length > MAX_LENGTH) {
    return { isValid: false, error: `Password cannot exceed ${MAX_LENGTH} characters.` };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one numerical digit (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special symbol (!@#$%^&*...).' };
  }
  return { isValid: true, sanitizedValue: password };
}

export function validateName(name: unknown, fieldLabel = 'Name'): ValidationResult<string> {
  if (typeof name !== 'string') {
    return { isValid: false, error: `${fieldLabel} must be a valid string.` };
  }
  const trimmed = name.trim();
  const { MIN_LENGTH, MAX_LENGTH } = SECURITY_CONFIG.VALIDATION.NAME;
  if (trimmed.length < MIN_LENGTH) {
    return { isValid: false, error: `${fieldLabel} must be at least ${MIN_LENGTH} characters.` };
  }
  if (trimmed.length > MAX_LENGTH) {
    return { isValid: false, error: `${fieldLabel} cannot exceed ${MAX_LENGTH} characters.` };
  }
  if (!SAFE_TEXT_REGEX.test(trimmed)) {
    return { isValid: false, error: `${fieldLabel} contains invalid or forbidden characters.` };
  }
  return { isValid: true, sanitizedValue: trimmed };
}

export function validatePhone(phone: unknown): ValidationResult<string> {
  if (phone === null || phone === undefined || phone === '') {
    return { isValid: true, sanitizedValue: '' };
  }
  if (typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number must be a valid string.' };
  }
  const trimmed = phone.trim();
  if (trimmed === '') {
    return { isValid: true, sanitizedValue: '' };
  }
  if (!PHONE_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Phone number format is invalid. Use standard digits and optional country code (e.g. +1 555 019 2834).' };
  }
  return { isValid: true, sanitizedValue: trimmed };
}

export function validateUrl(url: unknown, fieldLabel = 'URL', required = false): ValidationResult<string> {
  if (url === null || url === undefined || url === '') {
    if (required) {
      return { isValid: false, error: `${fieldLabel} is required.` };
    }
    return { isValid: true, sanitizedValue: '' };
  }
  if (typeof url !== 'string') {
    return { isValid: false, error: `${fieldLabel} must be a text string.` };
  }
  const trimmed = url.trim();
  if (trimmed === '') {
    if (required) return { isValid: false, error: `${fieldLabel} is required.` };
    return { isValid: true, sanitizedValue: '' };
  }
  if (trimmed.length > SECURITY_CONFIG.VALIDATION.URL.MAX_LENGTH) {
    return { isValid: false, error: `${fieldLabel} exceeds maximum allowed length of ${SECURITY_CONFIG.VALIDATION.URL.MAX_LENGTH} characters.` };
  }

  try {
    const parsed = new URL(trimmed);
    const allowedProtocols = SECURITY_CONFIG.VALIDATION.URL.ALLOWED_PROTOCOLS;
    if (!allowedProtocols.includes(parsed.protocol as 'http:' | 'https:')) {
      return { isValid: false, error: `${fieldLabel} must start with http:// or https://.` };
    }
    // Reject suspicious schemes or pseudo-protocols
    if (parsed.protocol.toLowerCase().startsWith('javascript') || parsed.protocol.toLowerCase().startsWith('data')) {
      return { isValid: false, error: `Invalid ${fieldLabel} protocol.` };
    }
    return { isValid: true, sanitizedValue: parsed.toString() };
  } catch {
    return { isValid: false, error: `Please enter a valid, absolute ${fieldLabel} (e.g. https://example.com).` };
  }
}

export function validateCgpa(cgpa: unknown): ValidationResult<number> {
  if (cgpa === null || cgpa === undefined || cgpa === '') {
    return { isValid: true, sanitizedValue: 0 };
  }
  const num = typeof cgpa === 'number' ? cgpa : Number(cgpa);
  if (isNaN(num) || !isFinite(num)) {
    return { isValid: false, error: 'CGPA must be a valid number.' };
  }
  const { MIN, MAX } = SECURITY_CONFIG.VALIDATION.CGPA;
  if (num < MIN || num > MAX) {
    return { isValid: false, error: `CGPA must be between ${MIN.toFixed(2)} and ${MAX.toFixed(2)}.` };
  }
  // Round to 2 decimal places
  const rounded = Math.round(num * 100) / 100;
  return { isValid: true, sanitizedValue: rounded };
}

export function validateRole(role: unknown): ValidationResult<UserRole> {
  const allowedRoles: UserRole[] = ['STUDENT', 'RECRUITER', 'ADMIN'];
  if (typeof role !== 'string' || !allowedRoles.includes(role as UserRole)) {
    return { isValid: false, error: 'Invalid user role selected.' };
  }
  return { isValid: true, sanitizedValue: role as UserRole };
}

export function validateTextLength(
  text: unknown,
  min: number,
  max: number,
  fieldLabel: string,
  required = true
): ValidationResult<string> {
  if (text === null || text === undefined || text === '') {
    if (required) return { isValid: false, error: `${fieldLabel} is required.` };
    return { isValid: true, sanitizedValue: '' };
  }
  if (typeof text !== 'string') {
    return { isValid: false, error: `${fieldLabel} must be a valid string.` };
  }
  const trimmed = text.trim();
  if (required && trimmed.length < min) {
    return { isValid: false, error: `${fieldLabel} must be at least ${min} character${min === 1 ? '' : 's'}.` };
  }
  if (trimmed.length > max) {
    return { isValid: false, error: `${fieldLabel} cannot exceed ${max} characters.` };
  }
  return { isValid: true, sanitizedValue: trimmed };
}

// ── Compound Payload Validators ─────────────────────────────────────────────

export function validateStudentProfileInput(data: Record<string, unknown>): ValidationResult<Record<string, unknown>> {
  const fieldErrors: Record<string, string> = {};
  const sanitized: Record<string, unknown> = {};

  if (data.full_name !== undefined) {
    const res = validateName(data.full_name, 'Full Name');
    if (!res.isValid) fieldErrors.full_name = res.error!;
    else sanitized.full_name = res.sanitizedValue;
  }

  if (data.phone !== undefined) {
    const res = validatePhone(data.phone);
    if (!res.isValid) fieldErrors.phone = res.error!;
    else sanitized.phone = res.sanitizedValue;
  }

  if (data.cgpa !== undefined) {
    const res = validateCgpa(data.cgpa);
    if (!res.isValid) fieldErrors.cgpa = res.error!;
    else sanitized.cgpa = res.sanitizedValue;
  }

  if (data.resume_url !== undefined && data.resume_url !== '') {
    const res = validateUrl(data.resume_url, 'Resume Link');
    if (!res.isValid) fieldErrors.resume_url = res.error!;
    else sanitized.resume_url = res.sanitizedValue;
  } else {
    sanitized.resume_url = '';
  }

  if (data.skills !== undefined) {
    const res = validateTextLength(data.skills, 0, 1000, 'Skills', false);
    if (!res.isValid) fieldErrors.skills = res.error!;
    else sanitized.skills = res.sanitizedValue;
  }

  if (data.department_id !== undefined) {
    sanitized.department_id = data.department_id ? Number(data.department_id) : null;
  }

  const isValid = Object.keys(fieldErrors).length === 0;
  return {
    isValid,
    error: isValid ? undefined : Object.values(fieldErrors)[0],
    fieldErrors,
    sanitizedValue: sanitized,
  };
}

export function validateRecruiterProfileInput(data: Record<string, unknown>): ValidationResult<Record<string, unknown>> {
  const fieldErrors: Record<string, string> = {};
  const sanitized: Record<string, unknown> = {};

  if (data.company_name !== undefined) {
    const res = validateTextLength(data.company_name, 2, 150, 'Company Name', true);
    if (!res.isValid) fieldErrors.company_name = res.error!;
    else sanitized.company_name = res.sanitizedValue;
  }

  if (data.designation !== undefined) {
    const res = validateTextLength(data.designation, 0, 100, 'Designation', false);
    if (!res.isValid) fieldErrors.designation = res.error!;
    else sanitized.designation = res.sanitizedValue;
  }

  if (data.company_website !== undefined && data.company_website !== '') {
    const res = validateUrl(data.company_website, 'Company Website', false);
    if (!res.isValid) fieldErrors.company_website = res.error!;
    else sanitized.company_website = res.sanitizedValue;
  } else {
    sanitized.company_website = '';
  }

  const isValid = Object.keys(fieldErrors).length === 0;
  return {
    isValid,
    error: isValid ? undefined : Object.values(fieldErrors)[0],
    fieldErrors,
    sanitizedValue: sanitized,
  };
}

export function validateJobInput(data: Record<string, unknown>): ValidationResult<Record<string, unknown>> {
  const fieldErrors: Record<string, string> = {};
  const sanitized: Record<string, unknown> = {};
  const { JOB } = SECURITY_CONFIG.VALIDATION;

  const titleRes = validateTextLength(data.title, JOB.TITLE_MIN, JOB.TITLE_MAX, 'Job Title', true);
  if (!titleRes.isValid) fieldErrors.title = titleRes.error!;
  else sanitized.title = titleRes.sanitizedValue;

  const descRes = validateTextLength(data.description, JOB.DESC_MIN, JOB.DESC_MAX, 'Job Description', false);
  if (!descRes.isValid) fieldErrors.description = descRes.error!;
  else sanitized.description = descRes.sanitizedValue;

  const reqRes = validateTextLength(data.requirements, 0, JOB.REQ_MAX, 'Requirements', false);
  if (!reqRes.isValid) fieldErrors.requirements = reqRes.error!;
  else sanitized.requirements = reqRes.sanitizedValue;

  const salRes = validateTextLength(data.salary_package, 0, JOB.SALARY_MAX, 'Salary Package', false);
  if (!salRes.isValid) fieldErrors.salary_package = salRes.error!;
  else sanitized.salary_package = salRes.sanitizedValue;

  const locRes = validateTextLength(data.location, 0, JOB.LOCATION_MAX, 'Location', false);
  if (!locRes.isValid) fieldErrors.location = locRes.error!;
  else sanitized.location = locRes.sanitizedValue;

  if (data.status !== undefined) {
    if (data.status !== 'OPEN' && data.status !== 'CLOSED') {
      fieldErrors.status = 'Status must be either OPEN or CLOSED.';
    } else {
      sanitized.status = data.status as JobStatus;
    }
  }

  const isValid = Object.keys(fieldErrors).length === 0;
  return {
    isValid,
    error: isValid ? undefined : Object.values(fieldErrors)[0],
    fieldErrors,
    sanitizedValue: sanitized,
  };
}

export function validateApplicationInput(data: Record<string, unknown>): ValidationResult<Record<string, unknown>> {
  const fieldErrors: Record<string, string> = {};
  const sanitized: Record<string, unknown> = {};

  if (!data.student_id || typeof data.student_id !== 'string') {
    fieldErrors.student_id = 'Invalid student identifier.';
  } else {
    sanitized.student_id = data.student_id;
  }

  if (!data.job_id || typeof Number(data.job_id) !== 'number' || isNaN(Number(data.job_id))) {
    fieldErrors.job_id = 'Invalid job identifier.';
  } else {
    sanitized.job_id = Number(data.job_id);
  }

  const clRes = validateTextLength(data.cover_letter, 0, SECURITY_CONFIG.VALIDATION.APPLICATION.COVER_LETTER_MAX, 'Cover Letter', false);
  if (!clRes.isValid) fieldErrors.cover_letter = clRes.error!;
  else sanitized.cover_letter = clRes.sanitizedValue;

  sanitized.resume_path = typeof data.resume_path === 'string' ? data.resume_path.trim() : '';

  const isValid = Object.keys(fieldErrors).length === 0;
  return {
    isValid,
    error: isValid ? undefined : Object.values(fieldErrors)[0],
    fieldErrors,
    sanitizedValue: sanitized,
  };
}

export function validateFeedbackInput(data: Record<string, unknown>): ValidationResult<Record<string, unknown>> {
  const fieldErrors: Record<string, string> = {};
  const sanitized: Record<string, unknown> = {};
  const { FEEDBACK } = SECURITY_CONFIG.VALIDATION;

  const contentRes = validateTextLength(data.content, FEEDBACK.CONTENT_MIN, FEEDBACK.CONTENT_MAX, 'Assessment Summary', true);
  if (!contentRes.isValid) fieldErrors.content = contentRes.error!;
  else sanitized.content = contentRes.sanitizedValue;

  const commentsRes = validateTextLength(data.comments, 0, FEEDBACK.COMMENTS_MAX, 'Recommendations', false);
  if (!commentsRes.isValid) fieldErrors.comments = commentsRes.error!;
  else sanitized.comments = commentsRes.sanitizedValue;

  sanitized.type = (data.type as FeedbackType) || 'APPLICATION';
  sanitized.from_user_id = data.from_user_id;
  sanitized.to_entity_id = Number(data.to_entity_id);

  const isValid = Object.keys(fieldErrors).length === 0;
  return {
    isValid,
    error: isValid ? undefined : Object.values(fieldErrors)[0],
    fieldErrors,
    sanitizedValue: sanitized,
  };
}

export function validateInstitutionInput(data: Record<string, unknown>): ValidationResult<Record<string, unknown>> {
  const fieldErrors: Record<string, string> = {};
  const sanitized: Record<string, unknown> = {};
  const { INSTITUTION } = SECURITY_CONFIG.VALIDATION;

  const nameRes = validateTextLength(data.name, INSTITUTION.NAME_MIN, INSTITUTION.NAME_MAX, 'Institution Name', true);
  if (!nameRes.isValid) fieldErrors.name = nameRes.error!;
  else sanitized.name = nameRes.sanitizedValue;

  const addrRes = validateTextLength(data.address, 0, INSTITUTION.ADDRESS_MAX, 'Campus Address', false);
  if (!addrRes.isValid) fieldErrors.address = addrRes.error!;
  else sanitized.address = addrRes.sanitizedValue;

  const isValid = Object.keys(fieldErrors).length === 0;
  return {
    isValid,
    error: isValid ? undefined : Object.values(fieldErrors)[0],
    fieldErrors,
    sanitizedValue: sanitized,
  };
}

export function validateDepartmentInput(data: Record<string, unknown>): ValidationResult<Record<string, unknown>> {
  const fieldErrors: Record<string, string> = {};
  const sanitized: Record<string, unknown> = {};
  const { DEPARTMENT } = SECURITY_CONFIG.VALIDATION;

  const nameRes = validateTextLength(data.name, DEPARTMENT.NAME_MIN, DEPARTMENT.NAME_MAX, 'Department Name', true);
  if (!nameRes.isValid) fieldErrors.name = nameRes.error!;
  else sanitized.name = nameRes.sanitizedValue;

  if (!data.institution_id || isNaN(Number(data.institution_id)) || Number(data.institution_id) <= 0) {
    fieldErrors.institution_id = 'Please select a valid partner institution.';
  } else {
    sanitized.institution_id = Number(data.institution_id);
  }

  const isValid = Object.keys(fieldErrors).length === 0;
  return {
    isValid,
    error: isValid ? undefined : Object.values(fieldErrors)[0],
    fieldErrors,
    sanitizedValue: sanitized,
  };
}
