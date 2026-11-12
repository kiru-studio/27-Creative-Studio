import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";

  // 1. Direct file upload via FormData (Works in local dev, self-hosted, or without Vercel Blob)
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided in form data." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const safeName = `${Date.now()}-${cleanName}`;
      const uploadsDir = path.join(process.cwd(), "public", "uploads");

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, safeName);
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${safeName}`;
      return NextResponse.json({ url: publicUrl, filename: file.name });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to save file." },
        { status: 500 },
      );
    }
  }

  // 2. Vercel Blob fallback if token is configured
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken && !blobToken.includes("replace")) {
    try {
      const { handleUpload } = await import("@vercel/blob/client");
      const body = await request.json();
      const response = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async () => ({
          allowedContentTypes: [
            "image/avif",
            "image/jpeg",
            "image/png",
            "image/webp",
            "video/mp4",
            "video/quicktime",
            "video/webm",
          ],
          maximumSizeInBytes: 150 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: "27-studio-admin",
        }),
      });
      return NextResponse.json(response);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Vercel Blob upload failed." },
        { status: 400 },
      );
    }
  }

  return NextResponse.json(
    { error: "Direct file upload expected or configure BLOB_READ_WRITE_TOKEN." },
    { status: 400 },
  );
}
