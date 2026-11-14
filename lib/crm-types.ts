export type TeamRole = "principal" | "producer" | "crew" | "editor" | "client";

export type InquiryStatus =
  | "new"
  | "contacted"
  | "call_scheduled"
  | "shoot_booked"
  | "in_production"
  | "in_edit"
  | "delivered"
  | "lost";

export type ShootStatus =
  | "scheduled"
  | "shooting"
  | "in_edit"
  | "review"
  | "delivered";

export interface ClientRecord {
  id: string;
  brand_name: string;
  business_type: string;
  primary_contact: string;
  phone: string;
  email?: string;
  instagram_handle?: string;
  google_maps_url?: string;
  live_followers: number;
  follower_start: number;
  growth_multiplier: number;
  top_reel_views: string;
  total_posts: number;
  google_rating: number;
  google_reviews_count: number;
  total_revenue: number;
  status: string;
  created_at: string;
}

export interface InquiryRecord {
  id: string;
  client_id?: string;
  client_name: string;
  contact: string;
  business_name?: string;
  business_type?: string;
  deliverables: string[];
  story: string;
  status: InquiryStatus;
  deal_value: number;
  source: string;
  assigned_to?: string;
  notes?: string;
  created_at: string;
}

export interface ShootRecord {
  id: string;
  inquiry_id?: string;
  client_id?: string;
  client_name: string;
  shoot_date: string;
  call_time: string;
  location_address: string;
  google_maps_link?: string;
  assigned_crew: string[];
  gear_checklist: string[];
  packed_gear?: string[]; // checked items by crew on location
  deliverable_reels: number;
  deliverable_films: number;
  status: ShootStatus;
  notes?: string;
  created_at?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: TeamRole;
  title: string;
  avatar?: string;
  status: "active" | "invited" | "inactive";
  assigned_leads_count: number;
  assigned_shoots_count: number;
  joined_at: string;
}

export interface AnalyticsSummary {
  totalInquiries: number;
  newLeads: number;
  shootsBooked: number;
  conversionRate: number; // percentage
  pipelineValue: number; // ₹
  wonRevenue: number; // ₹
  activeShootsCount: number;
}

export const ROLE_PERMISSIONS: Record<
  TeamRole,
  {
    canViewFinancials: boolean;
    canViewAnalytics: boolean;
    canManageLeads: boolean;
    canManageShoots: boolean;
    canManageGear: boolean;
    canPublishCMS: boolean;
    canViewAllClients: boolean;
    canManageTeam: boolean;
    canEditClientNotes: boolean;
  }
> = {
  principal: {
    canViewFinancials: true,
    canViewAnalytics: true,
    canManageLeads: true,
    canManageShoots: true,
    canManageGear: true,
    canPublishCMS: true,
    canViewAllClients: true,
    canManageTeam: true,
    canEditClientNotes: true,
  },
  producer: {
    canViewFinancials: true,
    canViewAnalytics: true,
    canManageLeads: true,
    canManageShoots: true,
    canManageGear: true,
    canPublishCMS: true,
    canViewAllClients: true,
    canManageTeam: true,
    canEditClientNotes: true,
  },
  crew: {
    canViewFinancials: false,
    canViewAnalytics: false,
    canManageLeads: false,
    canManageShoots: false,
    canManageGear: true,
    canPublishCMS: false,
    canViewAllClients: false,
    canManageTeam: false,
    canEditClientNotes: false,
  },
  editor: {
    canViewFinancials: false,
    canViewAnalytics: false,
    canManageLeads: false,
    canManageShoots: false,
    canManageGear: false,
    canPublishCMS: false,
    canViewAllClients: false,
    canManageTeam: false,
    canEditClientNotes: false,
  },
  client: {
    canViewFinancials: false,
    canViewAnalytics: false,
    canManageLeads: false,
    canManageShoots: false,
    canManageGear: false,
    canPublishCMS: false,
    canViewAllClients: false,
    canManageTeam: false,
    canEditClientNotes: false,
  },
};
