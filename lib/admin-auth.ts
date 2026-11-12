import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextResponse } from "next/server";

const sessionCookie = "rec-admin-session";
const userCookie = "rec-admin-user";
const stateCookie = "rec-oauth-state";
const sessionLifetimeSeconds = 60 * 60 * 8; // 8 hours
const defaultDevSecret = "rec-mode-admin-session-secret-32-chars-fallback";

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
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    (process.env.NODE_ENV !== "production" ? defaultDevSecret : undefined);

  return Boolean((hasPassword || hasGoogle) && secret && secret.length >= 16);
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

function sign(value: string) {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    (process.env.NODE_ENV !== "production" ? defaultDevSecret : undefined);
  if (!secret) throw new Error("Admin session secret is not configured.");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function setAdminSession(response: NextResponse, userEmail?: string) {
  const expiresAt = String(
    Math.floor(Date.now() / 1000) + sessionLifetimeSeconds,
  );
  response.cookies.set(sessionCookie, `${expiresAt}.${sign(expiresAt)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // 'lax' needed for Google OAuth redirects
    path: "/",
    maxAge: sessionLifetimeSeconds,
  });

  if (userEmail) {
    response.cookies.set(userCookie, userEmail, {
      httpOnly: false, // readable by client UI to show user profile email
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

// OAuth State token helper for CSRF prevention
export function generateOAuthState(response: NextResponse): string {
  const state = randomBytes(24).toString("hex");
  response.cookies.set(stateCookie, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });
  return state;
}

export function verifyOAuthState(request: Request, suppliedState: string): boolean {
  if (!suppliedState) return false;
  const savedState = readCookie(request, stateCookie);
  return Boolean(savedState && savedState === suppliedState);
}
