"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Save,
  Eye,
  LogOut,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Film,
  Users,
  CreditCard,
  TrendingUp,
  Zap,
  HelpCircle,
  Settings,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Activity,
} from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { SmartMediaInput } from "@/components/admin/smart-media-input";
import { MediaGuideModal } from "@/components/admin/media-guide-modal";
import type { SiteContent } from "@/lib/site-content";

type TabId =
  | "reels"
  | "films"
  | "crew"
  | "packages"
  | "cases"
  | "process"
  | "faq"
  | "studio";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "reels", label: "Reels & Shortform", icon: Film },
  { id: "films", label: "Brand Films", icon: Sparkles },
  { id: "crew", label: "Crew Passes", icon: Users },
  { id: "packages", label: "SD Packages", icon: CreditCard },
  { id: "cases", label: "Case Studies", icon: TrendingUp },
  { id: "process", label: "Speed & Process", icon: Zap },
  { id: "faq", label: "FAQ & Reviews", icon: HelpCircle },
  { id: "studio", label: "Studio & General", icon: Settings },
];

export default function AdminPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("reels");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [showGoogleHelp, setShowGoogleHelp] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [timecode, setTimecode] = useState("00:00:00:00");

  // Read URL search params for OAuth errors on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const oauthErr = params.get("error");
      if (oauthErr) {
        if (oauthErr === "unauthorized_email") {
          const attemptEmail = params.get("email") || "this account";
          setError(`Access Denied: ${attemptEmail} is not in the authorized admin list. Add it to ADMIN_ALLOWED_EMAILS in .env to grant access.`);
        } else if (oauthErr === "google_not_configured") {
          setError("Google Sign-In is not yet configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.");
          setShowGoogleHelp(true);
        } else if (oauthErr === "invalid_oauth_state") {
          setError("OAuth security verification failed. Please try signing in again.");
        } else if (oauthErr === "google_token_failed") {
          const details = params.get("details");
          setError(`Google rejected token exchange: ${details || "Verify GOOGLE_CLIENT_SECRET and redirect URIs."}`);
        } else if (oauthErr === "auth_internal_error") {
          const details = params.get("details");
          setError(`Authentication error: ${details || "Failed to establish session"}.`);
        } else {
          const details = params.get("details");
          setError(`Google Sign-In returned: ${oauthErr}${details ? ` (${details})` : ""}`);
        }
      }
    } catch {}
  }, []);

  // 24fps Ticker in header
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const totalFrames = Math.floor((elapsed / 1000) * 24);
      const frames = totalFrames % 24;
      const totalSec = Math.floor(totalFrames / 24);
      const sec = totalSec % 60;
      const totalMin = Math.floor(totalSec / 60);
      const min = totalMin % 60;
      const hrs = Math.floor(totalMin / 60);
      setTimecode(
        `${String(hrs).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}:${String(frames).padStart(2, "0")}`
      );
    }, 41);
    return () => clearInterval(interval);
  }, []);

  const loadContent = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/content", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) {
          setContent(null);
          return false;
        }
        setError("Could not load site content.");
        return false;
      }
      const data = await res.json();
      setContent(data);
      return true;
    } catch {
      setError("Network error loading content.");
      return false;
    }
  }, []);

  // Check auth session
  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (res) => {
        const session = await res.json();
        if (!active) return;
        setGoogleConfigured(Boolean(session.googleConfigured));
        if (session.user) setUserEmail(session.user);
        if (session.authenticated) {
          await loadContent();
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [loadContent]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Incorrect admin password.");
        return;
      }
      setPassword("");
      await loadContent();
    } catch {
      setError("Failed to sign in. Please verify your connection.");
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setContent(null);
    setDirty(false);
    setError("");
    setSuccessMsg("");
  };

  const handlePublish = async () => {
    if (!content) return;
    setBusy(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to publish updates.");
        return;
      }
      setDirty(false);
      setSuccessMsg(data.message || "All changes successfully saved and published!");
    } catch {
      setError("Connection error while publishing.");
    } finally {
      setBusy(false);
    }
  };

  // Helper updater
  const update = (updater: (prev: SiteContent) => SiteContent) => {
    setContent((prev) => {
      if (!prev) return prev;
      const next = updater({ ...prev });
      setDirty(true);
      setSuccessMsg("");
      return next;
    });
  };

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!content) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] text-[#D4FF3F] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Atmosphere noise & viewfinder corners */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(198,255,61,0.06),transparent_70%)] pointer-events-none" />
        <div className="absolute top-6 left-6 font-mono text-xs text-[#FF2DA8] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D4FF3F] animate-ping" />
          <span>SYS // 27_CREATIVE_STUDIO</span>
        </div>
        <div className="absolute top-6 right-6 font-mono text-xs text-[#D4FF3F]">
          {timecode}
        </div>

        <div className="relative z-10 w-full max-w-md bg-[#0B0B0B] border border-[#0B0B0B] p-8 rounded-lg shadow-2xl flex flex-col items-center text-center">
          <BrandLockup href="/" className="mb-4" />
          <p className="font-mono text-xs text-[#D4FF3F] uppercase tracking-widest mb-1">
            Studio Control Room
          </p>
          <h1 className="font-display font-bold text-2xl text-[#D4FF3F] mb-2">
            Sign In to Edit Content
          </h1>
          <p className="text-xs text-[#FF2DA8] font-mono mb-6 leading-relaxed">
            Manage client reels, brand films, hanging crew passes, pricing SD cards, and studio settings.
          </p>

          {/* 1. Google OAuth Sign-In (Recommended High-Security Method) */}
          <div className="w-full space-y-2 mb-2">
            <a
              href="/api/admin/auth/google?returnTo=/admin"
              className="w-full py-2.5 px-4 rounded bg-[#D4FF3F] hover:bg-[#D4FF3F] text-[#0B0B0B] font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 border border-[#D4FF3F] shadow-sm hover:shadow cursor-pointer"
              style={{ color: "#0B0B0B" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                <path
                  fill="#FF2DA8"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.15z"
                />
                <path
                  fill="#D4FF3F"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.67-4.94H1.28v3.15C3.26 21.33 7.33 24 12 24z"
                />
                <path
                  fill="#FF2DA8"
                  d="M5.33 14.26c-.24-.72-.38-1.49-.38-2.26s.14-1.54.38-2.26V6.59H1.28C.46 8.22 0 10.05 0 12s.46 3.78 1.28 5.41l4.05-3.15z"
                />
                <path
                  fill="#FF2DA8"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.67 1.28 6.59l4.05 3.15c.94-2.84 3.57-4.99 6.67-4.99z"
                />
              </svg>
              <span style={{ color: "#0B0B0B" }}>SIGN IN WITH GOOGLE</span>
            </a>

            {!googleConfigured && (
              <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                <span className="text-[#D4FF3F]/80">★ High Security 2FA</span>
                <button
                  type="button"
                  onClick={() => setShowGoogleHelp(!showGoogleHelp)}
                  className="text-[#FF2DA8] hover:text-[#D4FF3F] underline cursor-pointer"
                >
                  {showGoogleHelp ? "Hide guide" : "Setup instructions"}
                </button>
              </div>
            )}

            {showGoogleHelp && (
              <div className="p-3 rounded border border-[#FF2DA8] bg-[#0B0B0B] text-[11px] font-mono text-left space-y-2 text-[#FF2DA8]">
                <p className="text-[#D4FF3F] font-semibold text-xs">How to connect Google Sign-In:</p>
                <ol className="list-decimal list-inside space-y-1 text-[#FF2DA8]">
                  <li>Create a free project at <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-[#D4FF3F] underline">console.cloud.google.com</a>.</li>
                  <li>Go to <strong>APIs &amp; Services &gt; Credentials</strong> &gt; Create <strong>OAuth Client ID</strong> (Web app).</li>
                  <li>Add Redirect URI: <code className="text-[#D4FF3F] bg-[#0B0B0B] px-1 py-0.5 rounded">http://localhost:3000/api/admin/auth/google/callback</code>.</li>
                  <li>Add <code className="text-[#D4FF3F]">GOOGLE_CLIENT_ID</code>, <code className="text-[#D4FF3F]">GOOGLE_CLIENT_SECRET</code>, and <code className="text-[#D4FF3F]">ADMIN_ALLOWED_EMAILS</code> to <code className="text-[#D4FF3F]">.env</code>.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#0B0B0B]" />
            </div>
            <span className="relative bg-[#0B0B0B] px-3 font-mono text-[10px] text-[#FF2DA8] uppercase tracking-wider">
              or use studio password
            </span>
          </div>

          <form onSubmit={handleSignIn} className="w-full flex flex-col gap-4">
            <div className="flex flex-col text-left gap-1.5">
              <label htmlFor="admin-pass" className="font-mono text-xs text-[#FF2DA8] uppercase flex items-center gap-1.5">
                <Lock size={12} className="text-[#D4FF3F]" />
                <span>Admin Password</span>
              </label>
              <input
                id="admin-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-[#0B0B0B] border border-[#FF2DA8] focus:border-[#D4FF3F] rounded px-3 py-2.5 text-sm font-mono text-[#D4FF3F] placeholder-[#FF2DA8] outline-none transition-colors"
              />
            </div>

            {error && (
              <p className="font-mono text-xs text-[#FF2DA8] bg-[#FF2DA8]/10 border border-[#FF2DA8]/30 p-2.5 rounded text-left flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{error}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full mt-2 py-3 px-4 rounded bg-[#D4FF3F] hover:bg-[#D4FF3F] text-[#0B0B0B] font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              style={{ color: "#0B0B0B" }}
            >
              <span style={{ color: "#0B0B0B" }}>{busy ? "AUTHENTICATING…" : "ACCESS CONTROL ROOM →"}</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#0B0B0B] w-full flex items-center justify-between text-[11px] font-mono text-[#FF2DA8]">
            <span>ENC // SHA-256</span>
            <a href="/" target="_blank" className="hover:text-[#D4FF3F] transition-colors">
              Return to Site
            </a>
          </div>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED DASHBOARD
  // -------------------------------------------------------------
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-[#D4FF3F] flex flex-col">
      {/* Media Guide Modal */}
      <MediaGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Top Studio Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0B0B]/95 backdrop-blur-md border-b border-[#0B0B0B] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BrandLockup href="/" className="shrink-0" />
          <div className="hidden md:flex items-center gap-2 border-l border-[#0B0B0B] pl-4">
            <span className="font-mono text-xs uppercase text-[#FF2DA8]">CONTROL ROOM</span>
            <span className="font-mono text-xs text-[#D4FF3F] bg-[#D4FF3F]/10 px-2 py-0.5 rounded border border-[#D4FF3F]/30">
              CMS v2.0
            </span>
          </div>
        </div>

        {/* Center Timecode Readout */}
        <div className="hidden sm:flex items-center gap-3 font-mono text-xs text-[#FF2DA8]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4FF3F] animate-pulse" />
            <span className="text-[#D4FF3F] tracking-wider">{timecode}</span>
            <span className="text-[#FF2DA8]">/ 24FPS</span>
          </div>

          {userEmail && (
            <div className="hidden xl:flex items-center gap-1.5 font-mono text-[11px] bg-[#0B0B0B] text-[#D4FF3F] px-2 py-0.5 rounded border border-[#D4FF3F]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF3F]" />
              <span>{userEmail}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#FF2DA8] hover:border-[#D4FF3F] text-[#FF2DA8] hover:text-[#D4FF3F] font-mono text-xs transition-colors"
          >
            <Info size={14} /> Free Media Guide
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#FF2DA8] hover:border-[#D4FF3F] text-[#FF2DA8] hover:text-[#D4FF3F] font-mono text-xs transition-colors"
          >
            <Eye size={14} /> <span className="hidden sm:inline">Live Preview</span>
          </a>

          <a
            href="/team"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#D4FF3F]/40 bg-[#D4FF3F]/10 hover:bg-[#D4FF3F]/20 text-[#D4FF3F] font-mono text-xs font-bold uppercase transition-colors"
          >
            <Activity size={13} />
            <span className="hidden sm:inline">Team Ops &amp; CRM</span>
            <svg className="size-3 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 17L17 7M17 7H7M17 7V17"/></svg>
          </a>

          <button
            type="button"
            onClick={handlePublish}
            disabled={busy || !dirty}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              dirty
                ? "bg-[#D4FF3F] hover:bg-[#D4FF3F] text-[#0B0B0B] shadow-lg shadow-[#D4FF3F]/20 animate-pulse"
                : "bg-[#0B0B0B] text-[#FF2DA8] border border-[#FF2DA8] cursor-not-allowed"
            }`}
            style={dirty ? { color: "#0B0B0B" } : undefined}
          >
            <Save size={14} style={dirty ? { color: "#0B0B0B" } : undefined} />
            <span style={dirty ? { color: "#0B0B0B" } : undefined}>
              {busy ? "PUBLISHING…" : dirty ? "PUBLISH CHANGES" : "SAVED"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            title="Sign out"
            className="p-1.5 rounded border border-[#FF2DA8] hover:border-[#FF2DA8] text-[#FF2DA8] hover:text-[#FF2DA8] transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Notification Banner */}
      {successMsg && (
        <div className="bg-[#0B0B0B] border-b border-[#D4FF3F]/40 px-6 py-2.5 flex items-center justify-between font-mono text-xs text-[#D4FF3F]">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={15} /> {successMsg}
          </span>
          <button type="button" onClick={() => setSuccessMsg("")} className="hover:text-[#D4FF3F]">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="bg-[#0B0B0B] border-b border-[#FF2DA8]/40 px-6 py-2.5 flex items-center justify-between font-mono text-xs text-[#FF2DA8]">
          <span className="flex items-center gap-2">
            <AlertTriangle size={15} /> {error}
          </span>
          <button type="button" onClick={() => setError("")} className="hover:text-[#D4FF3F]">
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-[96rem] w-full mx-auto">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#0B0B0B] bg-[#0B0B0B] p-3 shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          <p className="hidden md:block font-mono text-[10px] uppercase text-[#FF2DA8] px-3 py-2 tracking-wider">
            Content Modules
          </p>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded font-mono text-xs tracking-wider transition-all text-left whitespace-nowrap shrink-0 md:shrink md:w-full ${
                  isActive
                    ? "bg-[#0B0B0B] text-[#D4FF3F] border-l-2 border-[#D4FF3F] font-bold"
                    : "text-[#FF2DA8] hover:text-[#D4FF3F] hover:bg-[#0B0B0B]"
                }`}
              >
                <Icon size={15} className={isActive ? "text-[#D4FF3F]" : "text-[#FF2DA8]"} />
                <span>{tab.label}</span>
                {tab.id === "reels" && (
                  <span className="ml-auto text-[10px] bg-[#0B0B0B] px-1.5 py-0.2 rounded text-[#FF2DA8]">
                    {content.reels?.length || 0}
                  </span>
                )}
                {tab.id === "crew" && (
                  <span className="ml-auto text-[10px] bg-[#0B0B0B] px-1.5 py-0.2 rounded text-[#FF2DA8]">
                    {content.people?.length || 0}
                  </span>
                )}
              </button>
            );
          })}

          <div className="hidden md:block mt-auto p-3 rounded border border-[#0B0B0B] bg-[#0B0B0B] text-[11px] font-mono text-[#FF2DA8]">
            <p className="text-[#D4FF3F] font-bold mb-1">⚡ Free Tier Ready</p>
            <p className="leading-snug">
              Supports Google Drive share links, Cloudinary direct video streaming, and local uploads.
            </p>
          </div>
        </aside>

        {/* Editor Stage */}
        <section className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* TAB 1: REELS */}
          {activeTab === "reels" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0B0B0B] pb-4">
                <div>
                  <h2 className="font-display font-bold text-xl text-[#D4FF3F]">Reels &amp; Shortform Gallery</h2>
                  <p className="font-mono text-xs text-[#FF2DA8]">
                    Add, reorder, or edit vertical reels. Displayed in the high-velocity reels showcase.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newReel = {
                      title: "New Client Showcase Reel",
                      type: "Showcase reel",
                      label: "REEL / CLIENT",
                      meta: "5.0K views",
                      client: "Client Name",
                      delivered: "10 posts",
                      industries: ["everything"],
                      posterSrc: "",
                      videoSrc: "",
                    };
                    update((prev) => ({ ...prev, reels: [newReel, ...(prev.reels || [])] }));
                  }}
                  className="px-3.5 py-2 rounded bg-[#D4FF3F] hover:bg-[#D4FF3F] text-[#0B0B0B] font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0"
                  style={{ color: "#0B0B0B" }}
                >
                  <Plus size={14} style={{ color: "#0B0B0B" }} />
                  <span style={{ color: "#0B0B0B" }}>ADD NEW REEL</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {content.reels?.map((reel, index) => (
                  <div
                    key={`reel-${index}`}
                    className="p-5 rounded-lg border border-[#0B0B0B] bg-[#0B0B0B] space-y-4 hover:border-[#0B0B0B] transition-colors"
                  >
                    {/* Item Toolbar */}
                    <div className="flex items-center justify-between border-b border-[#0B0B0B] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-[#0B0B0B] text-[#D4FF3F] px-2 py-0.5 rounded border border-[#0B0B0B]">
                          #{String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="font-mono text-xs text-[#D4FF3F] font-semibold truncate max-w-xs sm:max-w-md">
                          {reel.title || "Untitled Reel"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => {
                            const next = [...(content.reels || [])];
                            [next[index], next[index - 1]] = [next[index - 1], next[index]];
                            update((p) => ({ ...p, reels: next }));
                          }}
                          className="p-1.5 rounded hover:bg-[#0B0B0B] text-[#FF2DA8] disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={index === (content.reels?.length || 0) - 1}
                          onClick={() => {
                            const next = [...(content.reels || [])];
                            [next[index], next[index + 1]] = [next[index + 1], next[index]];
                            update((p) => ({ ...p, reels: next }));
                          }}
                          className="p-1.5 rounded hover:bg-[#0B0B0B] text-[#FF2DA8] disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete "${reel.title}"?`)) {
                              update((p) => ({ ...p, reels: p.reels.filter((_, i) => i !== index) }));
                            }
                          }}
                          className="p-1.5 rounded hover:bg-[#FF2DA8]/20 text-[#FF2DA8] ml-2"
                          title="Delete reel"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Reel Title</label>
                        <input
                          type="text"
                          value={reel.title || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.reels];
                              next[index] = { ...next[index], title: val };
                              return { ...p, reels: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Client Name</label>
                        <input
                          type="text"
                          value={reel.client || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.reels];
                              next[index] = { ...next[index], client: val };
                              return { ...p, reels: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Views / Metric</label>
                        <input
                          type="text"
                          value={reel.meta || ""}
                          placeholder="e.g. 10.1K views"
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.reels];
                              next[index] = { ...next[index], meta: val };
                              return { ...p, reels: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                    </div>

                    {/* Media Inputs with Google Drive & Cloudinary auto-detection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <SmartMediaInput
                        label="Video URL (Google Drive / Cloudinary / MP4)"
                        value={reel.videoSrc || ""}
                        mediaType="video"
                        onChange={(url) => {
                          update((p) => {
                            const next = [...p.reels];
                            next[index] = { ...next[index], videoSrc: url };
                            return { ...p, reels: next };
                          });
                        }}
                        onGeneratePoster={(posterUrl) => {
                          update((p) => {
                            const next = [...p.reels];
                            next[index] = { ...next[index], posterSrc: posterUrl };
                            return { ...p, reels: next };
                          });
                        }}
                      />
                      <SmartMediaInput
                        label="Poster Thumbnail (Google Drive / Cloudinary / JPG)"
                        value={reel.posterSrc || ""}
                        mediaType="image"
                        onChange={(url) => {
                          update((p) => {
                            const next = [...p.reels];
                            next[index] = { ...next[index], posterSrc: url };
                            return { ...p, reels: next };
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BRAND FILMS */}
          {activeTab === "films" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0B0B0B] pb-4">
                <div>
                  <h2 className="font-display font-bold text-xl text-[#D4FF3F]">Brand Films &amp; Documentaries</h2>
                  <p className="font-mono text-xs text-[#FF2DA8]">
                    Cinematic 16:9 brand cuts with room to breathe.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newFilm = {
                      title: "New Cinematic Story",
                      type: "Culinary story",
                      label: "FILM / BRAND",
                      meta: "00:45",
                      client: "Client Brand",
                      goal: "Captivate customers with a premium brand documentary.",
                      format: "16:9 brand film",
                      industries: ["everything"],
                      posterSrc: "",
                      videoSrc: "",
                    };
                    update((p) => ({ ...p, films: [newFilm, ...(p.films || [])] }));
                  }}
                  className="px-3.5 py-2 rounded bg-[#D4FF3F] hover:bg-[#D4FF3F] text-[#0B0B0B] font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0"
                  style={{ color: "#0B0B0B" }}
                >
                  <Plus size={14} style={{ color: "#0B0B0B" }} />
                  <span style={{ color: "#0B0B0B" }}>ADD NEW FILM</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {content.films?.map((film, index) => (
                  <div
                    key={`film-${index}`}
                    className="p-5 rounded-lg border border-[#0B0B0B] bg-[#0B0B0B] space-y-4 hover:border-[#0B0B0B] transition-colors"
                  >
                    <div className="flex items-center justify-between border-b border-[#0B0B0B] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-[#0B0B0B] text-[#D4FF3F] px-2 py-0.5 rounded border border-[#0B0B0B]">
                          FILM #{String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="font-mono text-xs text-[#D4FF3F] font-semibold">{film.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete "${film.title}"?`)) {
                              update((p) => ({ ...p, films: p.films.filter((_, i) => i !== index) }));
                            }
                          }}
                          className="p-1.5 rounded hover:bg-[#FF2DA8]/20 text-[#FF2DA8]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Title</label>
                        <input
                          type="text"
                          value={film.title || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.films];
                              next[index] = { ...next[index], title: val };
                              return { ...p, films: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Client</label>
                        <input
                          type="text"
                          value={film.client || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.films];
                              next[index] = { ...next[index], client: val };
                              return { ...p, films: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Duration</label>
                        <input
                          type="text"
                          value={film.meta || ""}
                          placeholder="e.g. 00:45"
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.films];
                              next[index] = { ...next[index], meta: val };
                              return { ...p, films: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Story Goal</label>
                      <textarea
                        rows={2}
                        value={film.goal || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          update((p) => {
                            const next = [...p.films];
                            next[index] = { ...next[index], goal: val };
                            return { ...p, films: next };
                          });
                        }}
                        className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SmartMediaInput
                        label="16:9 Video URL (Google Drive / Cloudinary / MP4)"
                        value={film.videoSrc || ""}
                        mediaType="video"
                        onChange={(url) => {
                          update((p) => {
                            const next = [...p.films];
                            next[index] = { ...next[index], videoSrc: url };
                            return { ...p, films: next };
                          });
                        }}
                        onGeneratePoster={(pUrl) => {
                          update((p) => {
                            const next = [...p.films];
                            next[index] = { ...next[index], posterSrc: pUrl };
                            return { ...p, films: next };
                          });
                        }}
                      />
                      <SmartMediaInput
                        label="16:9 Poster Image (Google Drive / Cloudinary / JPG)"
                        value={film.posterSrc || ""}
                        mediaType="image"
                        onChange={(url) => {
                          update((p) => {
                            const next = [...p.films];
                            next[index] = { ...next[index], posterSrc: url };
                            return { ...p, films: next };
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CREW PASSES */}
          {activeTab === "crew" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0B0B0B] pb-4">
                <div>
                  <h2 className="font-display font-bold text-xl text-[#D4FF3F]">Crew Passes &amp; Hanging Lanyard Rail</h2>
                  <p className="font-mono text-xs text-[#FF2DA8]">
                    Each person here hangs as an interactive physical lanyard badge on the Behind the Camera stage.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newPerson = {
                      name: "27 Production Member",
                      role: "Production & Grip",
                      bio: "Handling set lighting, sound synchronization, and gimbal movements on location.",
                      workLabel: "grips + lights",
                      specialty: "Set Lighting & Technical Grip",
                      tagline: "Lights the scene. Moves the glass.",
                      photoSrc: "/images/team/crew-lead.webp",
                      gear: "Aputure 300d · Nanlite Pavotubes · Rode Wireless Pro",
                      focalLength: "50mm T1.5 Cine Prime",
                      passId: `27-CREW-0${(content.people?.length || 0) + 1}`,
                      access: "ALL ACCESS // VIP",
                      stats: "100% Set Readiness",
                      featuredWork: "#reels",
                    };
                    update((p) => ({ ...p, people: [...(p.people || []), newPerson] }));
                  }}
                  className="px-3.5 py-2 rounded bg-[#D4FF3F] hover:bg-[#D4FF3F] text-[#0B0B0B] font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0"
                  style={{ color: "#0B0B0B" }}
                >
                  <Plus size={14} style={{ color: "#0B0B0B" }} />
                  <span style={{ color: "#0B0B0B" }}>ADD CREW PASS</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {content.people?.map((person, index) => (
                  <div
                    key={`person-${index}`}
                    className="p-5 rounded-lg border border-[#0B0B0B] bg-[#0B0B0B] space-y-4 hover:border-[#0B0B0B] transition-colors"
                  >
                    <div className="flex items-center justify-between border-b border-[#0B0B0B] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-[#0B0B0B] text-[#D4FF3F] px-2 py-0.5 rounded border border-[#0B0B0B]">
                          {person.passId || `PASS #${index + 1}`}
                        </span>
                        <span className="font-mono text-xs text-[#D4FF3F] font-semibold">{person.name}</span>
                        <span className="font-mono text-[11px] text-[#FF2DA8]">({person.role})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => {
                            const next = [...(content.people || [])];
                            [next[index], next[index - 1]] = [next[index - 1], next[index]];
                            update((p) => ({ ...p, people: next }));
                          }}
                          className="p-1.5 rounded hover:bg-[#0B0B0B] text-[#FF2DA8] disabled:opacity-30"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={index === (content.people?.length || 0) - 1}
                          onClick={() => {
                            const next = [...(content.people || [])];
                            [next[index], next[index + 1]] = [next[index + 1], next[index]];
                            update((p) => ({ ...p, people: next }));
                          }}
                          className="p-1.5 rounded hover:bg-[#0B0B0B] text-[#FF2DA8] disabled:opacity-30"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove crew pass for "${person.name}"?`)) {
                              update((p) => ({ ...p, people: p.people.filter((_, i) => i !== index) }));
                            }
                          }}
                          className="p-1.5 rounded hover:bg-[#FF2DA8]/20 text-[#FF2DA8]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Name</label>
                        <input
                          type="text"
                          value={person.name || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.people];
                              next[index] = { ...next[index], name: val };
                              return { ...p, people: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Role</label>
                        <input
                          type="text"
                          value={person.role || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.people];
                              next[index] = { ...next[index], role: val };
                              return { ...p, people: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Personality Tagline</label>
                        <input
                          type="text"
                          value={(person as any).tagline || ""}
                          placeholder="e.g. Shoots first. Sleeps later."
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.people];
                              next[index] = { ...next[index], tagline: val };
                              return { ...p, people: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Signature Gear</label>
                        <input
                          type="text"
                          value={person.gear || ""}
                          placeholder="Sony FX3 · 24-70 GM"
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.people];
                              next[index] = { ...next[index], gear: val };
                              return { ...p, people: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Signature Focal / Aesthetic</label>
                        <input
                          type="text"
                          value={person.focalLength || ""}
                          placeholder="35mm T1.5 Cine Prime"
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.people];
                              next[index] = { ...next[index], focalLength: val };
                              return { ...p, people: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Key Metric / Stat</label>
                        <input
                          type="text"
                          value={person.stats || ""}
                          placeholder="5.8x Peak Client Growth"
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.people];
                              next[index] = { ...next[index], stats: val };
                              return { ...p, people: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Bio Paragraph</label>
                      <textarea
                        rows={2}
                        value={person.bio || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          update((p) => {
                            const next = [...p.people];
                            next[index] = { ...next[index], bio: val };
                            return { ...p, people: next };
                          });
                        }}
                        className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                      />
                    </div>

                    <SmartMediaInput
                      label="Portrait Photo (Google Drive / WebP / JPG)"
                      value={person.photoSrc || ""}
                      mediaType="image"
                      onChange={(url) => {
                        update((p) => {
                          const next = [...p.people];
                          next[index] = { ...next[index], photoSrc: url };
                          return { ...p, people: next };
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SD PACKAGES */}
          {activeTab === "packages" && (
            <div className="space-y-6">
              <div className="border-b border-[#0B0B0B] pb-4">
                <h2 className="font-display font-bold text-xl text-[#D4FF3F]">SD Card Memory Packages</h2>
                <p className="font-mono text-xs text-[#FF2DA8]">
                  The 3 physical SD memory cards displayed on the ways of working section.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {content.packages?.map((pkg, index) => (
                  <div
                    key={`pkg-${index}`}
                    className="p-5 rounded-lg border border-[#0B0B0B] bg-[#0B0B0B] space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-[#0B0B0B] pb-2">
                      <span className="font-mono text-xs text-[#D4FF3F] font-bold">
                        {pkg.tierNumber || `WAY / 0${index + 1}`}
                      </span>
                      <label className="flex items-center gap-1.5 font-mono text-[11px] text-[#FF2DA8] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(pkg.popular)}
                          onChange={(e) => {
                            const val = e.target.checked;
                            update((p) => {
                              const next = [...p.packages];
                              next[index] = { ...next[index], popular: val };
                              return { ...p, packages: next };
                            });
                          }}
                        />
                        <span>Highlight</span>
                      </label>
                    </div>

                    <div>
                      <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Package Name</label>
                      <input
                        type="text"
                        value={pkg.name || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          update((p) => {
                            const next = [...p.packages];
                            next[index] = { ...next[index], name: val };
                            return { ...p, packages: next };
                          });
                        }}
                        className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Tagline / Description</label>
                      <textarea
                        rows={2}
                        value={pkg.tagline || pkg.description || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          update((p) => {
                            const next = [...p.packages];
                            next[index] = { ...next[index], tagline: val, description: val };
                            return { ...p, packages: next };
                          });
                        }}
                        className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                      />
                    </div>

                    {/* Deliverables items */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Deliverables</label>
                        <button
                          type="button"
                          onClick={() => {
                            update((p) => {
                              const next = [...p.packages];
                              const currentDeliverables = next[index].deliverables || [];
                              next[index] = { ...next[index], deliverables: [...currentDeliverables, "New deliverable"] };
                              return { ...p, packages: next };
                            });
                          }}
                          className="font-mono text-[11px] text-[#D4FF3F] hover:underline flex items-center gap-0.5"
                        >
                          <Plus size={11} /> Add
                        </button>
                      </div>

                      {(pkg.deliverables || []).map((item, dIdx) => (
                        <div key={`deliv-${dIdx}`} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const val = e.target.value;
                              update((p) => {
                                const next = [...p.packages];
                                const updatedDeliverables = [...(next[index].deliverables || [])];
                                updatedDeliverables[dIdx] = val;
                                next[index] = { ...next[index], deliverables: updatedDeliverables };
                                return { ...p, packages: next };
                              });
                            }}
                            className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2.5 py-1 text-xs font-mono text-[#D4FF3F]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              update((p) => {
                                const next = [...p.packages];
                                const filtered = (next[index].deliverables || []).filter((_, i) => i !== dIdx);
                                next[index] = { ...next[index], deliverables: filtered };
                                return { ...p, packages: next };
                              });
                            }}
                            className="p-1 hover:text-[#FF2DA8] text-[#FF2DA8]"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div>
                        <label className="font-mono text-[10px] text-[#FF2DA8] uppercase">CTA Button Text</label>
                        <input
                          type="text"
                          value={pkg.cta || "TALK TO US"}
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.packages];
                              next[index] = { ...next[index], cta: val };
                              return { ...p, packages: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2.5 py-1 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-[#FF2DA8] uppercase">Serial Code</label>
                        <input
                          type="text"
                          value={pkg.serial || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.packages];
                              next[index] = { ...next[index], serial: val };
                              return { ...p, packages: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2.5 py-1 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CASE STUDIES */}
          {activeTab === "cases" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0B0B0B] pb-4">
                <div>
                  <h2 className="font-display font-bold text-xl text-[#D4FF3F]">Client Case Studies &amp; Proof</h2>
                  <p className="font-mono text-xs text-[#FF2DA8]">
                    Detailed proof stories with follower metrics, Google reviews, and deliverables.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newCase = {
                      title: "New Client Success Story",
                      type: "Case study",
                      label: "CASE / RETAIL",
                      meta: "READ",
                      client: "Client Business",
                      handle: "@client_handle",
                      location: "Thoothukudi",
                      growthMultiplier: "3.5x",
                      followersStart: "500",
                      followersNow: "2,000",
                      newFollowers: "+1,500",
                      topViews: "15.0K",
                      postsCount: "50",
                      googleRating: "4.8 / 5",
                      googleReviews: "50 reviews",
                      goal: "Increase local footfall and scale follower reach in Thoothukudi.",
                      shot: "On-location reels, product walkarounds, and Google Maps optimization.",
                      result: "Tripled follower base and drove consistent weekly walk-ins.",
                      industries: ["everything"],
                      posterSrc: "",
                      videoSrc: "",
                    };
                    update((p) => ({ ...p, caseStudies: [...(p.caseStudies || []), newCase] }));
                  }}
                  className="px-3.5 py-2 rounded bg-[#D4FF3F] hover:bg-[#D4FF3F] text-[#0B0B0B] font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0"
                  style={{ color: "#0B0B0B" }}
                >
                  <Plus size={14} style={{ color: "#0B0B0B" }} />
                  <span style={{ color: "#0B0B0B" }}>ADD CASE STUDY</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {content.caseStudies?.map((cs, index) => (
                  <div
                    key={`case-${index}`}
                    className="p-5 rounded-lg border border-[#0B0B0B] bg-[#0B0B0B] space-y-4 hover:border-[#0B0B0B] transition-colors"
                  >
                    <div className="flex items-center justify-between border-b border-[#0B0B0B] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-[#0B0B0B] text-[#D4FF3F] px-2 py-0.5 rounded border border-[#0B0B0B]">
                          CASE #{index + 1}
                        </span>
                        <span className="font-mono text-xs text-[#D4FF3F] font-semibold">{cs.client}</span>
                        <span className="font-mono text-[11px] text-[#FF2DA8]">({cs.location})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete case study for "${cs.client}"?`)) {
                            update((p) => ({ ...p, caseStudies: p.caseStudies.filter((_, i) => i !== index) }));
                          }
                        }}
                        className="p-1.5 rounded hover:bg-[#FF2DA8]/20 text-[#FF2DA8]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="font-mono text-[10px] text-[#FF2DA8] uppercase">Client Name</label>
                        <input
                          type="text"
                          value={cs.client || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.caseStudies];
                              next[index] = { ...next[index], client: val, title: val };
                              return { ...p, caseStudies: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2.5 py-1 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-[#FF2DA8] uppercase">Instagram Handle</label>
                        <input
                          type="text"
                          value={cs.handle || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.caseStudies];
                              next[index] = { ...next[index], handle: val };
                              return { ...p, caseStudies: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2.5 py-1 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-[#FF2DA8] uppercase">Location</label>
                        <input
                          type="text"
                          value={cs.location || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.caseStudies];
                              next[index] = { ...next[index], location: val };
                              return { ...p, caseStudies: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2.5 py-1 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-[#FF2DA8] uppercase">Growth Multiplier</label>
                        <input
                          type="text"
                          value={cs.growthMultiplier || ""}
                          placeholder="e.g. 5.8x"
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.caseStudies];
                              next[index] = { ...next[index], growthMultiplier: val };
                              return { ...p, caseStudies: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2.5 py-1 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="font-mono text-[10px] text-[#FF2DA8] uppercase">Followers Before</label>
                        <input
                          type="text"
                          value={cs.followersStart || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.caseStudies];
                              next[index] = { ...next[index], followersStart: val };
                              return { ...p, caseStudies: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2.5 py-1 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-[#FF2DA8] uppercase">Followers Now</label>
                        <input
                          type="text"
                          value={cs.followersNow || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.caseStudies];
                              next[index] = { ...next[index], followersNow: val };
                              return { ...p, caseStudies: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2.5 py-1 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-[#FF2DA8] uppercase">Top Views</label>
                        <input
                          type="text"
                          value={cs.topViews || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.caseStudies];
                              next[index] = { ...next[index], topViews: val };
                              return { ...p, caseStudies: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2.5 py-1 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-[#FF2DA8] uppercase">Google Rating</label>
                        <input
                          type="text"
                          value={cs.googleRating || ""}
                          placeholder="e.g. 4.5 / 5"
                          onChange={(e) => {
                            const val = e.target.value;
                            update((p) => {
                              const next = [...p.caseStudies];
                              next[index] = { ...next[index], googleRating: val };
                              return { ...p, caseStudies: next };
                            });
                          }}
                          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2.5 py-1 text-xs font-mono text-[#D4FF3F]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SmartMediaInput
                        label="Case Video URL"
                        value={cs.videoSrc || ""}
                        mediaType="video"
                        onChange={(url) => {
                          update((p) => {
                            const next = [...p.caseStudies];
                            next[index] = { ...next[index], videoSrc: url };
                            return { ...p, caseStudies: next };
                          });
                        }}
                      />
                      <SmartMediaInput
                        label="Case Poster Image"
                        value={cs.posterSrc || ""}
                        mediaType="image"
                        onChange={(url) => {
                          update((p) => {
                            const next = [...p.caseStudies];
                            next[index] = { ...next[index], posterSrc: url };
                            return { ...p, caseStudies: next };
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SPEED & PROCESS */}
          {activeTab === "process" && (
            <div className="space-y-6">
              <div className="border-b border-[#0B0B0B] pb-4">
                <h2 className="font-display font-bold text-xl text-[#D4FF3F]">Speed &amp; Production Pipeline</h2>
                <p className="font-mono text-xs text-[#FF2DA8]">
                  The 4 production phases: Brief, Shoot, Edit, and Delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {content.speed?.map((step, index) => (
                  <div
                    key={`step-${index}`}
                    className="p-5 rounded-lg border border-[#0B0B0B] bg-[#0B0B0B] space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[#0B0B0B] pb-2">
                      <span className="font-mono text-xs text-[#D4FF3F] font-bold">PHASE 0{index + 1}</span>
                      <input
                        type="text"
                        value={step.meta || ""}
                        placeholder="e.g. Day 01"
                        onChange={(e) => {
                          const val = e.target.value;
                          update((p) => {
                            const next = [...p.speed];
                            next[index] = { ...next[index], meta: val };
                            return { ...p, speed: next };
                          });
                        }}
                        className="bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2 py-0.5 text-xs font-mono text-[#D4FF3F] w-28 text-right"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Phase Title</label>
                      <input
                        type="text"
                        value={step.title || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          update((p) => {
                            const next = [...p.speed];
                            next[index] = { ...next[index], title: val };
                            return { ...p, speed: next };
                          });
                        }}
                        className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">What Happens</label>
                      <textarea
                        rows={3}
                        value={step.body || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          update((p) => {
                            const next = [...p.speed];
                            next[index] = { ...next[index], body: val };
                            return { ...p, speed: next };
                          });
                        }}
                        className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: FAQ & TESTIMONIALS */}
          {activeTab === "faq" && (
            <div className="space-y-8">
              {/* Testimonials */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#0B0B0B] pb-3">
                  <div>
                    <h2 className="font-display font-bold text-lg text-[#D4FF3F]">Client Testimonials (Filmstrip)</h2>
                    <p className="font-mono text-xs text-[#FF2DA8]">Quotes displayed in the filmstrip stagger carousel.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newT = {
                        name: "Client Business",
                        role: "Thoothukudi (Growth & Results)",
                        quote: "27 Creative Studio transformed our social media and brought consistent walk-ins every week.",
                      };
                      update((p) => ({ ...p, testimonials: [...(p.testimonials || []), newT] }));
                    }}
                    className="px-3 py-1.5 rounded bg-[#D4FF3F] hover:bg-[#D4FF3F] text-[#0B0B0B] font-mono text-xs font-bold uppercase inline-flex items-center gap-1"
                    style={{ color: "#0B0B0B" }}
                  >
                    <Plus size={13} style={{ color: "#0B0B0B" }} />
                    <span style={{ color: "#0B0B0B" }}>ADD QUOTE</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.testimonials?.map((t, index) => (
                    <div key={`test-${index}`} className="p-4 rounded border border-[#0B0B0B] bg-[#0B0B0B] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-[#D4FF3F]">QUOTE #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            update((p) => ({ ...p, testimonials: p.testimonials.filter((_, i) => i !== index) }));
                          }}
                          className="text-[#FF2DA8] p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={t.name || ""}
                        placeholder="Client Name"
                        onChange={(e) => {
                          const val = e.target.value;
                          update((p) => {
                            const next = [...p.testimonials];
                            next[index] = { ...next[index], name: val };
                            return { ...p, testimonials: next };
                          });
                        }}
                        className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2.5 py-1 text-xs font-mono text-[#D4FF3F]"
                      />
                      <input
                        type="text"
                        value={t.role || ""}
                        placeholder="Location & growth stats"
                        onChange={(e) => {
                          const val = e.target.value;
                          update((p) => {
                            const next = [...p.testimonials];
                            next[index] = { ...next[index], role: val };
                            return { ...p, testimonials: next };
                          });
                        }}
                        className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2.5 py-1 text-xs font-mono text-[#D4FF3F]"
                      />
                      <textarea
                        rows={2}
                        value={t.quote || ""}
                        placeholder="Client quote..."
                        onChange={(e) => {
                          const val = e.target.value;
                          update((p) => {
                            const next = [...p.testimonials];
                            next[index] = { ...next[index], quote: val };
                            return { ...p, testimonials: next };
                          });
                        }}
                        className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2.5 py-1 text-xs font-mono text-[#D4FF3F]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <div className="space-y-4 pt-4 border-t border-[#0B0B0B]">
                <div className="flex items-center justify-between border-b border-[#0B0B0B] pb-3">
                  <div>
                    <h2 className="font-display font-bold text-lg text-[#D4FF3F]">Frequently Asked Questions</h2>
                    <p className="font-mono text-xs text-[#FF2DA8]">Accordion items in the Q&amp;A section.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newFaq = {
                        category: "Packages",
                        question: "New Question Title",
                        answer: "Detailed answer explaining our process or service.",
                      };
                      update((p) => ({ ...p, faqs: [...(p.faqs || []), newFaq] }));
                    }}
                    className="px-3 py-1.5 rounded bg-[#D4FF3F] hover:bg-[#D4FF3F] text-[#0B0B0B] font-mono text-xs font-bold uppercase inline-flex items-center gap-1"
                    style={{ color: "#0B0B0B" }}
                  >
                    <Plus size={13} style={{ color: "#0B0B0B" }} />
                    <span style={{ color: "#0B0B0B" }}>ADD QUESTION</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {content.faqs?.map((faq, index) => (
                    <div key={`faq-${index}`} className="p-4 rounded border border-[#0B0B0B] bg-[#0B0B0B] space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-[#D4FF3F]">Q #{index + 1}</span>
                          <select
                            value={faq.category || "Packages"}
                            onChange={(e) => {
                              const val = e.target.value;
                              update((p) => {
                                const next = [...p.faqs];
                                next[index] = { ...next[index], category: val };
                                return { ...p, faqs: next };
                              });
                            }}
                            className="bg-[#0B0B0B] border border-[#FF2DA8] rounded px-2 py-0.5 text-xs font-mono text-[#D4FF3F] font-bold focus:outline-none focus:border-[#D4FF3F]"
                          >
                            <option value="Packages">Packages</option>
                            <option value="Process">Process</option>
                            <option value="Pricing">Pricing</option>
                            <option value="Shoot day">Shoot day</option>
                            <option value="Delivery">Delivery</option>
                            <option value="Rights">Rights</option>
                            <option value="Posting">Posting</option>
                            <option value="Working together">Working together</option>
                            <option value="General">General</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            update((p) => ({ ...p, faqs: p.faqs.filter((_, i) => i !== index) }));
                          }}
                          className="text-[#FF2DA8] p-1 hover:opacity-80"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={faq.question || ""}
                        placeholder="Question"
                        onChange={(e) => {
                          const val = e.target.value;
                          update((p) => {
                            const next = [...p.faqs];
                            next[index] = { ...next[index], question: val };
                            return { ...p, faqs: next };
                          });
                        }}
                        className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F] font-semibold"
                      />
                      <textarea
                        rows={3}
                        value={faq.answer || ""}
                        placeholder="Answer..."
                        onChange={(e) => {
                          const val = e.target.value;
                          update((p) => {
                            const next = [...p.faqs];
                            next[index] = { ...next[index], answer: val };
                            return { ...p, faqs: next };
                          });
                        }}
                        className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: STUDIO & GENERAL */}
          {activeTab === "studio" && (
            <div className="space-y-8">
              <div className="border-b border-[#0B0B0B] pb-4">
                <h2 className="font-display font-bold text-xl text-[#D4FF3F]">Studio Identity, Hero &amp; Direct Contact</h2>
                <p className="font-mono text-xs text-[#FF2DA8]">
                  Global headlines, phone numbers, WhatsApp links, studio address, and SEO metadata.
                </p>
              </div>

              {/* Hero Section */}
              <div className="p-5 rounded-lg border border-[#0B0B0B] bg-[#0B0B0B] space-y-4">
                <h3 className="font-mono text-xs uppercase text-[#D4FF3F] font-bold">Hero Section (Above The Fold)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Eyebrow Kicker</label>
                    <input
                      type="text"
                      value={content.hero?.eyebrow || "27 creative studio / thoothukudi"}
                      onChange={(e) => {
                        const val = e.target.value;
                        update((p) => ({ ...p, hero: { ...p.hero, eyebrow: val } }));
                      }}
                      className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Headline</label>
                    <input
                      type="text"
                      value={content.hero?.title || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        update((p) => ({ ...p, hero: { ...p.hero, title: val } }));
                      }}
                      className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Hero Body Text</label>
                  <textarea
                    rows={2}
                    value={content.hero?.body || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      update((p) => ({ ...p, hero: { ...p.hero, body: val } }));
                    }}
                    className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SmartMediaInput
                    label="Hero Video Loop (Google Drive / Cloudinary / MP4)"
                    value={content.hero?.videoSrc || ""}
                    mediaType="video"
                    helpText="Video played inside the skewed hero window. Leave empty for the signature animated lime gradient."
                    onChange={(url) => {
                      update((p) => ({ ...p, hero: { ...p.hero, videoSrc: url } }));
                    }}
                    onGeneratePoster={(pUrl) => {
                      update((p) => ({ ...p, hero: { ...p.hero, posterSrc: pUrl } }));
                    }}
                  />
                  <SmartMediaInput
                    label="Hero Video Poster Fallback"
                    value={content.hero?.posterSrc || ""}
                    mediaType="image"
                    onChange={(url) => {
                      update((p) => ({ ...p, hero: { ...p.hero, posterSrc: url } }));
                    }}
                  />
                </div>
              </div>

              {/* Direct Contact & Physical Studio */}
              <div className="p-5 rounded-lg border border-[#0B0B0B] bg-[#0B0B0B] space-y-4">
                <h3 className="font-mono text-xs uppercase text-[#D4FF3F] font-bold">Contact Channels &amp; Studio Location</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">WhatsApp Number (e.g. 918300478244)</label>
                    <input
                      type="text"
                      value={content.contact?.whatsappNumber || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        update((p) => ({ ...p, contact: { ...p.contact, whatsappNumber: val } }));
                      }}
                      className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Studio Email</label>
                    <input
                      type="text"
                      value={content.contact?.email || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        update((p) => ({ ...p, contact: { ...p.contact, email: val } }));
                      }}
                      className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Instagram Handle</label>
                    <input
                      type="text"
                      value={content.contact?.instagram || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        update((p) => ({ ...p, contact: { ...p.contact, instagram: val } }));
                      }}
                      className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Physical Studio Address</label>
                  <input
                    type="text"
                    value={content.seo?.business?.address?.streetAddress || "Polpettai / Ettayapuram Road"}
                    onChange={(e) => {
                      const val = e.target.value;
                      update((p) => ({
                        ...p,
                        seo: {
                          ...p.seo,
                          business: {
                            ...p.seo.business,
                            address: { ...p.seo.business.address, streetAddress: val },
                          },
                        },
                      }));
                    }}
                    className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                  />
                </div>
              </div>

              {/* SEO & Meta */}
              <div className="p-5 rounded-lg border border-[#0B0B0B] bg-[#0B0B0B] space-y-4">
                <h3 className="font-mono text-xs uppercase text-[#D4FF3F] font-bold">SEO &amp; OpenGraph Sharing</h3>
                <div>
                  <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Site Canonical URL</label>
                  <input
                    type="url"
                    value={content.seo?.url || "https://27-creative-studio.vercel.app"}
                    onChange={(e) => {
                      const val = e.target.value;
                      update((p) => ({
                        ...p,
                        seo: {
                          ...p.seo,
                          url: val,
                          business: { ...p.seo.business, url: val },
                        },
                      }));
                    }}
                    placeholder="https://27-creative-studio.vercel.app"
                    className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                  />
                  <p className="font-mono text-[10px] text-[#FF2DA8] mt-1">
                    Canonical domain used by Googlebot, XML sitemaps, and social share cards.
                  </p>
                </div>
                <div>
                  <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Meta Title</label>
                  <input
                    type="text"
                    value={content.seo?.title || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      update((p) => ({ ...p, seo: { ...p.seo, title: val, ogTitle: val } }));
                    }}
                    className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                  />
                </div>
                <div>
                  <label className="font-mono text-[11px] text-[#FF2DA8] uppercase">Meta Description</label>
                  <textarea
                    rows={2}
                    value={content.seo?.description || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      update((p) => ({ ...p, seo: { ...p.seo, description: val, ogDescription: val } }));
                    }}
                    className="w-full bg-[#0B0B0B] border border-[#FF2DA8] rounded px-3 py-1.5 text-xs font-mono text-[#D4FF3F]"
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
