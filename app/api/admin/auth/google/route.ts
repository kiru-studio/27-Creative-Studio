import { NextResponse } from "next/server";
import { googleAuthConfigured, generateOAuthState, getBaseUrl, sanitizeReturnTo } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request);
  const reqUrl = new URL(request.url);
  const rawReturnTo = reqUrl.searchParams.get("returnTo") || reqUrl.searchParams.get("from");
  let returnTo = rawReturnTo;

  if (!returnTo) {
    const referer = request.headers.get("referer");
    if (referer) {
      try {
        const refUrl = new URL(referer);
        if (refUrl.pathname.startsWith("/team")) {
          returnTo = "/team";
        }
      } catch {}
    }
  }
  returnTo = sanitizeReturnTo(returnTo || "/admin");

  if (!googleAuthConfigured()) {
    return NextResponse.redirect(`${baseUrl}${returnTo}?error=google_not_configured`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!.trim();
  const redirectUri = `${baseUrl}/api/admin/auth/google/callback`;

  // Create redirect response so we can attach the CSRF state cookie & returnTo target
  const targetUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  targetUrl.searchParams.set("client_id", clientId);
  targetUrl.searchParams.set("redirect_uri", redirectUri);
  targetUrl.searchParams.set("response_type", "code");
  targetUrl.searchParams.set("scope", "openid email profile");
  targetUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(targetUrl.toString());
  const state = generateOAuthState(response, returnTo);
  targetUrl.searchParams.set("state", state);

  // Re-target with state attached
  return NextResponse.redirect(targetUrl.toString(), {
    headers: response.headers,
  });
}
