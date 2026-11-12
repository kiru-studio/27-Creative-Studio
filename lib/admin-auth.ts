import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextResponse } from "next/server";

const sessionCookie = "rec-admin-session";
const sessionLifetimeSeconds = 60 * 60 * 8;
const defaultDevSecret = "rec-mode-admin-session-secret-32-chars-fallback";

export function adminAuthConfigured() {
  const pwd = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET || (process.env.NODE_ENV !== "production" ? defaultDevSecret : undefined);
  return Boolean(
    pwd &&
      pwd.length >= 8 &&
      secret &&
      secret.length >= 16,
  );
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

function sign(expiresAt: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || (process.env.NODE_ENV !== "production" ? defaultDevSecret : undefined);
  if (!secret) throw new Error("Admin session secret is not configured.");
  return createHmac("sha256", secret).update(expiresAt).digest("base64url");
}

export function setAdminSession(response: NextResponse) {
  const expiresAt = String(
    Math.floor(Date.now() / 1000) + sessionLifetimeSeconds,
  );
  response.cookies.set(sessionCookie, `${expiresAt}.${sign(expiresAt)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionLifetimeSeconds,
  });
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set(sessionCookie, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
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