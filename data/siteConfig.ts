// ==========================================
// SITE CONFIGURATION (Owner-Specific Constants)
// ==========================================
// Operational constants referenced via {config.key}
// tokens in FAQ answers and website copy.

export const siteConfig = {
  // Production & Delivery
  turnaround: "3 to 5 business days from the shoot",
  revisions: "1 included review round with timecoded notes",
  reelLength: "15 to 45 seconds",
  filmLength: "45 to 90 seconds",
  rawFootage: "Available on request for an archive transfer fee",

  // Pricing & Booking
  startingFrom: "Growth packages and monthly page management tailored for local businesses.",
  paymentTerms: "50% advance upon onboarding to schedule shoot dates, and 50% upon delivery of monthly assets.",
  deposit: "50% advance to lock shoot dates",
  exclusions: "Third-party commercial music licensing outside our standard catalogue and external talent fees",
  leadTime: "1 to 2 weeks ahead is ideal",
  rescheduleNotice: "24 hours notice",
  reschedulePolicy: "Outdoor shoots reschedule for rain or bad weather at no charge with 24 hours notice.",
  introCall: "15-minute intro call or WhatsApp brief",

  // Rights & Distribution
  usageRights: "Full commercial usage rights across digital, social and web in perpetuity.",
  postingPolicy: "We handle complete Instagram page management, hashtag optimization, and export-ready files.",

  // Location & Travel
  city: "Thoothukudi",
  travelPolicy: "Serving businesses across Thoothukudi (Tuticorin), Tirunelveli, and surrounding districts.",
  contactEmail: "hello@27creativestudio.com",
  contactCta: "Call 83004 78244",
  contactAnchor: "#contact",

  // Contact & Inquiries Configuration (27 Creative Studio)
  whatsappNumber: "918300478244", // International format, no '+' or spaces
  recipientEmail: "hello@27creativestudio.com", // Destination for brief submissions
  availabilityText: "Now booking for Thoothukudi businesses", // Monthly booking status indicator
  replyTime: "We reply within 24 hours (Call / WhatsApp: 83004 78244)", // Expected response SLA
} as const;

export type SiteConfig = typeof siteConfig;
