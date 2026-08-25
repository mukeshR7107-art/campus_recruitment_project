/**
 * Rate Limiter Engine with Exponential Backoff
 *
 * Implements tiered rate limiting:
 * 1. Stricter authentication limiting with combined per-account & per-client exponential backoff
 * 2. Moderate sliding-window limits on public routes
 * 3. Looser limits on authenticated user actions
 * 4. Dedicated limits on file upload actions
 */

import { SECURITY_CONFIG } from './securityConfig';
import { logger } from './logger';

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
  remainingAttempts?: number;
  message?: string;
}

interface AuthAttemptRecord {
  failedAttempts: number;
  lastAttemptTime: number;
  lockoutUntil: number;
}

interface SlidingWindowRecord {
  timestamps: number[];
}

const AUTH_STORAGE_KEY_PREFIX = 'crms_rl_auth_';
const CLIENT_STORAGE_KEY = 'crms_rl_client_id';

/**
 * Returns or initializes an ephemeral anonymous client fingerprint identifier
 */
export function getClientIdentifier(): string {
  try {
    let clientId = sessionStorage.getItem(CLIENT_STORAGE_KEY);
    if (!clientId) {
      clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem(CLIENT_STORAGE_KEY, clientId);
    }
    return clientId;
  } catch {
    return 'fallback_client_id';
  }
}

/**
 * Normalizes email or identifier for per-account rate tracking
 */
function normalizeIdentifier(rawIdentifier: string): string {
  return rawIdentifier.trim().toLowerCase();
}

/**
 * Read auth attempt record from storage
 */
function getAuthRecord(key: string): AuthAttemptRecord {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY_PREFIX + key);
    if (!raw) return { failedAttempts: 0, lastAttemptTime: 0, lockoutUntil: 0 };
    const parsed = JSON.parse(raw) as AuthAttemptRecord;
    
    // Check if the overall window has expired
    const now = Date.now();
    if (now - parsed.lastAttemptTime > SECURITY_CONFIG.RATE_LIMIT.AUTH.WINDOW_MS) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY_PREFIX + key);
      return { failedAttempts: 0, lastAttemptTime: 0, lockoutUntil: 0 };
    }
    return parsed;
  } catch {
    return { failedAttempts: 0, lastAttemptTime: 0, lockoutUntil: 0 };
  }
}

/**
 * Persist auth attempt record to storage
 */
function saveAuthRecord(key: string, record: AuthAttemptRecord): void {
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY_PREFIX + key, JSON.stringify(record));
  } catch {
    // Graceful fallback if storage unavailable
  }
}

// In-memory sliding window state for general API calls
const slidingWindowStore = new Map<string, SlidingWindowRecord>();

export class RateLimiter {
  /**
   * Evaluates exponential backoff for an authentication attempt (Login/Signup/Password Reset).
   * Checks both the specific account identifier AND the client device/session.
   */
  static checkAuthLimit(rawIdentifier: string): RateLimitResult {
    const now = Date.now();
    const accountKey = `acc_${normalizeIdentifier(rawIdentifier)}`;
    const clientKey = `cli_${getClientIdentifier()}`;

    const accountRecord = getAuthRecord(accountKey);
    const clientRecord = getAuthRecord(clientKey);

    // Determine the highest active backoff between account and client
    const activeLockout = Math.max(accountRecord.lockoutUntil, clientRecord.lockoutUntil);

    if (now < activeLockout) {
      const retryAfterSeconds = Math.ceil((activeLockout - now) / 1000);
      logger.securityEvent('AUTH_RATE_LIMIT_BLOCKED', {
        identifier: rawIdentifier,
        retryAfterSeconds,
        failedAttempts: Math.max(accountRecord.failedAttempts, clientRecord.failedAttempts),
      });

      return {
        allowed: false,
        retryAfterSeconds,
        message: `Too many attempts. Please wait ${retryAfterSeconds} second${retryAfterSeconds === 1 ? '' : 's'} before trying again.`,
      };
    }

    const maxAttempts = SECURITY_CONFIG.RATE_LIMIT.AUTH.MAX_ATTEMPTS_BEFORE_BACKOFF;
    const currentFailed = Math.max(accountRecord.failedAttempts, clientRecord.failedAttempts);
    const remaining = Math.max(0, maxAttempts - currentFailed);

    return {
      allowed: true,
      retryAfterSeconds: 0,
      remainingAttempts: remaining,
    };
  }

  /**
   * Records a failed authentication attempt and calculates the next exponential backoff delay.
   */
  static recordAuthFailure(rawIdentifier: string): { backoffSeconds: number; failedAttempts: number } {
    const now = Date.now();
    const accountKey = `acc_${normalizeIdentifier(rawIdentifier)}`;
    const clientKey = `cli_${getClientIdentifier()}`;

    const accountRecord = getAuthRecord(accountKey);
    const clientRecord = getAuthRecord(clientKey);

    const newAttempts = Math.max(accountRecord.failedAttempts, clientRecord.failedAttempts) + 1;
    const config = SECURITY_CONFIG.RATE_LIMIT.AUTH;

    let backoffSeconds = 0;
    if (newAttempts >= config.MAX_ATTEMPTS_BEFORE_BACKOFF) {
      // Exponential backoff formula: base * 2^(attempts - threshold)
      const exponent = newAttempts - config.MAX_ATTEMPTS_BEFORE_BACKOFF;
      const calculatedDelay = config.BASE_BACKOFF_SECONDS * Math.pow(2, exponent);
      backoffSeconds = Math.min(calculatedDelay, config.MAX_BACKOFF_SECONDS);
    }

    const lockoutUntil = now + (backoffSeconds * 1000);
    const updatedRecord: AuthAttemptRecord = {
      failedAttempts: newAttempts,
      lastAttemptTime: now,
      lockoutUntil,
    };

    saveAuthRecord(accountKey, updatedRecord);
    saveAuthRecord(clientKey, updatedRecord);

    logger.securityEvent('AUTH_FAILURE_RECORDED', {
      identifier: rawIdentifier,
      newAttempts,
      backoffSeconds,
    });

    return { backoffSeconds, failedAttempts: newAttempts };
  }

  /**
   * Resets rate limiting state on successful authentication
   */
  static recordAuthSuccess(rawIdentifier: string): void {
    const accountKey = `acc_${normalizeIdentifier(rawIdentifier)}`;
    const clientKey = `cli_${getClientIdentifier()}`;

    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY_PREFIX + accountKey);
      sessionStorage.removeItem(AUTH_STORAGE_KEY_PREFIX + clientKey);
      logger.info('RateLimiter', 'Auth rate limit reset on successful login', { identifier: rawIdentifier });
    } catch {
      // No-op
    }
  }

  /**
   * Checks generic sliding window for public, user actions, or uploads
   */
  static checkSlidingWindow(
    bucketKey: string,
    windowMs: number,
    maxRequests: number,
    endpointName = 'Endpoint'
  ): RateLimitResult {
    const now = Date.now();
    const clientKey = `${bucketKey}_${getClientIdentifier()}`;
    
    let record = slidingWindowStore.get(clientKey);
    if (!record) {
      record = { timestamps: [] };
      slidingWindowStore.set(clientKey, record);
    }

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0];
      const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
      
      logger.securityEvent('SLIDING_WINDOW_RATE_LIMIT_BLOCKED', {
        bucket: bucketKey,
        currentCount: record.timestamps.length,
        maxRequests,
        retryAfterSeconds,
      });

      return {
        allowed: false,
        retryAfterSeconds,
        message: `${endpointName} limit exceeded. Please wait ${retryAfterSeconds}s before retrying.`,
      };
    }

    record.timestamps.push(now);
    return {
      allowed: true,
      retryAfterSeconds: 0,
      remainingAttempts: maxRequests - record.timestamps.length,
    };
  }

  /**
   * Check public endpoint rate limit
   */
  static checkPublicRoute(): RateLimitResult {
    const { WINDOW_MS, MAX_REQUESTS } = SECURITY_CONFIG.RATE_LIMIT.PUBLIC;
    return this.checkSlidingWindow('public', WINDOW_MS, MAX_REQUESTS, 'Public request');
  }

  /**
   * Check authenticated user action rate limit
   */
  static checkAuthenticatedAction(userId: string): RateLimitResult {
    const { WINDOW_MS, MAX_REQUESTS } = SECURITY_CONFIG.RATE_LIMIT.AUTHENTICATED;
    return this.checkSlidingWindow(`user_${userId}`, WINDOW_MS, MAX_REQUESTS, 'Action');
  }

  /**
   * Check file upload rate limit
   */
  static checkFileUpload(userId: string): RateLimitResult {
    const { WINDOW_MS, MAX_UPLOADS } = SECURITY_CONFIG.RATE_LIMIT.FILE_UPLOAD;
    return this.checkSlidingWindow(`upload_${userId}`, WINDOW_MS, MAX_UPLOADS, 'File upload');
  }
}
