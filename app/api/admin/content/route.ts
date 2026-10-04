import { NextResponse } from "next/server";
import masterContent from "@/content/site-content.json";
import {
  isAdminRequest,
  isSameOriginRequest,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function matchesShape(template: unknown, value: unknown): boolean {
  if (Array.isArray(template)) {
    return (
      Array.isArray(value) &&
      value.length <= 100 &&
      (template.length === 0 || value.every((item) => matchesShape(template[0], item)))
    );
  }
  if (template && typeof template === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const templateKeys = Object.keys(template);
    const valueKeys = Object.keys(value);
    return (
      templateKeys.length === valueKeys.length &&
      templateKeys.every(
        (key) => key in value && matchesShape(template[key as keyof typeof template], value[key as keyof typeof value]),
      )
    );
  }
  if (typeof template === "string") return typeof value === "string" && value.length <= 100_000;
  if (typeof template === "number") return typeof value === "number" && Number.isFinite(value);
  if (typeof template === "boolean") return typeof value === "boolean";
  return template === value;
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
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
    if (body.length > 1_000_000) {
      return NextResponse.json({ error: "The content file is too large." }, { status: 413 });
    }
    content = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "The content could not be read." }, { status: 400 });
  }

  if (!matchesShape(masterContent, content)) {
    return NextResponse.json(
      { error: "Some content fields are missing or have the wrong type." },
      { status: 400 },
    );
  }

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const token = process.env.GITHUB_CONTENT_TOKEN;
  if (!owner || !repo || !token) {
    return NextResponse.json(
      { error: "GitHub publishing is not configured." },
      { status: 503 },
    );
  }
  if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo) || !/^[\w./-]+$/.test(branch)) {
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
      return NextResponse.json(
        { error: "Could not read the master file from GitHub." },
        { status: 502 },
      );
    }
    const current = (await currentResponse.json()) as { sha: string };
    const serialized = `${JSON.stringify(content, null, 2)}\n`;
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
      return NextResponse.json(
        { error: "GitHub could not publish the content update." },
        { status: 502 },
      );
    }
    const result = (await commitResponse.json()) as { commit?: { html_url?: string } };
    return NextResponse.json({
      saved: true,
      commitUrl: result.commit?.html_url,
      message: "Saved to the master file. Vercel will publish it after the deployment finishes.",
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach GitHub. Check the connection and try again." },
      { status: 502 },
    );
  }
}