import { NextResponse } from "next/server";
import { googleAuthConfigured, generateOAuthState } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  if (!googleAuthConfigured()) {
    return NextResponse.redirect(`${origin}/admin?error=google_not_configured`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = `${origin}/api/admin/auth/google/callback`;

  // Create redirect response so we can attach the CSRF state cookie
  const targetUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  targetUrl.searchParams.set("client_id", clientId);
  targetUrl.searchParams.set("redirect_uri", redirectUri);
  targetUrl.searchParams.set("response_type", "code");
  targetUrl.searchParams.set("scope", "openid email profile");
  targetUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(targetUrl.toString());
  const state = generateOAuthState(response);
  targetUrl.searchParams.set("state", state);

  // Re-target with state attached
  return NextResponse.redirect(targetUrl.toString(), {
    headers: response.headers,
  });
}
