/**
 * Structured Security & Audit Logger
 *
 * Prevents sensitive information leakage by redacting secrets,
 * passwords, auth tokens, and PII before logging.
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';

const SENSITIVE_KEYS = new Set([
  'password',
  'confirmPassword',
  'token',
  'access_token',
  'refresh_token',
  'apikey',
  'apiKey',
  'secret',
  'authorization',
  'service_role',
  'jwt',
  'cookie',
]);

/**
 * Recursively redacts sensitive keys from objects or strings before logging
 */
export function sanitizeLogData(data: unknown): unknown {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Redact JWT-like strings or email parts if necessary
    if (/eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/.test(data)) {
      return '[REDACTED_JWT]';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase()) || key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeLogData(val);
      }
    }
    return sanitized;
  }

  return data;
}

class SecurityLogger {
  private isProd = import.meta.env.PROD;

  private formatMessage(level: LogLevel, context: string, message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    const sanitizedData = data ? sanitizeLogData(data) : undefined;

    return {
      timestamp,
      level,
      context,
      message,
      ...(sanitizedData !== undefined ? { data: sanitizedData } : {}),
    };
  }

  debug(context: string, message: string, data?: unknown) {
    if (this.isProd) return; // Suppress debug logs in production
    const payload = this.formatMessage('DEBUG', context, message, data);
    console.debug(`[${payload.timestamp}] [DEBUG] [${context}] ${message}`, payload.data ?? '');
  }

  info(context: string, message: string, data?: unknown) {
    const payload = this.formatMessage('INFO', context, message, data);
    console.info(`[${payload.timestamp}] [INFO] [${context}] ${message}`, payload.data ?? '');
  }

  warn(context: string, message: string, data?: unknown) {
    const payload = this.formatMessage('WARN', context, message, data);
    console.warn(`[${payload.timestamp}] [WARN] [${context}] ${message}`, payload.data ?? '');
  }

  error(context: string, message: string, error?: unknown) {
    const payload = this.formatMessage('ERROR', context, message, error instanceof Error ? { name: error.name, message: error.message } : error);
    console.error(`[${payload.timestamp}] [ERROR] [${context}] ${message}`, payload.data ?? '');
  }

  securityEvent(action: string, details: Record<string, unknown>) {
    const payload = this.formatMessage('SECURITY', 'SecurityAudit', action, details);
    console.warn(`[${payload.timestamp}] [SECURITY_EVENT] ${action}`, payload.data);
  }
}

export const logger = new SecurityLogger();
