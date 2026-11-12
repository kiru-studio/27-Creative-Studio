import { NextResponse } from "next/server";
import {
  googleAuthConfigured,
  verifyOAuthState,
  isAllowedGoogleEmail,
  setAdminSession,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(oauthError)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/admin?error=missing_oauth_params`);
  }

  if (!verifyOAuthState(request, state)) {
    return NextResponse.redirect(`${origin}/admin?error=invalid_oauth_state`);
  }

  if (!googleAuthConfigured()) {
    return NextResponse.redirect(`${origin}/admin?error=google_not_configured`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${origin}/api/admin/auth/google/callback`;

  try {
    // 1. Exchange authorization code for Google access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error("Google token exchange error:", errBody);
      return NextResponse.redirect(`${origin}/admin?error=google_token_failed`);
    }

    const tokens = (await tokenResponse.json()) as { access_token?: string };
    if (!tokens.access_token) {
      return NextResponse.redirect(`${origin}/admin?error=missing_access_token`);
    }

    // 2. Fetch authenticated Google profile
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(`${origin}/admin?error=google_profile_failed`);
    }

    const profile = (await userResponse.json()) as {
      email?: string;
      email_verified?: boolean;
      name?: string;
    };

    if (!profile.email) {
      return NextResponse.redirect(`${origin}/admin?error=no_email_provided`);
    }

    // 3. Verify email against allowed admin whitelist
    if (!isAllowedGoogleEmail(profile.email)) {
      console.warn(`Unauthorized Google login attempt: ${profile.email}`);
      return NextResponse.redirect(
        `${origin}/admin?error=unauthorized_email&email=${encodeURIComponent(profile.email)}`
      );
    }

    // 4. Authorized! Set session cookie and redirect to admin workspace
    const successRedirect = NextResponse.redirect(`${origin}/admin`);
    setAdminSession(successRedirect, profile.email);
    return successRedirect;
  } catch (err) {
    console.error("Google authentication error:", err);
    return NextResponse.redirect(`${origin}/admin?error=auth_internal_error`);
  }
}
