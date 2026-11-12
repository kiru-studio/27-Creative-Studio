import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextResponse } from "next/server";

const sessionCookie = "rec-admin-session";
const userCookie = "rec-admin-user";
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

export function setAdminSession(response: NextResponse, userEmail?: string) {
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
    maxAge: 60 * 15, // 15 minutes
  });
  return state;
}

export function verifyOAuthState(request: Request, suppliedState: string): boolean {
  if (!suppliedState) return false;
  const savedState = readCookie(request, stateCookie);
  return Boolean(savedState && savedState === suppliedState);
}
