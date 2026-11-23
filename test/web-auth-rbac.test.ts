import { describe, it, expect } from "vitest";
import { signSession, verifySession, requireRole, DEFAULT_EMPLOYEE_SESSION, ForbiddenError } from "@/lib/session";

describe("Web RBAC & Session Token Validation", () => {
  it("generates and verifies signed HMAC-SHA256 session token", () => {
    const token = signSession(DEFAULT_EMPLOYEE_SESSION);
    const decoded = verifySession(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe("usr_emp_01");
    expect(decoded?.role).toBe("EMPLOYEE");
  });

  it("rejects tampered session tokens", () => {
    const token = signSession(DEFAULT_EMPLOYEE_SESSION);
    const tampered = token.slice(0, -4) + "XXXX";
    const decoded = verifySession(tampered);
    expect(decoded).toBeNull();
  });

  it("enforces allowed roles in requireRole", async () => {
    // Should succeed for EMPLOYEE since default session is EMPLOYEE
    const session = await requireRole(["EMPLOYEE", "IT_ADMIN"]);
    expect(session.role).toBe("EMPLOYEE");
  });

  it("throws ForbiddenError if role is not allowed", async () => {
    await expect(requireRole(["IT_ADMIN"])).rejects.toThrow(ForbiddenError);
  });
});

