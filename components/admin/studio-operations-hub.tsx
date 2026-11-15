"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  TrendingUp,
  Users,
  Video,
  Zap,
  Check,
  Award,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  AlertTriangle,
  UserCheck,
  Eye,
  Sliders,
  DollarSign,
  Sparkles,
  Camera,
  Film,
  Layers,
  Lock,
  User,
  ArrowRight,
  Filter,
  CheckSquare,
  Square,
  HelpCircle,
  Sunrise,
  Sunset,
  Crosshair,
  Radio,
  X,
  Maximize2,
  SlidersHorizontal,
} from "lucide-react";
import {
  ClientRecord,
  InquiryRecord,
  ShootRecord,
  AnalyticsSummary,
  TeamRole,
  InquiryStatus,
  ShootStatus,
  TeamMember,
  ROLE_PERMISSIONS,
} from "@/lib/crm-types";

function InstagramIcon({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function getRoleAccent(role: TeamRole) {
  switch (role) {
    case "principal":
      return "#C6FF3D";
    case "producer":
      return "#38BDF8";
    case "crew":
      return "#FBBF24";
    case "editor":
      return "#E879F9";
    case "client":
      return "#A78BFA";
  }
}

const PIPELINE_STAGES: { id: InquiryStatus; label: string; accent: string }[] = [
  { id: "new", label: "NEW BRIEFS", accent: "#C6FF3D" },
  { id: "contacted", label: "CONTACTED", accent: "#38BDF8" },
  { id: "call_scheduled", label: "CALL SET", accent: "#A78BFA" },
  { id: "shoot_booked", label: "SHOOT BOOKED", accent: "#FBBF24" },
  { id: "in_production", label: "FILMING", accent: "#FB923C" },
  { id: "in_edit", label: "IN EDIT", accent: "#E879F9" },
  { id: "delivered", label: "DELIVERED", accent: "#4ADE80" },
];

export function StudioOperationsHub({ currentMember }: { currentMember?: TeamMember | null }) {
  // Real authenticated role locked from session
  const realRole: TeamRole = currentMember?.role || "principal";
  const [activeRole, setActiveRole] = useState<TeamRole>(realRole);
  const [auditMember, setAuditMember] = useState<TeamMember | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<"pipeline" | "clients" | "shoots" | "rbac">("pipeline");

  // Data states
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [shoots, setShoots] = useState<ShootRecord[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isCloudConfigured, setIsCloudConfigured] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [syncingClientId, setSyncingClientId] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null);

  // Modals
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddShootModal, setShowAddShootModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);

  // Form states
  const [newLead, setNewLead] = useState({
    client_name: "",
    contact: "",
    business_name: "",
    business_type: "restaurant",
    deliverables: ["Reels & video content"],
    story: "",
    deal_value: 25000,
    status: "new" as InquiryStatus,
    assigned_to: currentMember ? currentMember.name : "Kirubakaran (Kiru)",
  });

  const [newShoot, setNewShoot] = useState({
    client_name: "",
    shoot_date: new Date().toISOString().split("T")[0],
    call_time: "09:00 AM",
    location_address: "Polpettai, Thoothukudi",
    google_maps_link: "",
    assigned_crew: ["Director (Kiru)", "Cinematographer (Arun)"],
    gear_checklist: [
      "Sony FX3 Cinema Body",
      "Sony 24-70mm f/2.8 GM",
      "Wireless Mic Kit",
      "Godox Lighting Kit",
      "SanDisk 128GB V90 Cards",
    ],
    deliverable_reels: 4,
    deliverable_films: 1,
    status: "scheduled" as ShootStatus,
    notes: "",
  });

  const [newClient, setNewClient] = useState({
    brand_name: "",
    business_type: "restaurant",
    primary_contact: "",
    phone: "",
    email: "",
    instagram_handle: "",
    google_maps_url: "",
    live_followers: 2500,
    follower_start: 1000,
    top_reel_views: "15K views",
    total_revenue: 35000,
  });

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    role: "crew" as TeamRole,
    title: "Cinematographer",
  });

  // Sync role when currentMember updates
  useEffect(() => {
    if (currentMember) {
      setActiveRole(currentMember.role);
      if (currentMember.role === "crew") setActiveSubTab("shoots");
      if (currentMember.role === "editor") setActiveSubTab("pipeline");
    }
  }, [currentMember]);

  // Dynamic Permissions based on active role
  const permissions = ROLE_PERMISSIONS[activeRole];

  // Load CRM data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/crm");
      const json = await res.json();
      if (json.success) {
        setAnalytics(json.analytics);
        setInquiries(json.inquiries);
        setClients(json.clients);
        setShoots(json.shoots);
        setTeamMembers(json.teamMembers || []);
        setIsCloudConfigured(json.isSupabaseConfigured);
      }
    } catch (err) {
      console.error("Failed to load CRM data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const flashMessage = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleUpdateLeadStatus = async (id: string, newStatus: InquiryStatus) => {
    try {
      const res = await fetch(`/api/admin/crm/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "inquiry", status: newStatus }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
        );
        flashMessage(`✓ Lead moved to: ${newStatus.replace("_", " ").toUpperCase()}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStepStage = (id: string, currentStatus: InquiryStatus, direction: "next" | "prev") => {
    const stageIds: InquiryStatus[] = [
      "new",
      "contacted",
      "call_scheduled",
      "shoot_booked",
      "in_production",
      "in_edit",
      "delivered",
    ];
    const currentIndex = stageIds.indexOf(currentStatus);
    if (currentIndex === -1) return;
    const targetIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < stageIds.length) {
      handleUpdateLeadStatus(id, stageIds[targetIndex]);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brief?")) return;
    try {
      const res = await fetch(`/api/admin/crm/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInquiries((prev) => prev.filter((i) => i.id !== id));
        flashMessage("Lead removed from pipeline.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.client_name.trim() || !newLead.contact.trim()) return;

    try {
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "inquiry", data: newLead }),
      });
      const json = await res.json();
      if (json.success) {
        setInquiries((prev) => [json.item, ...prev]);
        setShowAddLeadModal(false);
        setNewLead({
          client_name: "",
          contact: "",
          business_name: "",
          business_type: "restaurant",
          deliverables: ["Reels & video content"],
          story: "",
          deal_value: 25000,
          status: "new",
          assigned_to: currentMember ? currentMember.name : "Kirubakaran (Kiru)",
        });
        flashMessage("✓ New client brief recorded into pipeline.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateShoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShoot.client_name.trim()) return;

    try {
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "shoot", data: newShoot }),
      });
      const json = await res.json();
      if (json.success) {
        setShoots((prev) => [...prev, json.item]);
        setShowAddShootModal(false);
        flashMessage("✓ Production shoot scheduled.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateShootStatus = async (id: string, newStatus: ShootStatus) => {
    try {
      const res = await fetch(`/api/admin/crm/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "shoot", status: newStatus }),
      });
      if (res.ok) {
        setShoots((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
        );
        flashMessage(`✓ Shoot status updated to ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleShootGear = async (shootId: string, gearItem: string) => {
    try {
      setShoots((prev) =>
        prev.map((s) => {
          if (s.id !== shootId) return s;
          const packed = new Set(s.packed_gear || []);
          if (packed.has(gearItem)) packed.delete(gearItem);
          else packed.add(gearItem);
          return { ...s, packed_gear: Array.from(packed) };
        })
      );

      const res = await fetch(`/api/admin/crm/${shootId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "shoot_gear", gearItem }),
      });
      if (res.ok) {
        flashMessage(`✓ Gear item toggled: ${gearItem}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncSocials = async (clientId: string, clientName: string) => {
    setSyncingClientId(clientId);
    try {
      const res = await fetch(`/api/admin/crm/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sync_socials" }),
      });
      const json = await res.json();
      if (json.success && json.item) {
        setClients((prev) =>
          prev.map((c) => (c.id === clientId ? json.item : c))
        );
        flashMessage(`⚡ Live socials refreshed for ${clientName}! Followers: ${json.item.live_followers.toLocaleString()}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingClientId(null);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.brand_name.trim()) return;

    try {
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "client", data: newClient }),
      });
      const json = await res.json();
      if (json.success) {
        setClients((prev) => [json.item, ...prev]);
        setShowAddClientModal(false);
        setNewClient({
          brand_name: "",
          business_type: "restaurant",
          primary_contact: "",
          phone: "",
          email: "",
          instagram_handle: "",
          google_maps_url: "",
          live_followers: 2500,
          follower_start: 1000,
          top_reel_views: "15K views",
          total_revenue: 35000,
        });
        flashMessage("✓ New client added to portfolio.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: TeamRole) => {
    try {
      const res = await fetch(`/api/admin/crm/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "team_member", role: newRole }),
      });
      if (res.ok) {
        setTeamMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
        );
        flashMessage(`✓ Role updated to ${newRole.toUpperCase()} for team member.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    try {
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "team_member", data: newMember }),
      });
      const json = await res.json();
      if (json.success) {
        setTeamMembers((prev) => [...prev, json.item]);
        setShowAddMemberModal(false);
        setNewMember({
          name: "",
          email: "",
          phone: "",
          role: "crew",
          title: "Cinematographer",
        });
        flashMessage("✓ New team member onboarded to studio roster.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    try {
      const res = await fetch(`/api/admin/crm/${id}?type=team_member`, { method: "DELETE" });
      if (res.ok) {
        setTeamMembers((prev) => prev.filter((m) => m.id !== id));
        flashMessage("Team member removed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered lists
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        inq.client_name.toLowerCase().includes(q) ||
        (inq.business_name && inq.business_name.toLowerCase().includes(q)) ||
        inq.contact.toLowerCase().includes(q) ||
        inq.deliverables.some((d) => d.toLowerCase().includes(q));

      if (activeRole === "editor") {
        return matchSearch && (inq.status === "in_production" || inq.status === "in_edit" || inq.status === "delivered");
      }

      if (activeRole === "client") {
        const brandMatch = currentMember?.name.toLowerCase() || "thamira";
        return matchSearch && (inq.client_name.toLowerCase().includes(brandMatch) || inq.business_name?.toLowerCase().includes(brandMatch));
      }

      return matchSearch;
    });
  }, [inquiries, searchQuery, activeRole, currentMember]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = searchQuery.toLowerCase();
      const match =
        c.brand_name.toLowerCase().includes(q) ||
        c.primary_contact.toLowerCase().includes(q) ||
        (c.instagram_handle && c.instagram_handle.toLowerCase().includes(q));

      if (activeRole === "client") {
        const brandMatch = currentMember?.name.toLowerCase() || "thamira";
        return match && c.brand_name.toLowerCase().includes(brandMatch);
      }
      return match;
    });
  }, [clients, searchQuery, activeRole, currentMember]);

  const filteredShoots = useMemo(() => {
    return shoots.filter((s) => {
      const q = searchQuery.toLowerCase();
      const match =
        s.client_name.toLowerCase().includes(q) ||
        s.location_address.toLowerCase().includes(q);

      if (activeRole === "client") {
        const brandMatch = currentMember?.name.toLowerCase() || "thamira";
        return match && s.client_name.toLowerCase().includes(brandMatch);
      }
      return match;
    });
  }, [shoots, searchQuery, activeRole, currentMember]);

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center font-mono text-xs text-[#A9A7A0]">
        <div className="flex items-center gap-2.5 text-[#C6FF3D] mb-2">
          <RefreshCw size={16} className="animate-spin" />
          <span className="tracking-widest">SYNCHRONIZING WITH STUDIO DATABASE…</span>
        </div>
        <p className="text-[11px] text-[#666]">Connecting to live Supabase Cloud node</p>
      </div>
    );
  }

  // ========================================================
  // SPECIAL CLIENT PORTAL VIEW
  // ========================================================
  if (activeRole === "client") {
    const brandQuery = currentMember?.name.toLowerCase() || "thamira";
    const clientRecord = clients.find((c) => c.brand_name.toLowerCase().includes(brandQuery)) || clients[0];
    const clientShoot = shoots.find((s) => s.client_name.toLowerCase().includes(brandQuery)) || shoots[0];

    return (
      <div className="space-y-6">
        {auditMember && (
          <div className="p-3 bg-[#FBBF24]/10 border border-[#FBBF24] rounded-lg font-mono text-xs text-[#FBBF24] flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2">
              <Shield size={14} />
              <span>AUDIT MODE: Inspecting interface clearance as {auditMember.name} (Client Partner)</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setAuditMember(null);
                setActiveRole(realRole);
              }}
              className="px-2.5 py-1 rounded bg-[#FBBF24] text-[#0B0B0F] font-bold uppercase text-[10px] cursor-pointer"
            >
              Exit Audit Mode
            </button>
          </div>
        )}

        <div className="p-6 rounded-xl bg-[#121217] border border-[#232326] relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs text-[#C6FF3D] uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={12} />
                <span>27 CREATIVE STUDIO // CLIENT PRODUCTION PORTAL</span>
              </span>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-[#F4F1EA] mt-1">
                {clientRecord ? clientRecord.brand_name : "Your Brand Project"}
              </h1>
              <p className="font-mono text-xs text-[#A9A7A0] mt-1">
                Primary Contact: {clientRecord ? clientRecord.primary_contact : "Partner"} • Location: Thoothukudi
              </p>
            </div>
            <a
              href="https://wa.me/918300478244?text=Hello%20Kirubakaran,%20inquiring%20about%20our%20project%20status."
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-lg bg-[#C6FF3D] hover:bg-[#b0f025] !text-[#0B0B0F] font-mono text-xs font-bold uppercase inline-flex items-center gap-2 self-start md:self-auto shadow-lg shadow-[#C6FF3D]/10 cursor-pointer"
              style={{ color: "#0B0B0F" }}
            >
              <MessageSquare size={14} style={{ color: "#0B0B0F" }} />
              <span>DIRECT WHATSAPP WITH DIRECTOR</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-[#232326] bg-[#121217]">
            <span className="font-mono text-xs text-[#A9A7A0] uppercase">CURRENT STATUS</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FB923C] animate-pulse" />
              <span className="font-display font-bold text-xl text-[#F4F1EA]">IN PRODUCTION &amp; FILMING</span>
            </div>
            <p className="font-mono text-xs text-[#A9A7A0] mt-2">
              Our cinema team is actively on location filming commercial assets with Sony FX3 cinema cameras.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[#232326] bg-[#121217]">
            <span className="font-mono text-xs text-[#A9A7A0] uppercase">DELIVERABLES LOCKED</span>
            <div className="mt-2 font-display font-bold text-xl text-[#C6FF3D]">
              4 4K Vertical Reels + 1 Brand Film
            </div>
            <p className="font-mono text-xs text-[#A9A7A0] mt-2">
              Color graded, sound designed, and optimized for 9:16 Instagram algorithm distribution.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[#232326] bg-[#121217]">
            <span className="font-mono text-xs text-[#A9A7A0] uppercase">LIVE FOLLOWER TRACKER</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-2xl text-[#38BDF8]">
                {clientRecord ? clientRecord.live_followers.toLocaleString() : "10,100"}
              </span>
              <span className="font-mono text-xs text-[#4ADE80]">
                (+{clientRecord ? clientRecord.growth_multiplier : "6.1"}x growth)
              </span>
            </div>
            <p className="font-mono text-xs text-[#A9A7A0] mt-2">
              Live tracking Instagram page velocity &amp; viral reels performance.
            </p>
          </div>
        </div>

        {clientShoot && (
          <div className="p-5 rounded-xl border border-[#232326] bg-[#121217] space-y-3">
            <div className="flex items-center justify-between border-b border-[#232326] pb-3">
              <span className="font-mono text-xs text-[#C6FF3D] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} />
                <span>UPCOMING PRODUCTION SHOOT CALL SHEET</span>
              </span>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#1C1F16] text-[#C6FF3D] border border-[#C6FF3D]/30">
                DATE: {clientShoot.shoot_date}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-1">
              <div>
                <span className="text-[#A9A7A0] block text-[10px] uppercase">CALL TIME</span>
                <span className="text-[#F4F1EA] font-bold text-sm">{clientShoot.call_time}</span>
              </div>
              <div>
                <span className="text-[#A9A7A0] block text-[10px] uppercase">LOCATION ADDRESS</span>
                <span className="text-[#F4F1EA] break-words block">{clientShoot.location_address}</span>
              </div>
              <div>
                <span className="text-[#A9A7A0] block text-[10px] uppercase">CREW ASSIGNED</span>
                <span className="text-[#F4F1EA]">{clientShoot.assigned_crew.join(", ")}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========================================================
  // MAIN STUDIO OPERATIONS DIVISION
  // ========================================================
  return (
    <div className="space-y-6">
      {/* Impersonation Audit Banner */}
      {auditMember && (
        <div className="p-3 bg-[#FBBF24]/10 border border-[#FBBF24] rounded-xl font-mono text-xs text-[#FBBF24] flex items-center justify-between shadow-md">
          <span className="flex items-center gap-2">
            <Shield size={14} />
            <span>AUDIT MODE: Inspecting interface clearance as {auditMember.name} ({auditMember.role.toUpperCase()})</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setAuditMember(null);
              setActiveRole(realRole);
            }}
            className="px-2.5 py-1 rounded bg-[#FBBF24] text-[#0B0B0F] font-bold uppercase text-[10px] hover:bg-[#e0ab16] cursor-pointer"
          >
            Exit Audit Mode
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. OPERATIONS HEADER & UNIFIED CONTROL BAR               */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        {/* Left: Studio Identity & Cinema Rec Chip */}
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-[#C6FF3D] uppercase tracking-wider flex items-center gap-1.5">
                <Film size={13} className="text-[#C6FF3D]" />
                <span>STUDIO OPERATIONS CONSOLE</span>
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-[#A9A7A0] border border-white/[0.08] tracking-widest font-semibold uppercase">
                24FPS DCI
              </span>
            </div>
            <h1 className="font-display font-black text-xl sm:text-2xl text-[#F4F1EA] tracking-tight mt-0.5">
              Commercial Productions &amp; Shoot Division
            </h1>
          </div>

          {/* Minimal Cinema Rec Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/[0.08] font-mono text-[11px] text-[#A9A7A0] shadow-inner ml-2">
            <span className="flex items-center gap-1.5 text-[#EF4444] font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
              REC
            </span>
            <span className="text-white/40">•</span>
            <span className="text-[#F4F1EA] font-semibold">SONY FX3 4K</span>
            <span className="text-white/40">•</span>
            <span className="text-[#38BDF8]">S-Cinetone / S-Log3</span>
            <span className="text-white/40">•</span>
            <span className="text-[#FBBF24]">180.0° SHUTTER</span>
          </div>
        </div>

        {/* Right: Cloud Sync Pill & Authenticated User Capsule */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Cloud Badge */}
          <button
            type="button"
            onClick={() => setShowSchemaModal(true)}
            className={`px-3 py-1.5 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all border cursor-pointer ${
              isCloudConfigured
                ? "bg-[#0c1929] text-[#38BDF8] border-[#38BDF8]/40 hover:border-[#38BDF8] hover:bg-[#0c1929]/80 shadow-sm"
                : "bg-[#1c1917] text-[#FBBF24] border-[#FBBF24]/40 hover:border-[#FBBF24]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
            <span>{isCloudConfigured ? "Supabase Cloud" : "Schema Ready"}</span>
            <span className="text-[10px] opacity-70">⚙</span>
          </button>

          {/* Authenticated Operative Capsule */}
          <div className="flex items-center gap-2.5 bg-[#12131A] border border-white/[0.1] rounded-full px-3 py-1 font-mono text-xs shadow-sm">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-[#0B0B0F]"
              style={{ backgroundColor: getRoleAccent(activeRole) }}
            >
              {(auditMember?.name || currentMember?.name || "Kiru").slice(0, 1).toUpperCase()}
            </div>
            <span className="font-semibold text-[#F4F1EA] text-[11px]">
              {auditMember ? auditMember.name : currentMember ? currentMember.name : "Kirubakaran (Kiru)"}
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border"
              style={{
                backgroundColor: `${getRoleAccent(activeRole)}20`,
                color: getRoleAccent(activeRole),
                borderColor: `${getRoleAccent(activeRole)}40`,
              }}
            >
              {activeRole}
            </span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-[#C6FF3D]/10 border border-[#C6FF3D]/40 rounded-xl font-mono text-xs text-[#C6FF3D] flex items-center justify-between shadow-lg shadow-[#C6FF3D]/5 animate-in fade-in">
          <span className="font-bold">{statusMessage}</span>
          <button type="button" onClick={() => setStatusMessage(null)} className="hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. UNIFIED LINEAR-GRADE TELEMETRY RIBBON                 */}
      {/* ======================================================== */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px p-1 rounded-2xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-md overflow-hidden shadow-2xl">
          {/* Metric 1: Pipeline Value */}
          <div className="p-3.5 bg-[#0C0D13] hover:bg-[#12131B] transition-colors flex flex-col justify-between rounded-xl">
            <span className="font-mono text-[10px] text-[#8E8D9A] uppercase tracking-wider font-semibold">
              PIPELINE ESTIMATE
            </span>
            <div className="my-1">
              {permissions.canViewFinancials ? (
                <span className="font-display font-black text-2xl text-[#FBBF24]">
                  ₹{analytics.pipelineValue.toLocaleString("en-IN")}
                </span>
              ) : (
                <span className="font-mono text-xs text-white/40 tracking-widest font-bold">
                  [CONFIDENTIAL]
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] text-[#8E8D9A] flex items-center gap-1">
              Active commercial deals
            </span>
          </div>

          {/* Metric 2: Closed Revenue */}
          <div className="p-3.5 bg-[#0C0D13] hover:bg-[#12131B] transition-colors flex flex-col justify-between rounded-xl">
            <span className="font-mono text-[10px] text-[#8E8D9A] uppercase tracking-wider font-semibold">
              CLOSED REVENUE
            </span>
            <div className="my-1">
              {permissions.canViewFinancials ? (
                <span className="font-display font-black text-2xl text-[#4ADE80]">
                  ₹{analytics.wonRevenue.toLocaleString("en-IN")}
                </span>
              ) : (
                <span className="font-mono text-xs text-white/40 tracking-widest font-bold">
                  [CONFIDENTIAL]
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] text-[#4ADE80] font-semibold flex items-center gap-1">
              Delivered + retained
            </span>
          </div>

          {/* Metric 3: Conversion Rate */}
          <div className="p-3.5 bg-[#0C0D13] hover:bg-[#12131B] transition-colors flex flex-col justify-between rounded-xl">
            <span className="font-mono text-[10px] text-[#8E8D9A] uppercase tracking-wider font-semibold">
              CONVERSION VELOCITY
            </span>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="font-display font-black text-2xl text-[#C6FF3D]">
                {analytics.conversionRate}%
              </span>
              <span className="font-mono text-[11px] text-[#8E8D9A]">
                ({analytics.shootsBooked}/{analytics.totalInquiries})
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#C6FF3D] font-bold flex items-center gap-1">
              <TrendingUp size={11} /> High Velocity Deals
            </span>
          </div>

          {/* Metric 4: Scheduled Shoots */}
          <div className="p-3.5 bg-[#0C0D13] hover:bg-[#12131B] transition-colors flex flex-col justify-between rounded-xl">
            <span className="font-mono text-[10px] text-[#8E8D9A] uppercase tracking-wider font-semibold">
              ON-LOCATION SHOOTS
            </span>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="font-display font-black text-2xl text-[#38BDF8]">
                {analytics.activeShootsCount}
              </span>
              <span className="font-mono text-[11px] text-[#8E8D9A]">booked</span>
            </div>
            <span className="font-mono text-[10px] text-[#38BDF8] flex items-center gap-1 font-semibold">
              <Video size={11} /> Sony FX3 Rigs
            </span>
          </div>

          {/* Metric 5: Total Inquiries */}
          <div className="p-3.5 bg-[#0C0D13] hover:bg-[#12131B] transition-colors flex flex-col justify-between rounded-xl col-span-2 sm:col-span-1">
            <span className="font-mono text-[10px] text-[#8E8D9A] uppercase tracking-wider font-semibold">
              INCOMING INQUIRIES
            </span>
            <div className="flex items-baseline gap-2 my-1">
              <span className="font-display font-black text-2xl text-[#F4F1EA]">
                {analytics.totalInquiries}
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#C6FF3D]/10 text-[#C6FF3D] font-bold border border-[#C6FF3D]/30">
                +{analytics.newLeads} NEW
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#8E8D9A] flex items-center gap-1">
              <Zap size={11} className="text-[#FBBF24]" /> Website briefs &amp; leads
            </span>
          </div>
        </div>
      )}

            {/* ======================================================== */}
      {/* 3. WORKSPACE NAVIGATION & COMMAND TOOLBAR               */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        {/* Workspace Segmented Tabs (Clean no-scrollbar pill) */}
        <div className="flex items-center p-1 rounded-xl bg-[#0C0D13] border border-white/[0.08] overflow-x-auto shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setActiveSubTab("pipeline")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === "pipeline"
                ? "bg-[#1E1F2C] text-white border border-white/20 shadow-md"
                : "text-[#8E8D9A] hover:text-[#F4F1EA] hover:bg-white/[0.03]"
            }`}
          >
            <Film size={14} className={activeSubTab === "pipeline" ? "text-[#C6FF3D]" : "text-[#8E8D9A]"} />
            <span>{activeRole === "editor" ? "Post Queue" : "Production"}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeSubTab === "pipeline" ? "bg-[#C6FF3D]/20 text-[#C6FF3D]" : "bg-white/[0.06] text-[#8E8D9A]"
            }`}>
              {inquiries.length}
            </span>
          </button>

          {permissions.canViewAllClients && (
            <button
              type="button"
              onClick={() => setActiveSubTab("clients")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeSubTab === "clients"
                  ? "bg-[#1E1F2C] text-white border border-white/20 shadow-md"
                  : "text-[#8E8D9A] hover:text-[#F4F1EA] hover:bg-white/[0.03]"
              }`}
            >
              <TrendingUp size={14} className={activeSubTab === "clients" ? "text-[#38BDF8]" : "text-[#8E8D9A]"} />
              <span>Clients &amp; Reach</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeSubTab === "clients" ? "bg-[#38BDF8]/20 text-[#38BDF8]" : "bg-white/[0.06] text-[#8E8D9A]"
              }`}>
                {clients.length}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveSubTab("shoots")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === "shoots"
                ? "bg-[#1E1F2C] text-white border border-white/20 shadow-md"
                : "text-[#8E8D9A] hover:text-[#F4F1EA] hover:bg-white/[0.03]"
            }`}
          >
            <Camera size={14} className={activeSubTab === "shoots" ? "text-[#FBBF24]" : "text-[#8E8D9A]"} />
            <span>Shoots &amp; Gear</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeSubTab === "shoots" ? "bg-[#FBBF24]/20 text-[#FBBF24]" : "bg-white/[0.06] text-[#8E8D9A]"
            }`}>
              {shoots.length}
            </span>
          </button>

          {permissions.canManageTeam && (
            <button
              type="button"
              onClick={() => setActiveSubTab("rbac")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeSubTab === "rbac"
                  ? "bg-[#1E1F2C] text-white border border-white/20 shadow-md"
                  : "text-[#8E8D9A] hover:text-[#F4F1EA] hover:bg-white/[0.03]"
              }`}
            >
              <Users size={14} className={activeSubTab === "rbac" ? "text-[#E879F9]" : "text-[#8E8D9A]"} />
              <span>Roster &amp; RBAC</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeSubTab === "rbac" ? "bg-[#E879F9]/20 text-[#E879F9]" : "bg-white/[0.06] text-[#8E8D9A]"
              }`}>
                {teamMembers.length}
              </span>
            </button>
          )}
        </div>

        {/* Search & Actions Toolbar */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-[#8E8D9A]" />
            <input
              type="text"
              placeholder="Search leads, brands, dates…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0C0D13] border border-white/[0.08] rounded-xl pl-9 pr-8 py-2 text-xs text-[#F4F1EA] placeholder-[#666] focus:outline-none focus:border-[#C6FF3D] w-44 sm:w-56 lg:w-64 transition-all"
            />
            <span className="absolute right-2.5 top-2 font-mono text-[9px] text-[#555] px-1 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] hidden sm:inline">
              ⌘K
            </span>
          </div>

          {activeSubTab === "pipeline" && permissions.canManageLeads && (
            <button
              type="button"
              onClick={() => setShowAddLeadModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#C6FF3D] hover:bg-[#b0f025] !text-[#0B0B0F] font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0 shadow-lg shadow-[#C6FF3D]/10 transition-all hover:scale-[1.02]"
              style={{ color: "#0B0B0F" }}
            >
              <Plus size={15} style={{ color: "#0B0B0F" }} />
              <span style={{ color: "#0B0B0F" }}>New Lead</span>
            </button>
          )}

          {activeSubTab === "clients" && permissions.canManageLeads && (
            <button
              type="button"
              onClick={() => setShowAddClientModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#C6FF3D] hover:bg-[#b0f025] !text-[#0B0B0F] font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0 shadow-lg shadow-[#C6FF3D]/10 transition-all hover:scale-[1.02]"
              style={{ color: "#0B0B0F" }}
            >
              <Plus size={15} style={{ color: "#0B0B0F" }} />
              <span style={{ color: "#0B0B0F" }}>Add Client</span>
            </button>
          )}

          {activeSubTab === "shoots" && permissions.canManageShoots && (
            <button
              type="button"
              onClick={() => setShowAddShootModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#C6FF3D] hover:bg-[#b0f025] !text-[#0B0B0F] font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0 shadow-lg shadow-[#C6FF3D]/10 transition-all hover:scale-[1.02]"
              style={{ color: "#0B0B0F" }}
            >
              <Plus size={15} style={{ color: "#0B0B0F" }} />
              <span style={{ color: "#0B0B0F" }}>Schedule Shoot</span>
            </button>
          )}

          {activeSubTab === "rbac" && permissions.canManageTeam && (
            <button
              type="button"
              onClick={() => setShowAddMemberModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#C6FF3D] hover:bg-[#b0f025] !text-[#0B0B0F] font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0 shadow-lg shadow-[#C6FF3D]/10 transition-all hover:scale-[1.02]"
              style={{ color: "#0B0B0F" }}
            >
              <Plus size={15} style={{ color: "#0B0B0F" }} />
              <span style={{ color: "#0B0B0F" }}>Onboard Operative</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. TAB 1: PRODUCTION KANBAN PIPELINE (Spacious Linear Layout) */}
      {/* ======================================================== */}
      {activeSubTab === "pipeline" && (
        <div className="space-y-4">
          {activeRole === "editor" && (
            <div className="p-3.5 bg-[#E879F9]/10 border border-[#E879F9]/40 rounded-xl font-mono text-xs text-[#E879F9] flex items-center gap-2">
              <Film size={15} />
              <span>POST-PRODUCTION WORKFLOW: Filtered to active reels in filming, editing, and client delivery review.</span>
            </div>
          )}

          {/* Spacious Horizontal Kanban Container */}
          <div className="overflow-x-auto pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6">
            <div className="flex gap-4 min-w-max">
              {PIPELINE_STAGES.map((stage) => {
                const stageInquiries = filteredInquiries.filter((i) => i.status === stage.id);
                const stageTotalValue = stageInquiries.reduce((sum, inq) => sum + (Number(inq.deal_value) || 0), 0);

                return (
                  <div
                    key={stage.id}
                    className="w-[330px] shrink-0 bg-[#0A0B10] border border-white/[0.08] rounded-2xl p-4 flex flex-col min-h-[560px] shadow-xl"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${stage.id === "in_production" || stage.id === "in_edit" ? "animate-pulse" : ""}`}
                          style={{ backgroundColor: stage.accent }}
                        />
                        <span className="font-semibold text-xs text-[#F4F1EA] tracking-wide">
                          {stage.label}
                        </span>
                        <span className="font-mono text-[10px] bg-white/[0.06] text-[#A9A7A0] px-2 py-0.5 rounded-full border border-white/[0.08]">
                          {stageInquiries.length}
                        </span>
                      </div>

                      {permissions.canViewFinancials && stageTotalValue > 0 && (
                        <span className="font-mono text-[11px] text-[#A9A7A0] font-bold">
                          ₹{stageTotalValue.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {/* Column Cards */}
                    <div className="space-y-3 flex-1">
                      {stageInquiries.length === 0 ? (
                        <div className="h-32 border border-dashed border-white/[0.08] rounded-xl flex flex-col items-center justify-center text-xs text-[#555] gap-1 bg-[#07070B]/50">
                          <span className="text-base text-[#444]">∅</span>
                          <span className="font-mono text-[11px]">No active projects</span>
                        </div>
                      ) : (
                        stageInquiries.map((inq) => (
                          <div
                            key={inq.id}
                            onClick={() => setSelectedInquiry(inq)}
                            className="p-4 rounded-xl bg-[#0F1017] hover:bg-[#141520] border border-white/[0.08] hover:border-white/[0.22] hover:-translate-y-0.5 transition-all duration-200 space-y-3 shadow-md hover:shadow-2xl group cursor-pointer relative"
                          >
                            {/* Card Film Slate Header */}
                            <div className="flex items-center justify-between text-[10px] pb-2 border-b border-white/[0.06]">
                              <div className="flex items-center gap-2 font-mono">
                                <span className="font-bold text-[#F59E0B] tracking-wider">
                                  #{inq.id.replace(/[^0-9]/g, "").slice(-2) || "01"}
                                </span>
                                <span className="text-white/20">•</span>
                                <span className="text-[#38BDF8] font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-2.5 border border-current rounded-[1px] inline-block" />
                                  9:16 REEL
                                </span>
                              </div>
                              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-[#A9A7A0] border border-white/[0.08] uppercase font-semibold">
                                SONY FX3
                              </span>
                            </div>

                            {/* Client & Business + Deal Value */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-display font-bold text-base text-[#F4F1EA] leading-tight group-hover:text-[#C6FF3D] transition-colors">
                                  {inq.client_name}
                                </h4>
                                {inq.business_name && (
                                  <p className="text-xs text-[#A9A7A0] mt-0.5 font-medium">
                                    {inq.business_name}
                                  </p>
                                )}
                              </div>

                              {permissions.canViewFinancials ? (
                                inq.deal_value > 0 && (
                                  <span className="font-mono text-xs text-[#C6FF3D] font-black bg-[#C6FF3D]/10 px-2 py-0.5 rounded-md border border-[#C6FF3D]/30 shrink-0">
                                    ₹{inq.deal_value.toLocaleString("en-IN")}
                                  </span>
                                )
                              ) : (
                                <span className="font-mono text-[10px] text-[#666] bg-black/40 px-1.5 py-0.5 rounded">
                                  [CONFIDENTIAL]
                                </span>
                              )}
                            </div>

                            {/* Deliverable Tags */}
                            {inq.deliverables && inq.deliverables.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {inq.deliverables.map((d, idx) => (
                                  <span
                                    key={idx}
                                    className="font-mono text-[10px] bg-[#161726] text-[#38BDF8] px-2 py-0.5 rounded-md border border-[#38BDF8]/20 font-semibold"
                                  >
                                    {d.replace("Reels & video content", "Vertical Reels")}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Story / Hook Brief Preview */}
                            {inq.story && (
                              <div className="p-2.5 rounded-lg bg-[#08080E] border border-white/[0.05] text-xs text-[#C0BFBA] leading-relaxed relative">
                                <span className="text-[#C6FF3D]/60 select-none mr-1 font-serif text-sm">“</span>
                                {inq.story}
                                <span className="text-[#C6FF3D]/60 select-none ml-1 font-serif text-sm">”</span>
                              </div>
                            )}

                            {/* Post-Production Milestone Progress Bar */}
                            <div className="space-y-1 pt-1">
                              <div className="flex items-center justify-between text-[9px] font-mono uppercase font-bold tracking-wider">
                                <span className="text-[#666]">STAGE PROGRESS</span>
                                <span className="text-[#C6FF3D]">
                                  {inq.status === "new" ? "01 / HOOK & CONCEPT" :
                                   inq.status === "contacted" ? "02 / MOODBOARD" :
                                   inq.status === "call_scheduled" ? "03 / DISCOVERY CALL" :
                                   inq.status === "shoot_booked" ? "04 / CALL SHEET LOCKED" :
                                   inq.status === "in_production" ? "05 / 4K FILMING ON SET" :
                                   inq.status === "in_edit" ? "06 / S-LOG3 GRADE & AUDIO" :
                                   "07 / 4K DCI MASTER DELIVERED"}
                                </span>
                              </div>
                              <div className="grid grid-cols-7 gap-1">
                                {PIPELINE_STAGES.map((s, idx) => {
                                  const currentIdx = PIPELINE_STAGES.findIndex((p) => p.id === inq.status);
                                  const isDone = idx <= currentIdx;
                                  return (
                                    <div
                                      key={s.id}
                                      className="h-1 rounded-full transition-all duration-300"
                                      style={{
                                        backgroundColor: isDone ? stage.accent : "#1F1F2B",
                                      }}
                                      title={s.label}
                                    />
                                  );
                                })}
                              </div>
                            </div>

                            {/* Quick Actions & Contact Shortcuts (stops propagation) */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                              <div className="flex items-center gap-3">
                                <a
                                  href={`https://wa.me/${inq.contact.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                    `Hello ${inq.client_name}, Kirubakaran from 27 Creative Studio here regarding your commercial video project.`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[#22C55E] hover:text-[#4ade80] flex items-center gap-1 font-semibold transition-colors"
                                  title="Direct WhatsApp"
                                >
                                  <MessageSquare size={12} className="text-[#22C55E]" />
                                  <span>WhatsApp</span>
                                </a>
                                <a
                                  href={`tel:${inq.contact}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[#A9A7A0] hover:text-white flex items-center gap-1 transition-colors"
                                  title="Call Lead"
                                >
                                  <Phone size={11} />
                                  <span>Call</span>
                                </a>
                              </div>

                              <div className="flex items-center gap-1">
                                {permissions.canManageLeads && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={inq.status === "new"}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStepStage(inq.id, inq.status, "prev");
                                      }}
                                      className="p-1 rounded bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-20 text-[#A9A7A0] hover:text-white transition-colors cursor-pointer"
                                      title="Previous Stage"
                                    >
                                      <ChevronLeft size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={inq.status === "delivered"}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStepStage(inq.id, inq.status, "next");
                                      }}
                                      className="p-1 rounded bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-20 text-[#A9A7A0] hover:text-white transition-colors cursor-pointer"
                                      title="Advance Stage"
                                    >
                                      <ChevronRight size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteLead(inq.id);
                                      }}
                                      className="text-[#555] hover:text-[#FF5C5C] p-1 transition-colors cursor-pointer"
                                      title="Delete brief"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}


      {/* ======================================================== */}
      {/* 5. TAB 2: CLIENT PORTFOLIO & LIVE SOCIALS                */}
      {/* ======================================================== */}
      {activeSubTab === "clients" && permissions.canViewAllClients && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl border border-[#20202E] bg-gradient-to-b from-[#14141E] to-[#0A0A10] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-[#38BDF8] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp size={13} />
                  <span>Commercial Growth Division</span>
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1A1A26] text-[#A9A7A0] border border-[#2A2A3C]">
                  REEL METRICS LIVE
                </span>
              </div>
              <h3 className="font-display font-black text-2xl text-[#F4F1EA]">
                Commercial Client Portfolio &amp; Viral Reach
              </h3>
              <p className="font-mono text-xs text-[#A9A7A0] mt-0.5">
                Real-time tracking of follower acquisition velocity, viral shortform reach, and Google Business reputation.
              </p>
            </div>
            <span className="font-mono text-xs text-[#38BDF8] bg-[#14202B] px-3.5 py-2 rounded-xl border border-[#38BDF8]/30 font-bold flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <Zap size={14} className="text-[#38BDF8]" />
              <span>LIVE SOCIAL TELEMETRY</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="relative p-6 rounded-2xl border border-[#20202E] bg-gradient-to-b from-[#12121A] to-[#0A0A10] hover:border-[#38BDF8]/40 transition-all space-y-4 shadow-xl group overflow-hidden"
              >
                <div className="absolute top-1.5 left-2 font-mono text-[8px] text-[#38BDF8]/30 select-none pointer-events-none">⌜</div>
                <div className="absolute top-1.5 right-2 font-mono text-[8px] text-[#38BDF8]/30 select-none pointer-events-none">⌝</div>
                <div className="absolute bottom-1.5 left-2 font-mono text-[8px] text-[#38BDF8]/30 select-none pointer-events-none">⌞</div>
                <div className="absolute bottom-1.5 right-2 font-mono text-[8px] text-[#38BDF8]/30 select-none pointer-events-none">⌟</div>

                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-[#C6FF3D] uppercase tracking-wider font-bold">
                      {client.business_type}
                    </span>
                    <h4 className="font-display font-black text-xl text-[#F4F1EA] mt-0.5">
                      {client.brand_name}
                    </h4>
                    <p className="font-mono text-xs text-[#A9A7A0] mt-0.5">
                      Contact: {client.primary_contact}
                    </p>
                  </div>
                  {permissions.canViewFinancials && (
                    <span className="font-mono text-xs text-[#4ADE80] font-black bg-[#142410] px-2.5 py-1 rounded-lg border border-[#4ADE80]/30 shadow-sm">
                      ₹{client.total_revenue.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                {/* Social Growth Telemetry Box */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#09090E] border border-[#1E1E2C] font-mono">
                  <div>
                    <span className="text-[10px] text-[#A9A7A0] block uppercase font-bold">INSTAGRAM AUDIENCE</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-display font-black text-2xl text-[#38BDF8]">
                        {client.live_followers.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#4ADE80] font-bold">
                        +{client.growth_multiplier}x
                      </span>
                    </div>
                    <span className="text-[10px] text-[#666] block mt-0.5">
                      Baseline: {client.follower_start.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#A9A7A0] block uppercase font-bold">TOP REEL VIEWS</span>
                    <div className="font-display font-bold text-lg text-[#FBBF24] mt-1 flex items-center gap-1.5">
                      <Flame size={16} className="text-[#FB923C]" />
                      <span>{client.top_reel_views}</span>
                    </div>
                    <span className="text-[10px] text-[#666] block mt-0.5">
                      {client.total_posts} total content drops
                    </span>
                  </div>
                </div>

                {/* Google Reviews */}
                <div className="flex items-center justify-between font-mono text-xs px-1">
                  <span className="text-[#A9A7A0] flex items-center gap-1.5">
                    <Globe size={13} className="text-[#38BDF8]" /> Google Business:
                  </span>
                  <span className="font-bold text-[#F4F1EA] flex items-center gap-1">
                    <span className="text-[#FBBF24]">★</span> {client.google_rating} ({client.google_reviews_count} reviews)
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#20202E] font-mono text-xs">
                  {client.instagram_handle && (
                    <a
                      href={`https://instagram.com/${client.instagram_handle.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#14141E] hover:bg-[#1E1E2C] text-[#F4F1EA] text-xs inline-flex items-center gap-1.5 transition-colors border border-[#242434]"
                    >
                      <InstagramIcon size={13} /> {client.instagram_handle} ↗
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSyncSocials(client.id, client.brand_name)}
                    disabled={syncingClientId === client.id}
                    className="ml-auto px-3.5 py-1.5 rounded-lg border border-[#38BDF8]/40 bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 text-[#38BDF8] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RefreshCw size={12} className={syncingClientId === client.id ? "animate-spin" : ""} />
                    <span>{syncingClientId === client.id ? "SYNCING…" : "SYNC LIVE"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. TAB 3: SHOOT SCHEDULE & FLIGHT CASE GEAR CHECKLIST    */}
      {/* ======================================================== */}
      {activeSubTab === "shoots" && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl border border-[#20202E] bg-gradient-to-b from-[#14141E] to-[#0A0A10] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-[#C6FF3D] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Camera size={13} />
                  <span>Cinematography Division</span>
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1A1A26] text-[#A9A7A0] border border-[#2A2A3C]">
                  SONY FX3 RIGGED
                </span>
              </div>
              <h3 className="font-display font-black text-2xl text-[#F4F1EA]">
                Production Shoot Master Schedule &amp; Call Sheets
              </h3>
              <p className="font-mono text-xs text-[#A9A7A0] mt-0.5">
                On-location commercial shoots, coastal lighting conditions, crew logistics, and flight case check-off.
              </p>
            </div>
            <span className="font-mono text-xs px-3.5 py-2 rounded-xl bg-[#1A1A26] text-[#C6FF3D] border border-[#C6FF3D]/30 font-bold flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <Film size={14} />
              <span>4K 24FPS DCI PIPELINE</span>
            </span>
          </div>

          {/* Tamil Nadu Coastal Shoot Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#08080D] border border-[#1E1E2C] font-mono text-xs shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shrink-0">
                <Sunrise size={18} />
              </div>
              <div>
                <span className="text-[10px] text-[#A9A7A0] block uppercase font-bold tracking-wider">FIRST LIGHT (SUNRISE)</span>
                <span className="text-[#F4F1EA] font-bold text-sm">06:14 AM</span>
                <span className="text-[10px] text-[#F59E0B] block">Soft coastal diffusion</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FB923C]/10 border border-[#FB923C]/30 flex items-center justify-center text-[#FB923C] shrink-0">
                <Sunset size={18} />
              </div>
              <div>
                <span className="text-[10px] text-[#A9A7A0] block uppercase font-bold tracking-wider">MAGIC HOUR (SUNSET)</span>
                <span className="text-[#F4F1EA] font-bold text-sm">05:46 PM</span>
                <span className="text-[10px] text-[#FB923C] block">Warm rim silhouette</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shrink-0">
                <Crosshair size={18} />
              </div>
              <div>
                <span className="text-[10px] text-[#A9A7A0] block uppercase font-bold tracking-wider">DRONE / AERIAL OPS</span>
                <span className="text-[#4ADE80] font-bold text-sm">OPTIMAL ENVELOPE</span>
                <span className="text-[10px] text-[#A9A7A0] block">12 kts Gulf sea breeze</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredShoots.map((shoot) => {
              const packedItems = new Set(shoot.packed_gear || []);
              const totalGear = shoot.gear_checklist?.length || 0;
              const packedCount = shoot.gear_checklist?.filter((g) => packedItems.has(g)).length || 0;
              const progressPct = totalGear > 0 ? Math.round((packedCount / totalGear) * 100) : 0;

              return (
                <div
                  key={shoot.id}
                  className="p-6 rounded-2xl border border-[#20202E] bg-gradient-to-b from-[#12121A] to-[#0A0A10] hover:border-[#38BDF8]/40 transition-all space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#20202E]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#C6FF3D] font-bold tracking-wider">
                          CALL SHEET // {shoot.shoot_date}
                        </span>
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#1A1A26] text-[#F59E0B] font-bold border border-[#F59E0B]/30">
                          CALL: {shoot.call_time}
                        </span>
                      </div>
                      <h4 className="font-display font-black text-2xl text-[#F4F1EA] mt-1">
                        {shoot.client_name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={shoot.status}
                        onChange={(e) => handleUpdateShootStatus(shoot.id, e.target.value as ShootStatus)}
                        className="bg-[#161622] border border-[#2A2A3C] rounded-lg px-3 py-1.5 font-mono text-xs text-[#C6FF3D] font-bold uppercase focus:outline-none focus:border-[#C6FF3D] cursor-pointer"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="shooting">Filming on Location</option>
                        <option value="in_edit">In Post / Editing</option>
                        <option value="review">Client Review</option>
                        <option value="delivered">Delivered / Wrapped</option>
                      </select>
                    </div>
                  </div>

                  {/* Shoot Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    <div className="p-3.5 rounded-xl bg-[#09090E] border border-[#1A1A26]">
                      <span className="text-[#A9A7A0] block text-[10px] uppercase font-bold">LOCATION ADDRESS</span>
                      <p className="text-[#F4F1EA] mt-1 flex items-center gap-1.5 font-bold">
                        <MapPin size={14} className="text-[#EF4444] shrink-0" />
                        <span className="break-words">{shoot.location_address}</span>
                      </p>
                      {shoot.google_maps_link && (
                        <a
                          href={shoot.google_maps_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#38BDF8] text-[11px] underline mt-1 inline-flex items-center gap-1 font-bold"
                        >
                          Launch in Google Maps ↗
                        </a>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#09090E] border border-[#1A1A26]">
                      <span className="text-[#A9A7A0] block text-[10px] uppercase font-bold">CREW ASSIGNED</span>
                      <p className="text-[#F4F1EA] mt-1 flex items-center gap-1.5 font-bold">
                        <Users size={14} className="text-[#C6FF3D] shrink-0" />
                        <span>{shoot.assigned_crew?.join(", ")}</span>
                      </p>
                      <span className="text-[11px] text-[#A9A7A0] block mt-0.5">
                        Sony FX3 Cinema Rig + Wireless Audio
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#09090E] border border-[#1A1A26]">
                      <span className="text-[#A9A7A0] block text-[10px] uppercase font-bold">DELIVERABLES TARGET</span>
                      <p className="text-[#F4F1EA] mt-1 font-bold">
                        {shoot.deliverable_reels} Vertical Reels + {shoot.deliverable_films} Brand Film
                      </p>
                      <span className="text-[11px] text-[#4ADE80] font-bold block mt-0.5">
                        4K 24fps DCI Master Delivery
                      </span>
                    </div>
                  </div>

                  {/* Interactive Flight Case Gear Checklist */}
                  {permissions.canManageGear && shoot.gear_checklist && (
                    <div className="p-4 rounded-xl bg-[#08080D] border border-[#1E1E2C] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-mono text-xs text-[#C6FF3D] font-bold flex items-center gap-2">
                          <Camera size={14} />
                          <span>FLIGHT CASE PACKING CHECKLIST ({packedCount}/{totalGear} PACKED - {progressPct}%)</span>
                        </span>
                        <span className="font-mono text-[11px] text-[#A9A7A0]">
                          Tap items to toggle packed status
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-[#1A1A26] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#C6FF3D] h-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {shoot.gear_checklist.map((gear, idx) => {
                          const isPacked = packedItems.has(gear);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleToggleShootGear(shoot.id, gear)}
                              className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all flex items-center gap-2 border cursor-pointer ${
                                isPacked
                                  ? "bg-[#1E2E16] text-[#C6FF3D] border-[#C6FF3D]/40 line-through opacity-85"
                                  : "bg-[#12121A] text-[#F4F1EA] border-[#2A2A3A] hover:border-[#38BDF8]"
                              }`}
                            >
                              <span className={`w-4 h-4 rounded-sm border flex items-center justify-center text-xs ${
                                isPacked ? "bg-[#C6FF3D] text-[#0B0B0F] border-[#C6FF3D] font-bold" : "border-[#555]"
                              }`}>
                                {isPacked ? "✓" : ""}
                              </span>
                              <span>{gear}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. TAB 4: TEAM ROSTER & ROLE-BASED ACCESS CONTROL (RBAC) */}
      {/* ======================================================== */}
      {activeSubTab === "rbac" && permissions.canManageTeam && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-[#232326] bg-[#121217] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-xl text-[#F4F1EA]">
                Studio Roster &amp; Role-Based Access Control (RBAC)
              </h3>
              <p className="font-mono text-xs text-[#A9A7A0] mt-1">
                Roles are strictly assigned per operative in the database. Only Principals can promote, re-assign, or audit roles.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 rounded-lg bg-[#C6FF3D] hover:bg-[#b0f025] !text-[#0B0B0F] font-mono text-xs font-bold uppercase inline-flex items-center gap-2 cursor-pointer self-start md:self-auto shadow-lg shadow-[#C6FF3D]/10"
              style={{ color: "#0B0B0F" }}
            >
              <Plus size={14} style={{ color: "#0B0B0F" }} />
              <span>ONBOARD OPERATIVE</span>
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="font-mono text-xs text-[#C6FF3D] uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Users size={14} />
              <span>ACTIVE STUDIO OPERATIVES &amp; ROLES ({teamMembers.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-5 rounded-xl border border-[#232326] bg-[#121217] space-y-3.5 hover:border-[#333] transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-display font-bold text-lg text-[#F4F1EA]">
                        {member.name}
                      </h5>
                      <p className="font-mono text-xs text-[#C6FF3D] font-bold">{member.title}</p>
                      <p className="font-mono text-xs text-[#A9A7A0] mt-0.5">{member.email}</p>
                    </div>

                    <span
                      className="font-mono text-[10px] px-2.5 py-1 rounded-md uppercase font-bold border"
                      style={{
                        backgroundColor: `${getRoleAccent(member.role)}15`,
                        color: getRoleAccent(member.role),
                        borderColor: `${getRoleAccent(member.role)}40`,
                      }}
                    >
                      {member.role}
                    </span>
                  </div>

                  {/* Real Role Assignment by Principal */}
                  <div className="pt-2 border-t border-[#232326] flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-[#A9A7A0] uppercase font-bold">ASSIGN ROLE:</span>
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as TeamRole)}
                      className="bg-[#18181F] border border-[#2A2A30] rounded-lg px-2.5 py-1 font-mono text-xs text-[#F4F1EA] uppercase focus:outline-none focus:border-[#C6FF3D]"
                    >
                      <option value="principal">Principal (Studio Head)</option>
                      <option value="producer">Producer (Operations)</option>
                      <option value="crew">Cinematographer (Crew)</option>
                      <option value="editor">Editor (Post)</option>
                      <option value="client">Client Partner</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-[#666] hover:text-[#FF5C5C] p-1.5 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Official Audit Mode (Principal testing clearance of that role) */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuditMember(member);
                        setActiveRole(member.role);
                        if (member.role === "crew") setActiveSubTab("shoots");
                        if (member.role === "editor") setActiveSubTab("pipeline");
                        flashMessage(`Entered audit mode as ${member.name} (${member.role.toUpperCase()})`);
                      }}
                      className="w-full py-1.5 rounded-lg bg-[#18181F] hover:bg-[#22222C] text-[#A9A7A0] hover:text-[#F4F1EA] font-mono text-xs uppercase text-center transition-colors border border-[#2A2A30] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Shield size={12} className="text-[#FBBF24]" />
                      <span>Audit View as {member.name.split(" ")[0]} ({member.role})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Granular Security Matrix Table */}
          <div className="p-5 rounded-xl border border-[#232326] bg-[#121217] space-y-4">
            <div>
              <h4 className="font-display font-bold text-lg text-[#F4F1EA]">
                Granular Security &amp; Access Matrix
              </h4>
              <p className="font-mono text-xs text-[#A9A7A0]">
                Every operational capability is governed by role clearance levels.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#232326] text-[#A9A7A0]">
                    <th className="py-2.5 px-3">ROLE</th>
                    <th className="py-2.5 px-3">DEAL FINANCIALS</th>
                    <th className="py-2.5 px-3">LEAD PIPELINE</th>
                    <th className="py-2.5 px-3">SHOOT CALENDAR</th>
                    <th className="py-2.5 px-3">GEAR CHECKLIST</th>
                    <th className="py-2.5 px-3">TEAM ROSTER</th>
                    <th className="py-2.5 px-3">CMS PUBLISH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232326]">
                  <tr>
                    <td className="py-3 px-3 font-bold text-[#C6FF3D]">Principal (Owner)</td>
                    <td className="py-3 px-3 text-[#4ADE80]">✓ Full Access</td>
                    <td className="py-3 px-3 text-[#4ADE80]">✓ Full Access</td>
                    <td className="py-3 px-3 text-[#4ADE80]">✓ Full Access</td>
                    <td className="py-3 px-3 text-[#4ADE80]">✓ Full Access</td>
                    <td className="py-3 px-3 text-[#4ADE80]">✓ Full Access</td>
                    <td className="py-3 px-3 text-[#4ADE80]">✓ Full Access</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-[#38BDF8]">Director / Producer</td>
                    <td className="py-3 px-3 text-[#4ADE80]">✓ Full Access</td>
                    <td className="py-3 px-3 text-[#4ADE80]">✓ Manage Leads</td>
                    <td className="py-3 px-3 text-[#4ADE80]">✓ Manage Shoots</td>
                    <td className="py-3 px-3 text-[#4ADE80]">✓ Full Access</td>
                    <td className="py-3 px-3 text-[#4ADE80]">✓ Full Access</td>
                    <td className="py-3 px-3 text-[#4ADE80]">✓ Full Access</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-[#FBBF24]">Cinematographer / Crew</td>
                    <td className="py-3 px-3 text-[#FF5C5C]">✕ Restricted</td>
                    <td className="py-3 px-3 text-[#FF5C5C]">✕ Restricted</td>
                    <td className="py-3 px-3 text-[#38BDF8]">View Call Sheets</td>
                    <td className="py-3 px-3 text-[#4ADE80]">✓ Toggle Packed</td>
                    <td className="py-3 px-3 text-[#FF5C5C]">✕ Restricted</td>
                    <td className="py-3 px-3 text-[#FF5C5C]">✕ Restricted</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-[#E879F9]">Editor (Post)</td>
                    <td className="py-3 px-3 text-[#FF5C5C]">✕ Restricted</td>
                    <td className="py-3 px-3 text-[#38BDF8]">View Post Queue</td>
                    <td className="py-3 px-3 text-[#38BDF8]">View Delivery Dates</td>
                    <td className="py-3 px-3 text-[#FF5C5C]">✕ Restricted</td>
                    <td className="py-3 px-3 text-[#FF5C5C]">✕ Restricted</td>
                    <td className="py-3 px-3 text-[#FF5C5C]">✕ Restricted</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-[#A9A7A0]">Client Portal (Guest)</td>
                    <td className="py-3 px-3 text-[#FF5C5C]">✕ Restricted</td>
                    <td className="py-3 px-3 text-[#FF5C5C]">✕ Restricted</td>
                    <td className="py-3 px-3 text-[#38BDF8]">View Own Shoot</td>
                    <td className="py-3 px-3 text-[#FF5C5C]">✕ Restricted</td>
                    <td className="py-3 px-3 text-[#FF5C5C]">✕ Restricted</td>
                    <td className="py-3 px-3 text-[#FF5C5C]">✕ Restricted</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD MANUAL BRIEF */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#121217] border border-[#232326] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#232326] pb-3">
              <h3 className="font-display font-bold text-lg text-[#F4F1EA]">
                Record New Client Brief / Lead
              </h3>
              <button
                type="button"
                onClick={() => setShowAddLeadModal(false)}
                className="text-[#A9A7A0] hover:text-[#F4F1EA] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#A9A7A0] block mb-1">CLIENT / CONTACT NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newLead.client_name}
                  onChange={(e) => setNewLead({ ...newLead, client_name: e.target.value })}
                  className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div>
                <label className="text-[#A9A7A0] block mb-1">PHONE NUMBER OR EMAIL *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98421 XXXXX"
                  value={newLead.contact}
                  onChange={(e) => setNewLead({ ...newLead, contact: e.target.value })}
                  className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div>
                <label className="text-[#A9A7A0] block mb-1">BUSINESS / BRAND NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Pearl City Cafe"
                  value={newLead.business_name}
                  onChange={(e) => setNewLead({ ...newLead, business_name: e.target.value })}
                  className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#A9A7A0] block mb-1">ESTIMATED DEAL (₹)</label>
                  <input
                    type="number"
                    value={newLead.deal_value}
                    onChange={(e) => setNewLead({ ...newLead, deal_value: Number(e.target.value) })}
                    className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>

                <div>
                  <label className="text-[#A9A7A0] block mb-1">ASSIGN LEAD TO</label>
                  <select
                    value={newLead.assigned_to}
                    onChange={(e) => setNewLead({ ...newLead, assigned_to: e.target.value })}
                    className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#A9A7A0] block mb-1">STORY / BRIEF CONCEPT</label>
                <textarea
                  rows={3}
                  placeholder="Describe client goals, deliverables needed, or campaign angle…"
                  value={newLead.story}
                  onChange={(e) => setNewLead({ ...newLead, story: e.target.value })}
                  className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#18181F] text-[#A9A7A0] hover:text-[#F4F1EA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#C6FF3D] hover:bg-[#b0f025] !text-[#0B0B0F] font-bold cursor-pointer"
                  style={{ color: "#0B0B0F" }}
                >
                  Record Brief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CLIENT */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#121217] border border-[#232326] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#232326] pb-3">
              <h3 className="font-display font-bold text-lg text-[#F4F1EA]">
                Add Client to Portfolio
              </h3>
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
                className="text-[#A9A7A0] hover:text-[#F4F1EA] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#A9A7A0] block mb-1">BRAND NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Bakes"
                  value={newClient.brand_name}
                  onChange={(e) => setNewClient({ ...newClient, brand_name: e.target.value })}
                  className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#A9A7A0] block mb-1">BUSINESS CATEGORY</label>
                  <select
                    value={newClient.business_type}
                    onChange={(e) => setNewClient({ ...newClient, business_type: e.target.value })}
                    className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                  >
                    <option value="restaurant">Restaurant / Cafe</option>
                    <option value="showroom">Automotive Showroom</option>
                    <option value="retail">Boutique &amp; Retail</option>
                    <option value="healthcare">Hospital &amp; Healthcare</option>
                    <option value="education">School &amp; Academy</option>
                    <option value="other">Other Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#A9A7A0] block mb-1">PRIMARY CONTACT</label>
                  <input
                    type="text"
                    placeholder="Owner / Manager"
                    value={newClient.primary_contact}
                    onChange={(e) => setNewClient({ ...newClient, primary_contact: e.target.value })}
                    className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#A9A7A0] block mb-1">PHONE NUMBER</label>
                  <input
                    type="text"
                    placeholder="+91 94431 XXXXX"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>

                <div>
                  <label className="text-[#A9A7A0] block mb-1">INSTAGRAM HANDLE</label>
                  <input
                    type="text"
                    placeholder="@royalbakes_tuti"
                    value={newClient.instagram_handle}
                    onChange={(e) => setNewClient({ ...newClient, instagram_handle: e.target.value })}
                    className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#18181F] text-[#A9A7A0] hover:text-[#F4F1EA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#C6FF3D] hover:bg-[#b0f025] !text-[#0B0B0F] font-bold cursor-pointer"
                  style={{ color: "#0B0B0F" }}
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ONBOARD OPERATIVE */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#121217] border border-[#232326] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#232326] pb-3">
              <h3 className="font-display font-bold text-lg text-[#F4F1EA]">
                Onboard Team Operative
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="text-[#A9A7A0] hover:text-[#F4F1EA] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#A9A7A0] block mb-1">OPERATIVE NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh V"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div>
                <label className="text-[#A9A7A0] block mb-1">STUDIO ROLE *</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as TeamRole })}
                  className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                >
                  <option value="crew">Cinematographer / Crew</option>
                  <option value="producer">Producer / Studio Head</option>
                  <option value="editor">Editor (Post-Production)</option>
                  <option value="principal">Principal (Studio Founder)</option>
                  <option value="client">Client Portal Access</option>
                </select>
              </div>

              <div>
                <label className="text-[#A9A7A0] block mb-1">PRODUCTION TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Drone Pilot / Colorist"
                  value={newMember.title}
                  onChange={(e) => setNewMember({ ...newMember, title: e.target.value })}
                  className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div>
                <label className="text-[#A9A7A0] block mb-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  placeholder="ramesh@27creativestudio.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#18181F] text-[#A9A7A0] hover:text-[#F4F1EA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#C6FF3D] hover:bg-[#b0f025] !text-[#0B0B0F] font-bold cursor-pointer"
                  style={{ color: "#0B0B0F" }}
                >
                  Add Operative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE SHOOT */}
      {showAddShootModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#121217] border border-[#232326] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#232326] pb-3">
              <h3 className="font-display font-bold text-lg text-[#F4F1EA]">
                Schedule Production Shoot
              </h3>
              <button
                type="button"
                onClick={() => setShowAddShootModal(false)}
                className="text-[#A9A7A0] hover:text-[#F4F1EA] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShoot} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#A9A7A0] block mb-1">CLIENT NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Milk Sweets"
                  value={newShoot.client_name}
                  onChange={(e) => setNewShoot({ ...newShoot, client_name: e.target.value })}
                  className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#A9A7A0] block mb-1">SHOOT DATE</label>
                  <input
                    type="date"
                    value={newShoot.shoot_date}
                    onChange={(e) => setNewShoot({ ...newShoot, shoot_date: e.target.value })}
                    className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>

                <div>
                  <label className="text-[#A9A7A0] block mb-1">CALL TIME</label>
                  <input
                    type="text"
                    value={newShoot.call_time}
                    onChange={(e) => setNewShoot({ ...newShoot, call_time: e.target.value })}
                    className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#A9A7A0] block mb-1">LOCATION ADDRESS</label>
                <input
                  type="text"
                  value={newShoot.location_address}
                  onChange={(e) => setNewShoot({ ...newShoot, location_address: e.target.value })}
                  className="w-full bg-[#18181F] border border-[#2A2A30] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddShootModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#18181F] text-[#A9A7A0] hover:text-[#F4F1EA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#C6FF3D] hover:bg-[#b0f025] !text-[#0B0B0F] font-bold cursor-pointer"
                  style={{ color: "#0B0B0F" }}
                >
                  Schedule Shoot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUPABASE CLOUD STATUS */}
      {showSchemaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#121217] border border-[#232326] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#232326] pb-3">
              <h3 className="font-display font-bold text-lg text-[#F4F1EA] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-ping" />
                <span>Supabase Cloud Integration Active</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSchemaModal(false)}
                className="text-[#A9A7A0] hover:text-[#F4F1EA] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="font-mono text-xs text-[#A9A7A0] space-y-3">
              <p>
                Connected to live Supabase project:
                <code className="text-[#38BDF8] bg-[#18181F] px-1 py-0.5 rounded ml-1">
                  https://hokddcrcgeexnyswnerv.supabase.co
                </code>
              </p>
              <div className="p-3 bg-[#18181F] rounded-lg border border-[#2A2A30] space-y-1">
                <p className="text-[#F4F1EA] font-bold">Live PostgreSQL Tables Synchronized:</p>
                <p className="text-[#4ADE80]">✓ public.clients — Client portfolio, live Instagram metrics &amp; Google rating</p>
                <p className="text-[#4ADE80]">✓ public.inquiries — Send Brief leads, deal values, deliverables &amp; stages</p>
                <p className="text-[#4ADE80]">✓ public.shoots — Call sheets, location addresses, assigned crew &amp; gear</p>
                <p className="text-[#4ADE80]">✓ public.profiles — RBAC matrix across Principal, Producer, Crew, Editor &amp; Client</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSchemaModal(false)}
                className="px-4 py-2 rounded-lg bg-[#C6FF3D] !text-[#0B0B0F] font-bold font-mono text-xs uppercase cursor-pointer"
                style={{ color: "#0B0B0F" }}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ======================================================== */}
      {/* 8. PROJECT INSPECTOR MODAL (Cinema Call Sheet & Specs)   */}
      {/* ======================================================== */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl bg-[#0F1017] border border-white/[0.12] rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-[#F59E0B]">SCENE #{selectedInquiry.id.replace(/[^0-9]/g, "").slice(-2) || "01"}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-[#38BDF8] font-bold">SONY FX3 4K CINE-EI</span>
                  <span className="text-white/20">•</span>
                  <span className="text-[#C6FF3D] font-bold">9:16 VERTICAL REEL</span>
                </div>
                <h2 className="font-display font-black text-2xl text-[#F4F1EA] mt-1">
                  {selectedInquiry.client_name}
                </h2>
                {selectedInquiry.business_name && (
                  <p className="text-sm text-[#A9A7A0] font-medium">
                    {selectedInquiry.business_name}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#A9A7A0] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Inspector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Creative Brief & Technical Spec */}
              <div className="space-y-4">
                {/* Story Hook */}
                <div>
                  <span className="text-[11px] font-mono text-[#A9A7A0] uppercase font-bold block mb-1.5">
                    CREATIVE CONCEPT &amp; HOOK BRIEF
                  </span>
                  <div className="p-3.5 rounded-xl bg-[#07080E] border border-white/[0.06] text-xs text-[#E2E1DD] leading-relaxed">
                    {selectedInquiry.story || "No concept notes logged yet."}
                  </div>
                </div>

                {/* Deliverables */}
                <div>
                  <span className="text-[11px] font-mono text-[#A9A7A0] uppercase font-bold block mb-1.5">
                    DELIVERABLE ASSETS
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInquiry.deliverables?.map((d, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-[#141524] text-[#38BDF8] border border-[#38BDF8]/30 font-mono text-xs font-semibold"
                      >
                        ✓ {d}
                      </span>
                    )) || <span className="text-xs text-[#666]">None specified</span>}
                  </div>
                </div>

                {/* Cinema Camera Specs */}
                <div className="p-3.5 rounded-xl bg-[#07080E] border border-white/[0.06] font-mono text-xs space-y-2">
                  <span className="text-[#C6FF3D] font-bold block text-[11px] uppercase">
                    CAMERA &amp; COLOR PROFILE SPEC
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#8E8D9A] block">BODY:</span>
                      <span className="text-[#F4F1EA] font-semibold">Sony FX3 Cinema Line</span>
                    </div>
                    <div>
                      <span className="text-[#8E8D9A] block">RESOLUTION:</span>
                      <span className="text-[#F4F1EA] font-semibold">4K DCI (3840×2160)</span>
                    </div>
                    <div>
                      <span className="text-[#8E8D9A] block">FRAME RATE:</span>
                      <span className="text-[#F4F1EA] font-semibold">24.00fps (180° Shutter)</span>
                    </div>
                    <div>
                      <span className="text-[#8E8D9A] block">COLOR SCIENCE:</span>
                      <span className="text-[#F4F1EA] font-semibold">S-Cinetone / S-Log3</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Deal Financials, Stage & Direct Connect */}
              <div className="space-y-4">
                {/* Financials Box */}
                {permissions.canViewFinancials && (
                  <div className="p-4 rounded-xl bg-[#0A1208] border border-[#C6FF3D]/30 space-y-2">
                    <span className="font-mono text-[10px] text-[#A9A7A0] uppercase font-bold block">
                      COMMERCIAL CONTRACT VALUE
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-black text-3xl text-[#C6FF3D]">
                        ₹{selectedInquiry.deal_value.toLocaleString("en-IN")}
                      </span>
                      <span className="font-mono text-xs text-[#A9A7A0]">INR</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#C6FF3D]/20 font-mono text-[11px]">
                      <div>
                        <span className="text-[#8E8D9A] block">ADVANCE 50%:</span>
                        <span className="text-[#F4F1EA] font-semibold">₹{(selectedInquiry.deal_value * 0.5).toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[#8E8D9A] block">BALANCE ON MASTER:</span>
                        <span className="text-[#F4F1EA] font-semibold">₹{(selectedInquiry.deal_value * 0.5).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pipeline Stage Controller */}
                <div className="p-3.5 rounded-xl bg-[#07080E] border border-white/[0.06] space-y-2.5 font-mono text-xs">
                  <span className="text-[#A9A7A0] uppercase font-bold block text-[11px]">
                    PRODUCTION STAGE CLEARANCE
                  </span>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as InquiryStatus;
                      handleUpdateLeadStatus(selectedInquiry.id, newStatus);
                      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
                    }}
                    className="w-full bg-[#12131F] border border-white/[0.12] rounded-lg px-3 py-2 text-xs text-[#C6FF3D] font-bold focus:outline-none focus:border-[#C6FF3D]"
                  >
                    {PIPELINE_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={selectedInquiry.status === "new"}
                      onClick={() => {
                        handleStepStage(selectedInquiry.id, selectedInquiry.status, "prev");
                        const curIdx = PIPELINE_STAGES.findIndex(p => p.id === selectedInquiry.status);
                        if (curIdx > 0) {
                          setSelectedInquiry({ ...selectedInquiry, status: PIPELINE_STAGES[curIdx - 1].id });
                        }
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-20 text-xs font-semibold text-[#F4F1EA] transition-colors cursor-pointer"
                    >
                      ← Previous Stage
                    </button>
                    <button
                      type="button"
                      disabled={selectedInquiry.status === "delivered"}
                      onClick={() => {
                        handleStepStage(selectedInquiry.id, selectedInquiry.status, "next");
                        const curIdx = PIPELINE_STAGES.findIndex(p => p.id === selectedInquiry.status);
                        if (curIdx < PIPELINE_STAGES.length - 1) {
                          setSelectedInquiry({ ...selectedInquiry, status: PIPELINE_STAGES[curIdx + 1].id });
                        }
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-[#C6FF3D] hover:bg-[#b0f025] disabled:opacity-20 text-xs font-bold text-[#0B0B0F] transition-colors cursor-pointer"
                    >
                      Advance Stage →
                    </button>
                  </div>
                </div>

                {/* Direct Communications Hub */}
                <div className="p-3.5 rounded-xl bg-[#07080E] border border-white/[0.06] space-y-2">
                  <span className="font-mono text-[11px] text-[#A9A7A0] uppercase font-bold block">
                    DIRECT CLIENT COMMUNICATIONS
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href={`https://wa.me/${selectedInquiry.contact.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hello ${selectedInquiry.client_name}, Kirubakaran from 27 Creative Studio here regarding your commercial video project (${selectedInquiry.business_name || "Commercial"}).`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-lg bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare size={14} />
                      <span>Open WhatsApp Chat ↗</span>
                    </a>
                    <a
                      href={`tel:${selectedInquiry.contact}`}
                      className="py-2 px-4 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone size={13} />
                      <span>Call Client</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] font-mono text-xs">
              <span className="text-[#8E8D9A]">
                Inquiry ID: <code className="text-white/60">{selectedInquiry.id}</code>
              </span>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-[#F4F1EA] font-semibold text-xs transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
