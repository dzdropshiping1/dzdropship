import crypto from 'crypto';
import { cookies } from 'next/headers';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dzdropship-secure-session-fallback-secret-key-135';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  createdAt: number;
}

/**
 * Hashes a password using PBKDF2 with a random salt.
 * Returns the hash in the format: salt:hash
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a password against a stored hashed password.
 */
export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch {
    return false;
  }
}

/**
 * Creates a cryptographically signed session token.
 */
export function createSessionToken(payload: Omit<SessionPayload, 'createdAt'>): string {
  const fullPayload: SessionPayload = {
    ...payload,
    createdAt: Date.now(),
  };

  const payloadStr = Buffer.from(JSON.stringify(fullPayload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadStr)
    .digest('hex');

  return `${payloadStr}.${signature}`;
}

/**
 * Verifies a cryptographically signed session token.
 */
export function verifySession(token: string): SessionPayload | null {
  try {
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadStr)
      .digest('hex');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64').toString('utf-8')) as SessionPayload;
    
    // Set session expiration to 7 days
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.createdAt > sevenDaysInMs) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Gets the current authenticated user session in Server Components or API Routes.
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (!sessionCookie || !sessionCookie.value) return null;
    return verifySession(sessionCookie.value);
  } catch {
    return null;
  }
}
