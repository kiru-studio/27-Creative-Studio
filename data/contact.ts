import { siteConfig } from "./siteConfig";

export interface BusinessType {
  id: string;
  label: string;
  sceneCode: string;
}

export interface DeliverableNeed {
  id: string;
  label: string;
  rollCode: string;
}

export interface ContactChannel {
  id: string;
  label: string;
  value: string;
  href: string;
  copyValue: string;
}

export const businessTypes: BusinessType[] = [
  { id: "restaurant", label: "Restaurant & Food", sceneCode: "01" },
  { id: "automobile", label: "Automobile Showroom", sceneCode: "02" },
  { id: "retail", label: "Retail & Appliances", sceneCode: "03" },
  { id: "education", label: "Training & Education", sceneCode: "04" },
  { id: "other", label: "Other Business", sceneCode: "05" },
];

// Deliverables derived from 27 Creative Studio's core offerings in portfolio.pdf
export const needs: DeliverableNeed[] = [
  { id: "instagram", label: "Instagram page handling", rollCode: "IG" },
  { id: "reels", label: "Reels & video content", rollCode: "R01" },
  { id: "festival", label: "Festival & offer creatives", rollCode: "F01" },
  { id: "events", label: "Event coverage", rollCode: "E01" },
  { id: "google", label: "Google Business Profile", rollCode: "GBP" },
  { id: "strategy", label: "Growth strategy", rollCode: "G01" },
];

export const dateShortcuts = [
  "This week",
  "Next 2 weeks",
  "Flexible",
] as const;

export type DateShortcut = (typeof dateShortcuts)[number];

export const channels: ContactChannel[] = [
  {
    id: "phone",
    label: "Call",
    value: "83004 78244",
    href: "tel:+918300478244",
    copyValue: "8300478244",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: `+91 ${siteConfig.whatsappNumber.slice(2)}`,
    href: `https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2027%20Creative%20Studio%2C%20I%20want%20to%20grow%20my%20business%20in%20Thoothukudi.`,
    copyValue: "+91 83004 78244",
  },
  {
    id: "email",
    label: "Email",
    value: siteConfig.recipientEmail || siteConfig.contactEmail,
    href: `mailto:${siteConfig.recipientEmail || siteConfig.contactEmail}`,
    copyValue: siteConfig.recipientEmail || siteConfig.contactEmail,
  },
  {
    id: "instagram",
    label: "Instagram",
    value: "@27creativestudio",
    href: "https://instagram.com/",
    copyValue: "@27creativestudio",
  },
];

export interface ContactFormValues {
  name: string;
  phone: string;
  businessName?: string;
  businessType?: string;
  customBusinessType?: string;
  needs: string[];
  story: string;
  date?: string;
  dateShortcut?: string;
  referenceLink?: string;
}

/**
 * Builds a clean WhatsApp message pre-filled with form details
 */
export function buildWhatsAppMessage(values: Partial<ContactFormValues>): string {
  const parts: string[] = ["*New Growth Brief · 27 CREATIVE STUDIO*"];

  if (values.name?.trim()) {
    parts.push(`*Name:* ${values.name.trim()}`);
  }

  const resolvedBusiness =
    values.businessType === "other"
      ? values.customBusinessType?.trim() || "Other"
      : values.businessType?.trim() || "";

  if (values.businessName?.trim()) {
    parts.push(`*Business:* ${values.businessName.trim()} (${resolvedBusiness || "Business"})`);
  } else if (resolvedBusiness) {
    parts.push(`*Business Type:* ${resolvedBusiness}`);
  }

  if (values.phone?.trim()) {
    parts.push(`*Contact:* ${values.phone.trim()}`);
  }

  if (values.needs && values.needs.length > 0) {
    parts.push(`*Deliverables:* ${values.needs.join(", ")}`);
  }

  const resolvedDate = values.date || values.dateShortcut;
  if (resolvedDate) {
    parts.push(`*Timeline / Date:* ${resolvedDate}`);
  }

  if (values.story?.trim()) {
    parts.push(`*What You Need:* ${values.story.trim()}`);
  }

  if (values.referenceLink?.trim()) {
    parts.push(`*Instagram / Reference:* ${values.referenceLink.trim()}`);
  }

  return parts.join("\n\n");
}

