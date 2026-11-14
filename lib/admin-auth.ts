import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextResponse } from "next/server";

const sessionCookie = "rec-admin-session";
const userCookie = "rec-admin-user";
const memberCookie = "rec-admin-member";
const stateCookie = "rec-oauth-state";
const sessionLifetimeSeconds = 60 * 60 * 8; // 8 hours

// Universal fallback secret if user hasn't set ADMIN_SESSION_SECRET in Vercel environment variables
const fallbackSecret = "27-creative-studio-admin-secure-hmac-session-secret-key-32chars";

export function getBaseUrl(request: Request): string {
  // Check headers from reverse proxy / Vercel first
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (request.url.startsWith("https") ? "https" : "http");
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host");

  if (host) {
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

export function googleAuthConfigured() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return Boolean(
    clientId &&
      !clientId.includes("your-") &&
      clientSecret &&
      !clientSecret.includes("your-"),
  );
}

export function isAllowedGoogleEmail(email: string): boolean {
  if (!email) return false;
  const allowed = process.env.ADMIN_ALLOWED_EMAILS;
  // If no allowed list is explicitly configured, allow any authenticated Google user
  if (!allowed || !allowed.trim()) return true;

  const allowedList = allowed
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowedList.includes(email.toLowerCase().trim());
}

export function adminAuthConfigured() {
  const hasPassword = Boolean(
    process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 8,
  );
  const hasGoogle = googleAuthConfigured();
  return Boolean(hasPassword || hasGoogle);
}

export function adminPasswordMatches(password: string) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword || !adminAuthConfigured()) return false;

  const submittedHash = createHash("sha256").update(password).digest();
  const configuredHash = createHash("sha256")
    .update(configuredPassword)
    .digest();
  return timingSafeEqual(submittedHash, configuredHash);
}

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET?.trim() || fallbackSecret;
}

function sign(value: string) {
  const secret = getSecret();
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function setAdminSession(response: NextResponse, userEmail?: string, memberId?: string) {
  const expiresAt = String(
    Math.floor(Date.now() / 1000) + sessionLifetimeSeconds,
  );
  response.cookies.set(sessionCookie, `${expiresAt}.${sign(expiresAt)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // 'lax' is required for Google OAuth redirects across origins
    path: "/",
    maxAge: sessionLifetimeSeconds,
  });

  if (userEmail) {
    response.cookies.set(userCookie, userEmail, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionLifetimeSeconds,
    });
  }

  if (memberId) {
    response.cookies.set(memberCookie, memberId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionLifetimeSeconds,
    });
  }
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set(sessionCookie, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(userCookie, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(memberCookie, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return cookie?.slice(name.length + 1);
}

export function getAdminUser(request: Request): string | null {
  return readCookie(request, userCookie) || null;
}

export function getAdminMemberId(request: Request): string | null {
  return readCookie(request, memberCookie) || null;
}

export function isAdminRequest(request: Request) {
  if (!adminAuthConfigured()) return false;
  const value = readCookie(request, sessionCookie);
  if (!value) return false;

  const [expiresAt, suppliedSignature] = value.split(".");
  if (!expiresAt || !suppliedSignature) return false;
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) <= Date.now() / 1000)
    return false;

  const expectedSignature = sign(expiresAt);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

// OAuth State token helper for CSRF prevention & return path preservation
const returnToCookie = "rec-oauth-return";

export function sanitizeReturnTo(path?: string | null): string {
  if (!path) return "/admin";
  const trimmed = path.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\")) {
    return trimmed;
  }
  return "/admin";
}

export function generateOAuthState(response: NextResponse, returnTo?: string): string {
  const nonce = randomBytes(24).toString("hex");
  const target = sanitizeReturnTo(returnTo);
  const encodedTarget = Buffer.from(target).toString("base64url");
  const state = `${nonce}.${encodedTarget}`;

  response.cookies.set(stateCookie, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutes
  });

  response.cookies.set(returnToCookie, target, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  return state;
}

export function verifyOAuthState(
  request: Request,
  suppliedState: string
): { valid: boolean; returnTo: string } {
  const defaultReturn = sanitizeReturnTo(readCookie(request, returnToCookie) || "/admin");
  if (!suppliedState) return { valid: false, returnTo: defaultReturn };

  const savedNonce = readCookie(request, stateCookie);
  if (!savedNonce) return { valid: false, returnTo: defaultReturn };

  // Handle both compound state: "nonce.encodedReturnTo" and plain nonce string
  const dotIndex = suppliedState.indexOf(".");
  if (dotIndex !== -1) {
    const nonce = suppliedState.slice(0, dotIndex);
    const encodedReturn = suppliedState.slice(dotIndex + 1);
    if (nonce !== savedNonce) {
      return { valid: false, returnTo: defaultReturn };
    }
    try {
      const decoded = Buffer.from(encodedReturn, "base64url").toString("utf-8");
      return { valid: true, returnTo: sanitizeReturnTo(decoded) };
    } catch {
      return { valid: true, returnTo: defaultReturn };
    }
  }

  // Plain nonce fallback
  if (suppliedState === savedNonce) {
    return { valid: true, returnTo: defaultReturn };
  }

  return { valid: false, returnTo: defaultReturn };
}
