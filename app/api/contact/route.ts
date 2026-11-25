import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { siteConfig } from "@/data/siteConfig";
import { createInquiry } from "@/lib/studio-db";
import { formatTimeOnSite } from "@/lib/site-entrance";

// In-memory rate limiting: IP -> timestamps
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const isLocal = ip === "127.0.0.1" || ip === "::1" || ip === "localhost";
  const maxRequests = isLocal ? 50 : 10;

  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < windowMs
  );
  if (timestamps.length >= maxRequests) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  phone: z
    .string()
    .trim()
    .min(5, "Please enter a valid phone or email.")
    .refine(
      (val) => {
        // Email check
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return true;
        // Phone check: accept any format (only numbers, with country code, spaces, dashes)
        const digits = val.replace(/\D/g, "");
        return digits.length >= 7 && digits.length <= 16;
      },
      { message: "Please enter a valid phone number or email address." }
    ),
  businessName: z.string().trim().optional(),
  businessType: z.string().trim().optional(),
  customBusinessType: z.string().trim().optional(),
  needs: z.array(z.string()).optional().default([]),
  story: z
    .string()
    .trim()
    .min(5, "Please describe what we're making.")
    .max(600, "Brief description must be 600 characters or fewer."),
  preferredDate: z.string().trim().optional(),
  dateShortcut: z.string().trim().optional(),
  referenceLink: z.string().trim().optional(),
  website: z.string().max(0, "Bot detected").optional(), // Honeypot
  formRenderTime: z.number().optional(), // Anti-bot time check
  siteEntranceTime: z.number().optional(), // First-entrance timestamp on site
  timeOnSiteMs: z.number().optional(), // Fallback duration computed on client
});

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a few minutes or message us on WhatsApp." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Honeypot check
    if (data.website && data.website.length > 0) {
      return NextResponse.json(
        { error: "Submission rejected." },
        { status: 400 }
      );
    }

    // Minimum time-to-submit check (minimum 2.5 seconds to prevent automated scrapers)
    if (data.formRenderTime && Date.now() - data.formRenderTime < 2500) {
      return NextResponse.json(
        { error: "Form submitted too quickly. Please try again." },
        { status: 400 }
      );
    }

    const resolvedTimeOnSiteMs =
      typeof data.siteEntranceTime === "number" && data.siteEntranceTime > 0
        ? Math.max(0, Date.now() - data.siteEntranceTime)
        : typeof data.timeOnSiteMs === "number" && data.timeOnSiteMs >= 0
        ? data.timeOnSiteMs
        : typeof data.formRenderTime === "number"
        ? Math.max(0, Date.now() - data.formRenderTime)
        : undefined;

    const durationLabel =
      typeof resolvedTimeOnSiteMs === "number"
        ? formatTimeOnSite(resolvedTimeOnSiteMs)
        : undefined;

    const recipient = siteConfig.recipientEmail || siteConfig.contactEmail;
    const resolvedBusiness =
      data.businessType === "other"
        ? data.customBusinessType || "Other"
        : data.businessType;

    const emailSubject = `[27 CREATIVE STUDIO BRIEF] ${data.name}${resolvedBusiness ? ` - ${resolvedBusiness}` : ""}`;
    const emailBody = [
      `New brief received from ${data.name}:`,
      ``,
      `DIRECTOR (Name): ${data.name}`,
      `CAMERA (Contact): ${data.phone}`,
      `SCENE (Business): ${data.businessName || "N/A"}${resolvedBusiness ? ` (${resolvedBusiness})` : ""}`,
      `ROLL (Deliverables): ${data.needs.join(", ")}`,
      `DATE (Timeline): ${data.preferredDate || data.dateShortcut || "Flexible"}`,
      `REFERENCE: ${data.referenceLink || "None provided"}`,
      ...(durationLabel ? [`TIME ON SITE: ${durationLabel}`] : []),
      ``,
      `THE STORY:`,
      data.story,
    ].join("\n");

    // Save brief directly into Studio OS CRM & Supabase
    try {
      await createInquiry({
        client_name: data.name,
        contact: data.phone,
        business_name: data.businessName || resolvedBusiness || "",
        business_type: resolvedBusiness || "other",
        deliverables: data.needs,
        story: data.story,
        deal_value: 20000,
        source: "web_brief",
        notes: `Submitted via website brief form.${durationLabel ? ` Time on site: ${durationLabel}.` : ""} Timeline preference: ${data.preferredDate || data.dateShortcut || "Flexible"}.`,
        status: "new",
      });
    } catch (dbErr) {
      console.error("[CRM_AUTO_SAVE_ERROR]", dbErr);
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from:
              process.env.RESEND_FROM_EMAIL ||
              "27 Creative Studio <onboarding@resend.dev>",
            to: [recipient],
            subject: emailSubject,
            text: emailBody,
          }),
        });

        if (!resendRes.ok) {
          const resendError = await resendRes.text();
          console.error("[RESEND_ERROR]", resendError);
        }
      } catch (err) {
        console.error("[EMAIL_DISPATCH_ERROR]", err);
      }
    } else {
      console.log("[LOCAL_DEV_BRIEF_SUBMISSION]", {
        to: recipient,
        subject: emailSubject,
        body: emailBody,
      });
    }

    return NextResponse.json({
      success: true,
      message: "That's a wrap. Your brief has been locked and recorded.",
    });
  } catch (err) {
    console.error("[CONTACT_API_ERROR]", err);
    return NextResponse.json(
      { error: "Server error while processing brief. Please try again or use WhatsApp." },
      { status: 500 }
    );
  }
}
