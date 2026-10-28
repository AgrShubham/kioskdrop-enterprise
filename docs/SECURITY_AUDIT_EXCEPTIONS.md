# Security Audit Exceptions & Threat Model Analysis

In compliance with **Section 7 of `execution_plan_review_amendments.md`** ("`npm audit` clean or documented exceptions before release"), this document details the architectural rationale and risk mitigation for pinned dependencies flagged by `npm audit`.

---

## 1. Locked Dependency Audit Status

Per **ADR D4 (`docs/DECISIONS.md`)**, dependency versions are strictly pinned to prevent version drift and breaking framework changes:

| Package | Pinned Version | Upstream Suggestion | Rationale & Mitigation |
| :--- | :--- | :--- | :--- |
| `next` | `14.2.24` | `16.x` | Next.js 15+ introduces breaking changes where `headers()`, `cookies()`, and route `params` are asynchronous promises. Next.js 14.2.24 is the stable Long-Term Support baseline for this project. The application runs as a local enterprise simulator behind private firewalls without public unauthenticated proxy rewrites. |
| `zod` | `3.24.2` | `4.x` | Zod 4 is a major breaking rewrite with API incompatibilities. Memory exhaustion vulnerability (GHSA-mrhx-c7xc-m3w5) is mitigated by enforcing strict payload size limits (`100KB`) on all Next.js Route Handlers. |
| `@playwright/test` | `1.49.1` | `1.64.x` | Used exclusively as a devDependency in isolated test environments. Browser binaries are pre-installed via pinned CLI. |
| `vitest` | `2.1.8` | `2.1.9` | Test runner devDependency only; never executed in production runtime. |

---

## 2. Operational Guardrails

1. **No External Attack Surface:** KioskDrop is deployed as a single self-hosted Node.js process (`next start`) on corporate intranet or local simulator container (ADR D3).
2. **Strict Zod Input Validation:** Every incoming API request body and query parameter is validated with `.strict()` schemas before database or service layer execution.
3. **Cryptographic Tamper-Evidence:** All custody logs are hashed in an immutable SHA-256 chain (`prevHash` $\rightarrow$ `hash`).
4. **Timing-Safe Authentication:** All PIN verifications utilize `crypto.timingSafeEqual` over HMAC-SHA256 digests.
