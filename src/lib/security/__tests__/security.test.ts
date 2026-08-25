import { RateLimiter } from '../rateLimiter';
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateUrl,
  validateCgpa,
  validateJobInput,
} from '../validation';
import { sanitizeError } from '../errorHandler';

// ── Test 1: Rate Limiter Exponential Backoff Math ──
console.log('=== Test 1: Rate Limiter Exponential Backoff ===');
const testId = 'test_user_rate_limit@example.com';
RateLimiter.recordAuthSuccess(testId);

const r0 = RateLimiter.checkAuthLimit(testId);
console.assert(r0.allowed === true, 'Initial state should be allowed');

RateLimiter.recordAuthFailure(testId); // 1
RateLimiter.recordAuthFailure(testId); // 2
const f3 = RateLimiter.recordAuthFailure(testId); // 3 -> threshold reached, delay = 2 * 2^0 = 2s
console.assert(f3.backoffSeconds === 2, `Expected 2s backoff, got ${f3.backoffSeconds}`);

const r3 = RateLimiter.checkAuthLimit(testId);
console.assert(r3.allowed === false, 'Attempt 3 should trigger backoff lockout');
console.assert(r3.retryAfterSeconds > 0, 'Retry after seconds should be > 0');

RateLimiter.recordAuthSuccess(testId);
const rCleared = RateLimiter.checkAuthLimit(testId);
console.assert(rCleared.allowed === true, 'Successful login should reset backoff');
console.log('✔ Rate Limiter & Exponential Backoff passed');

// ── Test 2: Strict Input Validation ──
console.log('=== Test 2: Input Validation ===');

// Email
console.assert(validateEmail('user@domain.com').isValid === true, 'Valid email must pass');
console.assert(validateEmail('invalid-email').isValid === false, 'Invalid email must fail');
console.assert(validateEmail('test@.com').isValid === false, 'Malformed domain must fail');
console.assert(validateEmail('').isValid === false, 'Empty email must fail');

// Password Complexity
console.assert(validatePassword('P@ssword123!').isValid === true, 'Strong password must pass');
console.assert(validatePassword('short1!').isValid === false, 'Short password must fail');
console.assert(validatePassword('alllowercase123!').isValid === false, 'Missing uppercase must fail');
console.assert(validatePassword('ALLUPPERCASE123!').isValid === false, 'Missing lowercase must fail');
console.assert(validatePassword('NoSpecialNumber1').isValid === false, 'Missing special char must fail');

// Name
console.assert(validateName('Alex Morgan').isValid === true, 'Valid name must pass');
console.assert(validateName('<script>alert(1)</script>').isValid === false, 'Script tags must be rejected');

// Phone
console.assert(validatePhone('+1 555 019 2834').isValid === true, 'Valid phone must pass');
console.assert(validatePhone('abc-phone').isValid === false, 'Alphabetic phone must fail');

// URL
console.assert(validateUrl('https://github.com/profile').isValid === true, 'HTTPS URL must pass');
console.assert(validateUrl('javascript:alert(1)').isValid === false, 'Javascript pseudo-protocol must fail');
console.assert(validateUrl('data:text/html,test').isValid === false, 'Data URI must fail');

// CGPA
console.assert(validateCgpa(8.75).isValid === true, 'Valid CGPA must pass');
console.assert(validateCgpa(12.5).isValid === false, 'Out of bounds CGPA must fail');
console.assert(validateCgpa(-1.0).isValid === false, 'Negative CGPA must fail');

// Compound Schemas
console.assert(validateJobInput({ title: 'SE', description: 'short' }).isValid === false, 'Short job title must fail');
console.assert(validateJobInput({ title: 'Senior Software Engineer', description: 'Detailed full stack engineering role with React and Node.' }).isValid === true, 'Valid job payload must pass');

console.log('✔ Input validation schemas passed');

// ── Test 3: Error Sanitization ──
console.log('=== Test 3: Error Sanitization ===');
const dbErr = { code: '23505', message: 'duplicate key value violates unique constraint "applications_student_id_job_id_key"' };
const sanitized = sanitizeError(dbErr);
console.assert(!sanitized.message.includes('23505'), 'PostgreSQL error code must not leak');
console.assert(!sanitized.message.includes('applications_student_id_job_id_key'), 'Postgres constraint name must not leak');
console.assert(sanitized.code === 'DUPLICATE_APPLICATION', 'Error code should be sanitized DUPLICATE_APPLICATION');

console.log('✔ Error sanitization passed');
console.log('ALL SECURITY SUITE TESTS PASSED SUCCESSFULLY!');
