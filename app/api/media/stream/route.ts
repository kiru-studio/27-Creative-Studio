import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const rawUrl = searchParams.get("url");

  let targetUrl = "";
  if (id) {
    targetUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
  } else if (rawUrl) {
    targetUrl = rawUrl;
  } else {
    return new NextResponse("Missing id or url parameter", { status: 400 });
  }

  // Forward Range header from incoming browser request (crucial for video scrubbing and chunk streaming)
  const rangeHeader = request.headers.get("range");
  const forwardHeaders: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "*/*",
  };
  if (rangeHeader) {
    forwardHeaders["Range"] = rangeHeader;
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: forwardHeaders,
      cache: "no-store",
      redirect: "follow",
    });

    const status = upstreamRes.status;
    const responseHeaders = new Headers();

    // Pass through essential streaming headers
    const contentType = upstreamRes.headers.get("content-type") || "video/mp4";
    responseHeaders.set("Content-Type", contentType);
    responseHeaders.set("Accept-Ranges", "bytes");

    const contentRange = upstreamRes.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    const contentLength = upstreamRes.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    // Explicitly allow cross-origin playback & inline streaming
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");
    responseHeaders.set("Content-Disposition", "inline");
    responseHeaders.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
    );

    return new Response(upstreamRes.body, {
      status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("Video stream proxy error:", err);
    return new NextResponse("Failed to stream video", { status: 502 });
  }
}
