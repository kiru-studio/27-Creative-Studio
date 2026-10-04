import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

const allowedContentTypes = [
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!isAdminRequest(request)) throw new Error("Sign in to continue.");
        const filename = pathname.split("/").pop() ?? "";
        if (!filename || filename.includes("..") || filename.length > 180) {
          throw new Error("Invalid file name.");
        }
        return {
          allowedContentTypes,
          maximumSizeInBytes: 150 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: "rec-mode-admin",
        };
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload could not start." },
      { status: 400 },
    );
  }
}