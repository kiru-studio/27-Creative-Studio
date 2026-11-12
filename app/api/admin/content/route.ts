import { NextResponse } from "next/server";
import masterContent from "@/content/site-content.json";
import fs from "node:fs";
import path from "node:path";
import {
  isAdminRequest,
  isSameOriginRequest,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function isValidContent(content: unknown): boolean {
  if (!isObject(content)) return false;
  // Core sections that must be present
  const requiredKeys = ["hero", "reels", "films", "packages", "people", "contact"];
  return requiredKeys.every((key) => key in content);
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }

  try {
    const filePath = path.join(process.cwd(), "content", "site-content.json");
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return NextResponse.json(data, {
        headers: { "Cache-Control": "private, no-store" },
      });
    }
  } catch {
    // fallback
  }

  return NextResponse.json(masterContent, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function PUT(request: Request) {
  if (!isAdminRequest(request) || !isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }

  let content: unknown;
  try {
    const body = await request.text();
    if (body.length > 2_000_000) {
      return NextResponse.json({ error: "The content payload is too large." }, { status: 413 });
    }
    content = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "The content could not be read." }, { status: 400 });
  }

  if (!isValidContent(content)) {
    return NextResponse.json(
      { error: "Content is missing core sections (hero, reels, films, packages, people, or contact)." },
      { status: 400 },
    );
  }

  const serialized = `${JSON.stringify(content, null, 2)}\n`;

  // Always write locally to disk if in local environment or disk is accessible
  let savedLocally = false;
  try {
    const filePath = path.join(process.cwd(), "content", "site-content.json");
    fs.writeFileSync(filePath, serialized, "utf-8");
    savedLocally = true;
  } catch (fsErr) {
    console.warn("Could not write to local content file:", fsErr);
  }

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const token = process.env.GITHUB_CONTENT_TOKEN;

  // If GitHub publishing is not configured or dummy, return local save status
  if (!owner || !repo || !token || token.includes("replace") || owner.includes("your-")) {
    if (savedLocally) {
      return NextResponse.json({
        saved: true,
        message: "Saved to content/site-content.json. Changes are live in your workspace.",
      });
    }
    return NextResponse.json(
      { error: "GitHub publishing is not configured and local disk is not writable." },
      { status: 503 },
    );
  }

  if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo) || !/^[\w./-]+$/.test(branch)) {
    if (savedLocally) {
      return NextResponse.json({
        saved: true,
        message: "Saved to local content file. GitHub settings appear invalid.",
      });
    }
    return NextResponse.json({ error: "GitHub publishing settings are invalid." }, { status: 503 });
  }

  const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/content/site-content.json`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    const currentResponse = await fetch(`${endpoint}?ref=${encodeURIComponent(branch)}`, {
      headers,
      cache: "no-store",
    });
    if (!currentResponse.ok) {
      if (savedLocally) {
        return NextResponse.json({
          saved: true,
          message: "Saved to local master file. (GitHub repo could not be reached).",
        });
      }
      return NextResponse.json(
        { error: "Could not read the master file from GitHub." },
        { status: 502 },
      );
    }
    const current = (await currentResponse.json()) as { sha: string };

    const commitResponse = await fetch(endpoint, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Update site content from admin",
        content: Buffer.from(serialized).toString("base64"),
        sha: current.sha,
        branch,
      }),
      cache: "no-store",
    });
    if (commitResponse.status === 409 || commitResponse.status === 422) {
      return NextResponse.json(
        { error: "The master file changed elsewhere. Reload it and try again." },
        { status: 409 },
      );
    }
    if (!commitResponse.ok) {
      if (savedLocally) {
        return NextResponse.json({
          saved: true,
          message: "Saved locally. GitHub commit returned an error.",
        });
      }
      return NextResponse.json(
        { error: "GitHub could not publish the content update." },
        { status: 502 },
      );
    }
    const result = (await commitResponse.json()) as { commit?: { html_url?: string } };
    return NextResponse.json({
      saved: true,
      commitUrl: result.commit?.html_url,
      message: "Saved to master file and committed to GitHub! Vercel will deploy changes shortly.",
    });
  } catch (err) {
    if (savedLocally) {
      return NextResponse.json({
        saved: true,
        message: "Saved to local content file. (GitHub API unreachable).",
      });
    }
    return NextResponse.json(
      { error: "Could not reach GitHub. Check the connection and try again." },
      { status: 502 },
    );
  }
}