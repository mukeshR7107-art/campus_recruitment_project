/**
 * Error Sanitization and Information Leakage Defense
 *
 * Intercepts raw database, authentication, and network errors,
 * converting them into generic, user-safe messages while logging
 * structured redacted details for developer debugging.
 */

import { logger } from './logger';

export interface AppError {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string>;
  isSecurityBlocked?: boolean;
}

/**
 * Sanitizes any raw exception or Supabase error into a clean, safe AppError.
 */
export function sanitizeError(rawError: unknown, defaultMessage = 'An unexpected error occurred. Please try again.'): AppError {
  if (!rawError) {
    return { message: defaultMessage };
  }

  // Handle known string errors
  if (typeof rawError === 'string') {
    return sanitizeErrorMessage(rawError, defaultMessage);
  }

  const err = rawError as Record<string, unknown>;
  const code = typeof err.code === 'string' ? err.code : '';
  const message = typeof err.message === 'string' ? err.message : '';
  const details = typeof err.details === 'string' ? err.details : '';

  // Log raw details server/console-side with sensitive fields redacted
  logger.error('ErrorHandler', 'Exception intercepted', { code, message, details });

  // ── PostgreSQL / Database Error Mapping ───────────────────────────────────
  // 23505: Unique violation (e.g. duplicate email, duplicate application)
  if (code === '23505' || message.includes('duplicate key') || message.includes('already exists')) {
    if (message.includes('applications_student_id_job_id_key') || message.includes('applications')) {
      return { message: 'You have already submitted an application for this job posting.', code: 'DUPLICATE_APPLICATION' };
    }
    if (message.includes('profiles') || message.includes('email')) {
      return { message: 'An account with this email address is already registered.', code: 'DUPLICATE_EMAIL' };
    }
    return { message: 'This record already exists in the system.', code: 'DUPLICATE_RECORD' };
  }

  // 23503: Foreign key violation
  if (code === '23503') {
    return { message: 'The referenced item could not be found or has been removed.', code: 'FOREIGN_KEY_VIOLATION' };
  }

  // 23514: Check constraint violation
  if (code === '23514') {
    return { message: 'Submitted data did not pass database security constraints.', code: 'CHECK_VIOLATION' };
  }

  // 42501: Insufficient privilege / RLS failure
  if (code === '42501' || message.includes('row-level security') || message.includes('permission denied')) {
    return { message: 'You do not have authorization to perform this action.', code: 'FORBIDDEN' };
  }

  // ── Supabase Auth Error Mapping ───────────────────────────────────────────
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('invalid login credentials') || lowerMsg.includes('invalid credentials') || lowerMsg.includes('invalid_grant')) {
    return { message: 'Invalid email or password. Please verify your credentials.', code: 'INVALID_CREDENTIALS' };
  }

  if (lowerMsg.includes('user already registered') || lowerMsg.includes('already registered')) {
    return { message: 'An account with this email address already exists.', code: 'USER_EXISTS' };
  }

  if (lowerMsg.includes('email not confirmed')) {
    return { message: 'Please check your inbox and verify your email before signing in.', code: 'EMAIL_UNCONFIRMED' };
  }

  if (lowerMsg.includes('rate limit') || lowerMsg.includes('too many requests') || lowerMsg.includes('over_email_send_rate_limit')) {
    return { message: 'Too many requests. Please wait a few moments before trying again.', code: 'RATE_LIMIT_EXCEEDED', isSecurityBlocked: true };
  }

  // ── Network & Connection Errors ───────────────────────────────────────────
  if (lowerMsg.includes('fetch') || lowerMsg.includes('network') || lowerMsg.includes('failed to fetch')) {
    return { message: 'Unable to connect to the server. Please check your internet connection.', code: 'NETWORK_ERROR' };
  }

  // Fallback to sanitized message if it doesn't leak internals
  return sanitizeErrorMessage(message, defaultMessage);
}

function sanitizeErrorMessage(msg: string, defaultMessage: string): AppError {
  // Check if message leaks internal file paths or database structure
  const leaksInternals = 
    msg.includes('SELECT') ||
    msg.includes('INSERT') ||
    msg.includes('UPDATE') ||
    msg.includes('DELETE') ||
    msg.includes('FROM public.') ||
    msg.includes('auth.users') ||
    msg.includes('.ts:') ||
    msg.includes('.js:') ||
    msg.includes('\\') ||
    msg.includes('/src/');

  if (leaksInternals) {
    return { message: defaultMessage, code: 'INTERNAL_ERROR' };
  }

  return { message: msg || defaultMessage };
}
