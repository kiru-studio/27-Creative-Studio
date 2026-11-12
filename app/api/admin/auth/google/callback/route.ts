import { NextResponse } from "next/server";
import {
  googleAuthConfigured,
  verifyOAuthState,
  isAllowedGoogleEmail,
  setAdminSession,
  getBaseUrl,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${baseUrl}/admin?error=${encodeURIComponent(oauthError)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/admin?error=missing_oauth_params`);
  }

  if (!verifyOAuthState(request, state)) {
    return NextResponse.redirect(`${baseUrl}/admin?error=invalid_oauth_state`);
  }

  if (!googleAuthConfigured()) {
    return NextResponse.redirect(`${baseUrl}/admin?error=google_not_configured`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!.trim();
  const redirectUri = `${baseUrl}/api/admin/auth/google/callback`;

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
      return NextResponse.redirect(
        `${baseUrl}/admin?error=google_token_failed&details=${encodeURIComponent(
          errBody.slice(0, 150)
        )}`
      );
    }

    const tokens = (await tokenResponse.json()) as { access_token?: string };
    if (!tokens.access_token) {
      return NextResponse.redirect(`${baseUrl}/admin?error=missing_access_token`);
    }

    // 2. Fetch authenticated Google profile
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok) {
      const profileErr = await userResponse.text();
      console.error("Google userinfo error:", profileErr);
      return NextResponse.redirect(
        `${baseUrl}/admin?error=google_profile_failed&details=${encodeURIComponent(
          profileErr.slice(0, 150)
        )}`
      );
    }

    const profile = (await userResponse.json()) as {
      email?: string;
      email_verified?: boolean;
      name?: string;
    };

    if (!profile.email) {
      return NextResponse.redirect(`${baseUrl}/admin?error=no_email_provided`);
    }

    // 3. Verify email against allowed admin whitelist
    if (!isAllowedGoogleEmail(profile.email)) {
      console.warn(`Unauthorized Google login attempt: ${profile.email}`);
      return NextResponse.redirect(
        `${baseUrl}/admin?error=unauthorized_email&email=${encodeURIComponent(
          profile.email
        )}`
      );
    }

    // 4. Authorized! Set session cookie and redirect to admin workspace
    const successRedirect = NextResponse.redirect(`${baseUrl}/admin`);
    setAdminSession(successRedirect, profile.email);
    return successRedirect;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Google authentication error:", err);
    return NextResponse.redirect(
      `${baseUrl}/admin?error=auth_internal_error&details=${encodeURIComponent(
        errorMsg
      )}`
    );
  }
}
