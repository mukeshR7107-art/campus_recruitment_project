/**
 * Centralized Security Configuration
 *
 * Configurable thresholds and policy limits for rate limiting,
 * input validation, file uploads, and error handling.
 * Values can be overridden using environment variables (VITE_RATE_LIMIT_*, etc.).
 */

const getEnvNumber = (key: string, defaultValue: number): number => {
  const envVal = import.meta.env[key];
  if (envVal !== undefined && envVal !== '') {
    const parsed = Number(envVal);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return defaultValue;
};

export const SECURITY_CONFIG = {
  // ── Rate Limiting Thresholds (Configurable) ───────────────────────────────
  RATE_LIMIT: {
    // Authentication Routes (Login, Signup, Password Reset)
    AUTH: {
      WINDOW_MS: getEnvNumber('VITE_RATE_LIMIT_AUTH_WINDOW_MS', 15 * 60 * 1000), // 15 minutes
      MAX_ATTEMPTS_BEFORE_BACKOFF: getEnvNumber('VITE_RATE_LIMIT_AUTH_MAX_ATTEMPTS', 3), // Backoff starts after 3 failed attempts
      BASE_BACKOFF_SECONDS: getEnvNumber('VITE_RATE_LIMIT_AUTH_BASE_BACKOFF_SEC', 2), // 2 seconds base
      MAX_BACKOFF_SECONDS: getEnvNumber('VITE_RATE_LIMIT_AUTH_MAX_BACKOFF_SEC', 60), // 60 seconds max per single retry
      MAX_TOTAL_FAILED_ATTEMPTS: getEnvNumber('VITE_RATE_LIMIT_AUTH_MAX_TOTAL_FAIL', 10), // Maximum failed attempts in window
    },
    // Public Endpoints (Jobs browsing, Landing queries, Public lists)
    PUBLIC: {
      WINDOW_MS: getEnvNumber('VITE_RATE_LIMIT_PUBLIC_WINDOW_MS', 60 * 1000), // 1 minute
      MAX_REQUESTS: getEnvNumber('VITE_RATE_LIMIT_PUBLIC_MAX_REQ', 60), // 60 requests/minute
    },
    // Authenticated User Actions (Apply, Post Job, Edit Profile, Status Update)
    AUTHENTICATED: {
      WINDOW_MS: getEnvNumber('VITE_RATE_LIMIT_USER_WINDOW_MS', 60 * 1000), // 1 minute
      MAX_REQUESTS: getEnvNumber('VITE_RATE_LIMIT_USER_MAX_REQ', 120), // 120 requests/minute
      BURST_LIMIT: getEnvNumber('VITE_RATE_LIMIT_USER_BURST', 30), // Max 30 requests in 10s window
    },
    // File Upload Actions
    FILE_UPLOAD: {
      WINDOW_MS: getEnvNumber('VITE_RATE_LIMIT_UPLOAD_WINDOW_MS', 10 * 60 * 1000), // 10 minutes
      MAX_UPLOADS: getEnvNumber('VITE_RATE_LIMIT_UPLOAD_MAX', 6), // 6 file uploads per 10 minutes
    },
  },

  // ── Input Validation Constraints ──────────────────────────────────────────
  VALIDATION: {
    EMAIL: {
      MAX_LENGTH: 254,
    },
    PASSWORD: {
      MIN_LENGTH: 8,
      MAX_LENGTH: 128,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBER: true,
      REQUIRE_SPECIAL: true,
    },
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 100,
    },
    PHONE: {
      MIN_LENGTH: 7,
      MAX_LENGTH: 20,
    },
    URL: {
      MAX_LENGTH: 2048,
      ALLOWED_PROTOCOLS: ['http:', 'https:'],
    },
    CGPA: {
      MIN: 0.00,
      MAX: 10.00,
    },
    JOB: {
      TITLE_MIN: 3,
      TITLE_MAX: 150,
      DESC_MIN: 10,
      DESC_MAX: 5000,
      REQ_MAX: 3000,
      SALARY_MAX: 100,
      LOCATION_MAX: 150,
    },
    APPLICATION: {
      COVER_LETTER_MAX: 3000,
    },
    FEEDBACK: {
      CONTENT_MIN: 5,
      CONTENT_MAX: 3000,
      COMMENTS_MAX: 2000,
    },
    INSTITUTION: {
      NAME_MIN: 2,
      NAME_MAX: 150,
      ADDRESS_MAX: 250,
    },
    DEPARTMENT: {
      NAME_MIN: 2,
      NAME_MAX: 100,
    },
  },

  // ── File Upload Safety Constraints ────────────────────────────────────────
  FILE_UPLOAD: {
    MAX_SIZE_BYTES: getEnvNumber('VITE_MAX_UPLOAD_SIZE_BYTES', 5 * 1024 * 1024), // 5 MB
    ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.doc'] as const,
    ALLOWED_MIME_TYPES: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ] as const,
    DANGEROUS_EXTENSIONS: [
      '.exe', '.bat', '.sh', '.cmd', '.com', '.php', '.phtml', '.pl', '.py',
      '.js', '.mjs', '.cjs', '.vbs', '.scr', '.jar', '.svg', '.html', '.htm',
      '.xhtml', '.asp', '.aspx', '.jsp', '.cgi', '.dll', '.bin', '.wsf',
    ] as const,
    STORAGE_BUCKET: 'resumes',
  },
} as const;
