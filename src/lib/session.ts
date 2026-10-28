import { cookies } from "next/headers";
import crypto from "crypto";

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  department: string;
  role: "EMPLOYEE" | "IT_ADMIN" | "FINOPS_AUDITOR";
  rfidBadgeId: string;
}

const SESSION_COOKIE_NAME = "kioskdrop_session";
const SESSION_SECRET =
  process.env.SESSION_SECRET || "kioskdrop-session-secret-key-32charsmin-abc123";

export const DEFAULT_EMPLOYEE_SESSION: UserSession = {
  userId: "usr_emp_01",
  name: "Aarav Sharma",
  email: "aarav.sharma@enterprise.corp",
  department: "Sales & Strategic Accounts",
  role: "EMPLOYEE",
  rfidBadgeId: "RFID-EMP-8821",
};

export class UnauthorizedError extends Error {
  constructor(message: string = "Authentication required.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = "Access denied. Insufficient permissions.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Creates a signed session string: payloadBase64.signature
 */
export function signSession(session: UserSession): string {
  const payloadStr = JSON.stringify(session);
  const payloadB64 = Buffer.from(payloadStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${signature}`;
}

/**
 * Verifies and decodes a signed session string.
 */
export function verifySession(token: string): UserSession | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;

    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadB64)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

    const payloadStr = Buffer.from(payloadB64, "base64url").toString("utf8");
    return JSON.parse(payloadStr) as UserSession;
  } catch {
    return null;
  }
}

/**
 * Retrieves the active session from server cookies, defaulting to Aarav Sharma (EMPLOYEE).
 */
export async function getSession(): Promise<UserSession> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      const decoded = verifySession(token);
      if (decoded) return decoded;
    }
  } catch {
    // In Route Handlers or test environments where cookies() might not be populated
  }
  return DEFAULT_EMPLOYEE_SESSION;
}

/**
 * Enforces role-based access control (RBAC) on the server.
 */
export async function requireRole(allowedRoles: ("EMPLOYEE" | "IT_ADMIN" | "FINOPS_AUDITOR")[]): Promise<UserSession> {
  const session = await getSession();
  if (!allowedRoles.includes(session.role)) {
    throw new ForbiddenError(
      `Role '${session.role}' is not authorized to perform this operation. Allowed: ${allowedRoles.join(", ")}`
    );
  }
  return session;
}
