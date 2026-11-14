import fs from "node:fs";
import path from "node:path";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import {
  TeamRole,
  InquiryStatus,
  ShootStatus,
  ClientRecord,
  InquiryRecord,
  ShootRecord,
  TeamMember,
  AnalyticsSummary,
  ROLE_PERMISSIONS,
} from "./crm-types";

export type {
  TeamRole,
  InquiryStatus,
  ShootStatus,
  ClientRecord,
  InquiryRecord,
  ShootRecord,
  TeamMember,
  AnalyticsSummary,
};
export { ROLE_PERMISSIONS };

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "team-1",
    name: "Kirubakaran (Kiru)",
    email: "kiru@27creativestudio.com",
    phone: "+91 83004 78244",
    role: "principal",
    title: "Founder & Lead Director",
    status: "active",
    assigned_leads_count: 3,
    assigned_shoots_count: 2,
    joined_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "team-2",
    name: "Arunkumar M",
    email: "arun@27creativestudio.com",
    phone: "+91 94421 99881",
    role: "producer",
    title: "Production Head & Producer",
    status: "active",
    assigned_leads_count: 2,
    assigned_shoots_count: 2,
    joined_at: "2024-03-15T00:00:00Z",
  },
  {
    id: "team-3",
    name: "Selva K",
    email: "selva@27creativestudio.com",
    phone: "+91 98422 11223",
    role: "crew",
    title: "Lead Cinematographer & Drone Pilot",
    status: "active",
    assigned_leads_count: 0,
    assigned_shoots_count: 2,
    joined_at: "2024-06-01T00:00:00Z",
  },
  {
    id: "team-4",
    name: "Dinesh R",
    email: "dinesh@27creativestudio.com",
    phone: "+91 97899 44556",
    role: "editor",
    title: "Senior Reel & Film Editor",
    status: "active",
    assigned_leads_count: 0,
    assigned_shoots_count: 1,
    joined_at: "2024-07-10T00:00:00Z",
  },
  {
    id: "team-5",
    name: "Thamira Restaurant (Client Portal)",
    email: "thamira@gmail.com",
    phone: "+91 83004 78244",
    role: "client",
    title: "Brand Client Partner",
    status: "active",
    assigned_leads_count: 1,
    assigned_shoots_count: 1,
    joined_at: "2024-10-01T00:00:00Z",
  },
];

// Local store helpers
function getLocalStorePath(): string {
  return path.join(process.cwd(), "data", "studio-store.json");
}

function readLocalStore(): {
  clients: ClientRecord[];
  inquiries: InquiryRecord[];
  shoots: ShootRecord[];
  team_members: TeamMember[];
} {
  try {
    const p = getLocalStorePath();
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, "utf-8");
      const parsed = JSON.parse(raw);
      if (!parsed.team_members || !Array.isArray(parsed.team_members) || parsed.team_members.length === 0) {
        parsed.team_members = DEFAULT_TEAM_MEMBERS;
        writeLocalStore(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error("[LOCAL_STORE_READ_ERR]", err);
  }
  return { clients: [], inquiries: [], shoots: [], team_members: DEFAULT_TEAM_MEMBERS };
}

function writeLocalStore(data: {
  clients: ClientRecord[];
  inquiries: InquiryRecord[];
  shoots: ShootRecord[];
  team_members?: TeamMember[];
}) {
  try {
    const p = getLocalStorePath();
    fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[LOCAL_STORE_WRITE_ERR]", err);
  }
}

// ==========================================
// 1. CLIENTS & LIVE SOCIALS
// ==========================================

export async function getClients(): Promise<ClientRecord[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data as ClientRecord[];
    } catch (e) {
      console.warn("Supabase query failed, falling back to local store:", e);
    }
  }
  return readLocalStore().clients;
}

export async function createClient(client: Partial<ClientRecord>): Promise<ClientRecord> {
  const isUuid = client.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(client.id);
  const supabase = getSupabase();
  if (supabase) {
    try {
      const payload: Record<string, any> = {
        brand_name: client.brand_name || "New Client",
        business_type: client.business_type || "other",
        primary_contact: client.primary_contact || "",
        phone: client.phone || "",
        email: client.email || "",
        instagram_handle: client.instagram_handle || "",
        google_maps_url: client.google_maps_url || "",
        live_followers: Number(client.live_followers || 0),
        follower_start: Number(client.follower_start || 0),
        growth_multiplier: Number(client.growth_multiplier || 1.0),
        top_reel_views: client.top_reel_views || "0 views",
        total_posts: Number(client.total_posts || 0),
        google_rating: Number(client.google_rating || 5.0),
        google_reviews_count: Number(client.google_reviews_count || 0),
        total_revenue: Number(client.total_revenue || 0),
        status: client.status || "active",
      };
      if (isUuid) payload.id = client.id;
      const { data, error } = await supabase.from("clients").insert([payload]).select().single();
      if (!error && data) return data as ClientRecord;
      if (error) console.error("[SUPABASE_CLIENT_INSERT_ERROR]", error);
    } catch (err) {
      console.error("[SUPABASE_CLIENT_INSERT_EXC]", err);
    }
  }

  const newClient: ClientRecord = {
    id: client.id || `client-${Date.now()}`,
    brand_name: client.brand_name || "New Client",
    business_type: client.business_type || "other",
    primary_contact: client.primary_contact || "",
    phone: client.phone || "",
    email: client.email || "",
    instagram_handle: client.instagram_handle || "",
    google_maps_url: client.google_maps_url || "",
    live_followers: Number(client.live_followers || 0),
    follower_start: Number(client.follower_start || 0),
    growth_multiplier: Number(client.growth_multiplier || 1.0),
    top_reel_views: client.top_reel_views || "0 views",
    total_posts: Number(client.total_posts || 0),
    google_rating: Number(client.google_rating || 5.0),
    google_reviews_count: Number(client.google_reviews_count || 0),
    total_revenue: Number(client.total_revenue || 0),
    status: client.status || "active",
    created_at: new Date().toISOString(),
  };

  const store = readLocalStore();
  store.clients.unshift(newClient);
  writeLocalStore(store);
  return newClient;
}

export async function updateClient(
  id: string,
  patch: Partial<ClientRecord>
): Promise<ClientRecord | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("clients")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return data as ClientRecord;
    } catch {}
  }

  const store = readLocalStore();
  const idx = store.clients.findIndex((c) => c.id === id);
  if (idx !== -1) {
    store.clients[idx] = { ...store.clients[idx], ...patch };
    writeLocalStore(store);
    return store.clients[idx];
  }
  return null;
}

// ==========================================
// 2. INQUIRIES & CRM PIPELINE
// ==========================================

export async function getInquiries(): Promise<InquiryRecord[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data as InquiryRecord[];
    } catch (e) {
      console.warn("Supabase query failed, falling back to local store:", e);
    }
  }
  return readLocalStore().inquiries;
}

export async function createInquiry(
  inquiry: Omit<InquiryRecord, "id" | "created_at"> & { id?: string }
): Promise<InquiryRecord> {
  const isUuid = inquiry.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(inquiry.id);
  const supabase = getSupabase();
  if (supabase) {
    try {
      const payload: Record<string, any> = {
        client_name: inquiry.client_name,
        contact: inquiry.contact,
        business_name: inquiry.business_name || "",
        business_type: inquiry.business_type || "other",
        deliverables: inquiry.deliverables || [],
        story: inquiry.story || "",
        status: inquiry.status || "new",
        deal_value: Number(inquiry.deal_value || 0),
        source: inquiry.source || "web_brief",
        assigned_to: inquiry.assigned_to || null,
        notes: inquiry.notes || null,
      };
      if (inquiry.client_id) payload.client_id = inquiry.client_id;
      if (isUuid) payload.id = inquiry.id;

      const { data, error } = await supabase.from("inquiries").insert([payload]).select().single();
      if (!error && data) return data as InquiryRecord;
      if (error) console.error("[SUPABASE_INQUIRY_INSERT_ERROR]", error);
    } catch (err) {
      console.error("[SUPABASE_INQUIRY_INSERT_EXC]", err);
    }
  }

  const newInq: InquiryRecord = {
    id: inquiry.id || `inq-${Date.now()}`,
    client_name: inquiry.client_name,
    contact: inquiry.contact,
    business_name: inquiry.business_name || "",
    business_type: inquiry.business_type || "other",
    deliverables: inquiry.deliverables || [],
    story: inquiry.story || "",
    status: inquiry.status || "new",
    deal_value: Number(inquiry.deal_value || 0),
    source: inquiry.source || "web_brief",
    assigned_to: inquiry.assigned_to || "Unassigned",
    notes: inquiry.notes || "",
    created_at: new Date().toISOString(),
  };

  const store = readLocalStore();
  store.inquiries.unshift(newInq);
  writeLocalStore(store);
  return newInq;
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus,
  notes?: string
): Promise<InquiryRecord | null> {
  const patch: Partial<InquiryRecord> = { status };
  if (notes !== undefined) patch.notes = notes;

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("inquiries")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return data as InquiryRecord;
    } catch {}
  }

  const store = readLocalStore();
  const idx = store.inquiries.findIndex((i) => i.id === id);
  if (idx !== -1) {
    store.inquiries[idx] = { ...store.inquiries[idx], ...patch };
    writeLocalStore(store);
    return store.inquiries[idx];
  }
  return null;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("inquiries").delete().eq("id", id);
    } catch {}
  }

  const store = readLocalStore();
  store.inquiries = store.inquiries.filter((i) => i.id !== id);
  writeLocalStore(store);
  return true;
}

// ==========================================
// 3. SHOOTS & MASTER SCHEDULE
// ==========================================

export async function getShoots(): Promise<ShootRecord[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("shoots")
        .select("*")
        .order("shoot_date", { ascending: true });
      if (!error && data) return data as ShootRecord[];
    } catch (e) {
      console.warn("Supabase query failed, falling back to local store:", e);
    }
  }
  return readLocalStore().shoots;
}

export async function createShoot(shoot: Partial<ShootRecord>): Promise<ShootRecord> {
  const isUuid = shoot.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(shoot.id);
  const supabase = getSupabase();
  if (supabase) {
    try {
      const payload: Record<string, any> = {
        client_name: shoot.client_name || "Client Shoot",
        shoot_date: shoot.shoot_date || new Date().toISOString().split("T")[0],
        call_time: shoot.call_time || "09:00 AM",
        location_address: shoot.location_address || "Thoothukudi, Tamil Nadu",
        google_maps_link: shoot.google_maps_link || "",
        assigned_crew: shoot.assigned_crew || ["Director (Kiru)"],
        gear_checklist: shoot.gear_checklist || [
          "Sony FX3 Cinema Body",
          "Sony 24-70mm f/2.8 GM",
          "Wireless Mic Kit",
          "Godox Lighting Kit",
          "SanDisk 128GB V90 Cards",
        ],
        deliverable_reels: Number(shoot.deliverable_reels || 4),
        deliverable_films: Number(shoot.deliverable_films || 0),
        status: shoot.status || "scheduled",
        notes: shoot.notes || "",
      };
      if (shoot.inquiry_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(shoot.inquiry_id)) {
        payload.inquiry_id = shoot.inquiry_id;
      }
      if (isUuid) payload.id = shoot.id;

      const { data, error } = await supabase.from("shoots").insert([payload]).select().single();
      if (!error && data) return data as ShootRecord;
      if (error) console.error("[SUPABASE_SHOOT_INSERT_ERROR]", error);
    } catch (err) {
      console.error("[SUPABASE_SHOOT_INSERT_EXC]", err);
    }
  }

  const newShoot: ShootRecord = {
    id: shoot.id || `shoot-${Date.now()}`,
    client_name: shoot.client_name || "Client Shoot",
    inquiry_id: shoot.inquiry_id,
    shoot_date: shoot.shoot_date || new Date().toISOString().split("T")[0],
    call_time: shoot.call_time || "09:00 AM",
    location_address: shoot.location_address || "Thoothukudi, Tamil Nadu",
    google_maps_link: shoot.google_maps_link || "",
    assigned_crew: shoot.assigned_crew || ["Director (Kiru)"],
    gear_checklist: shoot.gear_checklist || [
      "Sony FX3 Cinema Body",
      "Sony 24-70mm f/2.8 GM",
      "Wireless Mic Kit",
      "Godox Lighting Kit",
      "SanDisk 128GB V90 Cards",
    ],
    deliverable_reels: Number(shoot.deliverable_reels || 4),
    deliverable_films: Number(shoot.deliverable_films || 0),
    status: shoot.status || "scheduled",
    notes: shoot.notes || "",
    created_at: new Date().toISOString(),
  };

  const store = readLocalStore();
  store.shoots.push(newShoot);
  writeLocalStore(store);
  return newShoot;
}

export async function updateShootStatus(
  id: string,
  status: ShootStatus
): Promise<ShootRecord | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("shoots")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return data as ShootRecord;
    } catch {}
  }

  const store = readLocalStore();
  const idx = store.shoots.findIndex((s) => s.id === id);
  if (idx !== -1) {
    store.shoots[idx].status = status;
    writeLocalStore(store);
    return store.shoots[idx];
  }
  return null;
}

// ==========================================
// 4. EXECUTIVE ANALYTICS
// ==========================================

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const inquiries = await getInquiries();
  const shoots = await getShoots();
  const clients = await getClients();

  const totalInquiries = inquiries.length;
  const newLeads = inquiries.filter((i) => i.status === "new").length;

  const bookedStatuses: InquiryStatus[] = [
    "shoot_booked",
    "in_production",
    "in_edit",
    "delivered",
  ];
  const shootsBooked = inquiries.filter((i) => bookedStatuses.includes(i.status)).length;

  const conversionRate = totalInquiries > 0
    ? Math.round((shootsBooked / totalInquiries) * 100)
    : 0;

  const pipelineValue = inquiries
    .filter((i) => i.status !== "lost" && i.status !== "delivered")
    .reduce((sum, i) => sum + (Number(i.deal_value) || 0), 0);

  const wonFromInquiries = inquiries
    .filter((i) => i.status === "delivered" || i.status === "shoot_booked")
    .reduce((sum, i) => sum + (Number(i.deal_value) || 0), 0);

  const clientRevenue = clients.reduce((sum, c) => sum + (Number(c.total_revenue) || 0), 0);
  const wonRevenue = wonFromInquiries + clientRevenue;

  const activeShootsCount = shoots.filter((s) => s.status !== "delivered").length;

  return {
    totalInquiries,
    newLeads,
    shootsBooked,
    conversionRate,
    pipelineValue,
    wonRevenue,
    activeShootsCount,
  };
}

// ==========================================
// 5. SHOOT GEAR PACKING TOGGLE
// ==========================================

export async function toggleShootGear(
  shootId: string,
  gearItem: string
): Promise<ShootRecord | null> {
  const store = readLocalStore();
  const idx = store.shoots.findIndex((s) => s.id === shootId);
  if (idx === -1) return null;

  const shoot = store.shoots[idx];
  const packed = new Set(shoot.packed_gear || []);
  if (packed.has(gearItem)) {
    packed.delete(gearItem);
  } else {
    packed.add(gearItem);
  }
  shoot.packed_gear = Array.from(packed);
  store.shoots[idx] = shoot;
  writeLocalStore(store);

  // Sync with Supabase if configured
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase
        .from("shoots")
        .update({ notes: `Packed items: ${shoot.packed_gear.join(", ")}` })
        .eq("id", shootId);
    } catch {}
  }

  return shoot;
}

// ==========================================
// 6. CLIENT LIVE SOCIAL REFRESH
// ==========================================

export async function syncClientSocials(clientId: string): Promise<ClientRecord | null> {
  const store = readLocalStore();
  const idx = store.clients.findIndex((c) => c.id === clientId);
  if (idx === -1) return null;

  const client = store.clients[idx];
  // Calculate simulated live follower growth based on viral reel performance
  const boost = Math.floor(Math.random() * 150) + 50;
  client.live_followers = (client.live_followers || 1000) + boost;
  if (client.follower_start > 0) {
    client.growth_multiplier = Number((client.live_followers / client.follower_start).toFixed(1));
  }
  client.total_posts = (client.total_posts || 50) + 1;
  store.clients[idx] = client;
  writeLocalStore(store);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase
        .from("clients")
        .update({
          live_followers: client.live_followers,
          growth_multiplier: client.growth_multiplier,
          total_posts: client.total_posts,
        })
        .eq("id", clientId);
    } catch {}
  }

  return client;
}

// ==========================================
// 7. TEAM & ROLE MANAGEMENT (RBAC)
// ==========================================

export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error && data && data.length > 0) {
        return data.map((p) => ({
          id: p.id,
          name: p.full_name || "Team Member",
          email: p.email || "",
          phone: p.phone || "",
          role: p.role as TeamRole,
          title: p.title || `${p.role.toUpperCase()} // Team`,
          avatar: p.avatar_url || "",
          status: "active",
          assigned_leads_count: 0,
          assigned_shoots_count: 0,
          joined_at: p.created_at || new Date().toISOString(),
        }));
      }
    } catch {}
  }
  return readLocalStore().team_members;
}

export async function createTeamMember(
  member: Partial<TeamMember>
): Promise<TeamMember> {
  const store = readLocalStore();
  const newMember: TeamMember = {
    id: member.id || `team-${Date.now()}`,
    name: member.name || "New Team Member",
    email: member.email || "",
    phone: member.phone || "+91 83004 78244",
    role: member.role || "crew",
    title: member.title || "Production Specialist",
    avatar: member.avatar || "",
    status: member.status || "active",
    assigned_leads_count: 0,
    assigned_shoots_count: 0,
    joined_at: new Date().toISOString(),
  };

  store.team_members.push(newMember);
  writeLocalStore(store);
  return newMember;
}

export async function updateTeamMemberRole(
  id: string,
  role: TeamRole,
  title?: string
): Promise<TeamMember | null> {
  const store = readLocalStore();
  const idx = store.team_members.findIndex((m) => m.id === id);
  if (idx === -1) return null;

  store.team_members[idx].role = role;
  if (title) store.team_members[idx].title = title;
  writeLocalStore(store);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("profiles").update({ role }).eq("id", id);
    } catch {}
  }

  return store.team_members[idx];
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const store = readLocalStore();
  store.team_members = store.team_members.filter((m) => m.id !== id);
  writeLocalStore(store);
  return true;
}
