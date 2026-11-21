"use client";

import React, { useState, useEffect } from "react";
import {
  LogOut,
  ExternalLink,
  Edit3,
  Eye,
  Activity,
  CheckCircle2,
  AlertTriangle,
  User,
  Shield,
} from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { StudioOperationsHub } from "@/components/admin/studio-operations-hub";
import type { TeamMember, TeamRole } from "@/lib/crm-types";

interface RosterItem {
  id: string;
  name: string;
  role: TeamRole;
  title: string;
  email: string;
}

export default function TeamOperationsPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("team-1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [timecode, setTimecode] = useState("00:00:00:00");
  const [googleConfigured, setGoogleConfigured] = useState(false);

  // Read URL search params for OAuth errors on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const oauthErr = params.get("error");
      if (oauthErr) {
        if (oauthErr === "unauthorized_email") {
          const attemptEmail = params.get("email") || "this account";
          setError(`Access Denied: ${attemptEmail} is not authorized. Add to ADMIN_ALLOWED_EMAILS in .env.`);
        } else if (oauthErr === "google_not_configured") {
          setError("Google Sign-In is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.");
        } else if (oauthErr === "invalid_oauth_state") {
          setError("OAuth security verification failed. Please try signing in again.");
        } else if (oauthErr === "google_token_failed") {
          const details = params.get("details");
          setError(`Google rejected token exchange: ${details || "Verify GOOGLE_CLIENT_SECRET and redirect URIs."}`);
        } else {
          setError(`Google Sign-In returned: ${oauthErr}`);
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

  // Check existing session on mount
  const checkSession = async () => {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      const json = await res.json();
      setAuthenticated(Boolean(json.authenticated));
      setGoogleConfigured(Boolean(json.googleConfigured));
      if (json.member) setCurrentMember(json.member);
      if (json.roster) {
        setRoster(json.roster);
        if (!selectedMemberId && json.roster.length > 0) {
          setSelectedMemberId(json.roster[0].id);
        }
      }
    } catch {
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleOperativeLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMemberId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to sign in as operative.");
        setBusy(false);
        return;
      }

      // Re-fetch session to load authenticated member profile
      await checkSession();
    } catch {
      setError("Connection error while signing in.");
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    setAuthenticated(false);
    setCurrentMember(null);
  };

  // Loading state
  if (authenticated === null) {
    return (
      <main className="min-h-screen bg-[#0B0B0F] text-[#F4F1EA] flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-2 text-[#C6FF3D]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C6FF3D] animate-ping" />
          <span>VERIFYING STUDIO CLEARANCE…</span>
        </div>
      </main>
    );
  }

  // Unauthenticated: Production Login Screen with Identity Selection
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#0B0B0F] text-[#F4F1EA] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(198,255,61,0.06),transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between gap-3 font-mono text-xs z-20 pointer-events-none">
          <span className="text-[#A9A7A0] tracking-widest text-[11px] sm:text-xs">
            SYS // 27_TEAM_OPERATIONS
          </span>
          <span className="text-[#C6FF3D] tracking-widest text-[11px] sm:text-xs shrink-0">
            {timecode}
          </span>
        </div>

        <div className="relative z-10 w-full max-w-md bg-[#121217] border border-[#232326] p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center">
          <BrandLockup href="/" className="mb-4" />
          <p className="font-mono text-xs text-[#C6FF3D] uppercase tracking-widest mb-1 flex items-center gap-1.5 font-bold">
            <Activity size={13} />
            <span>Studio Operations Division</span>
          </p>
          <h1 className="font-display font-bold text-2xl text-[#F4F1EA] mb-2">
            Team &amp; Client Access
          </h1>
          <p className="text-xs text-[#A9A7A0] font-mono mb-6 leading-relaxed">
            Role-governed clearance for Directors, Producers, Cinematographers, Editors, and Client Partners.
          </p>

          {/* Google Sign-In (Matches Google email directly to team role) */}
          <div className="w-full space-y-2 mb-2">
            <a
              href="/api/admin/auth/google?returnTo=/team"
              className="w-full py-2.5 px-4 rounded-xl bg-[#FFFFFF] hover:bg-[#F2F2F2] text-[#1F1F1F] font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 border border-[#E0E0E0] shadow-sm hover:shadow cursor-pointer"
              style={{ color: "#1F1F1F" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.67-4.94H1.28v3.15C3.26 21.33 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.33 14.26c-.24-.72-.38-1.49-.38-2.26s.14-1.54.38-2.26V6.59H1.28C.46 8.22 0 10.05 0 12s.46 3.78 1.28 5.41l4.05-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.67 1.28 6.59l4.05 3.15c.94-2.84 3.57-4.99 6.67-4.99z"
                />
              </svg>
              <span style={{ color: "#1F1F1F" }}>SIGN IN WITH GOOGLE</span>
            </a>
          </div>

          {/* Divider */}
          <div className="w-full flex items-center my-4">
            <div className="flex-1 border-t border-[#232326]" />
            <span className="px-3 font-mono text-[10px] text-[#A9A7A0] uppercase tracking-wider">
              OR DIRECT OPERATIVE SIGN-IN
            </span>
            <div className="flex-1 border-t border-[#232326]" />
          </div>

          {/* Identity Form */}
          <form onSubmit={handleOperativeLogin} className="w-full space-y-4 font-mono text-left">
            <div>
              <label className="text-[11px] text-[#A9A7A0] block mb-1.5 uppercase font-bold flex items-center gap-1.5">
                <User size={12} className="text-[#C6FF3D]" />
                Select Operative Account
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full h-10 bg-[#16161D] border border-[#2A2A30] rounded-xl px-3 text-xs text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D] transition-colors"
              >
                {roster.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.title} [{m.role.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-xs text-[#FF5C5C] text-left leading-relaxed">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full h-11 px-4 rounded-xl bg-[#C6FF3D] hover:bg-[#b0f025] !text-[#0B0B0F] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#C6FF3D]/10 hover:scale-[1.01]"
              style={{ color: "#0B0B0F" }}
            >
              <span style={{ color: "#0B0B0F" }}>{busy ? "CONNECTING TO STATION…" : "ENTER CREW STATION →"}</span>
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Authenticated: Full-Screen Studio Operations Division
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-[#F4F1EA] flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0E0E14] border-b border-[#232326] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandLockup href="/" />
          <span className="text-[#444] font-mono text-xs hidden sm:inline" aria-hidden="true">
            /
          </span>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#F4F1EA] font-semibold">
            <Activity size={13} className="text-[#C6FF3D]" />
            <span className="tracking-wide">Team Operations Hub</span>
          </div>
          <span className="font-mono text-[11px] text-[#8E8D9A] bg-[#16161D] px-2 py-0.5 rounded border border-[#2A2A30] hidden lg:inline">
            {timecode}
          </span>
        </div>

        {/* Action Controls & Sign Out */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Switch to /admin */}
          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 rounded-lg border border-[#2A2A30] hover:border-[#F4F1EA] text-[#A9A7A0] hover:text-[#F4F1EA] font-mono text-xs transition-colors uppercase font-bold"
          >
            <Edit3 size={13} />
            <span className="hidden sm:inline">Site Content CMS</span>
            <span>↗</span>
          </a>

          {/* Live Preview */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 rounded-lg border border-[#2A2A30] hover:border-[#F4F1EA] text-[#A9A7A0] hover:text-[#F4F1EA] font-mono text-xs transition-colors uppercase"
          >
            <Eye size={13} />
            <span className="hidden sm:inline">Live Site</span>
            <span>↗</span>
          </a>

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleSignOut}
            title="Sign out of operative session"
            aria-label="Sign out"
            className="h-8 w-8 sm:h-9 sm:w-9 inline-flex items-center justify-center rounded-lg border border-[#2A2A30] hover:border-[#FF5C5C] text-[#A9A7A0] hover:text-[#FF5C5C] transition-colors cursor-pointer"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Main Operations Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto w-full">
        <StudioOperationsHub currentMember={currentMember} />
      </main>
    </div>
  );
}
