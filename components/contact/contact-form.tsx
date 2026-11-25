"use client";

import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import {
  needs as deliverablesList,
  type ContactFormValues,
} from "@/data/contact";
import { siteConfig } from "@/data/siteConfig";
import { getSiteEntranceTime } from "@/lib/site-entrance";
import { FieldWithBrackets } from "./field-with-brackets";
import { ChipGroup } from "./chip-group";
import { SendBriefButton } from "./send-brief-button";
import { WhatsAppButton } from "./whatsapp-button";

interface ContactFormProps {
  onFormValuesChange?: (values: Partial<ContactFormValues>) => void;
  onSubmitSuccess: (frozenTimecode?: string) => void;
  currentTimecode?: string;
  reducedMotion?: boolean;
}

export function ContactForm({
  onFormValuesChange,
  onSubmitSuccess,
  currentTimecode,
  reducedMotion = false,
}: ContactFormProps) {
  const formRenderTimeRef = useRef(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [story, setStory] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot
  const [selectedPackage, setSelectedPackage] = useState<{
    id: string;
    tierNumber: string;
    name: string;
  } | null>(null);

  // Listen for package selection from PackagesSection
  useEffect(() => {
    const handleSelectPackageEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        id: string;
        tierNumber: string;
        name: string;
        needs?: string[];
        story?: string;
      }>;
      const detail = customEvent.detail;
      if (detail) {
        setSelectedPackage({
          id: detail.id,
          tierNumber: detail.tierNumber,
          name: detail.name,
        });

        if (detail.needs && detail.needs.length > 0) {
          setNeeds(detail.needs);
        }

        if (detail.story) {
          setStory(detail.story);
        }

        setTimeout(() => {
          const nameInput = document.getElementById("name") as HTMLInputElement | null;
          if (nameInput) {
            nameInput.focus();
          }
        }, 400);
      }
    };

    window.addEventListener("select-package", handleSelectPackageEvent);

    // Initial check from URL hash if user navigated with #contact?package=...
    try {
      const hash = window.location.hash;
      if (hash.includes("package=")) {
        const pkgId = hash.split("package=")[1]?.split("&")[0];
        if (pkgId === "instagram-handling" || pkgId?.includes("01")) {
          setSelectedPackage({ id: "instagram-handling", tierNumber: "WAY / 01", name: "Instagram Page Handling" });
          setNeeds(["instagram", "reels", "google"]);
          setStory("I'm interested in WAY / 01: Instagram Page Handling. We want full-service Instagram page handling and local follower growth.");
        } else if (pkgId === "reels-sprint" || pkgId?.includes("02")) {
          setSelectedPackage({ id: "reels-sprint", tierNumber: "WAY / 02", name: "Reels & Video Sprint" });
          setNeeds(["reels", "strategy"]);
          setStory("I'm interested in WAY / 02: Reels & Video Sprint. We need high-impact video reels and campaign production.");
        } else if (pkgId === "local-growth" || pkgId?.includes("03")) {
          setSelectedPackage({ id: "local-growth", tierNumber: "WAY / 03", name: "Full Local Dominance" });
          setNeeds(["instagram", "reels", "events", "google", "strategy"]);
          setStory("I'm interested in WAY / 03: Full Local Dominance. We want end-to-end local dominance across Instagram, multi-accounts, and Google Maps.");
        }
      }
    } catch {}

    return () => {
      window.removeEventListener("select-package", handleSelectPackageEvent);
    };
  }, []);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstInvalidRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Notify parent of updates for slate header / WhatsApp
  useEffect(() => {
    onFormValuesChange?.({
      name,
      phone,
      needs,
      story,
      package: selectedPackage ? `${selectedPackage.tierNumber} — ${selectedPackage.name}` : undefined,
    });
  }, [
    name,
    phone,
    needs,
    story,
    selectedPackage,
    onFormValuesChange,
  ]);

  // Validation function
  const validateField = (field: string, val?: any): string | null => {
    switch (field) {
      case "name":
        if (!name.trim()) return "Please add your name.";
        if (name.trim().length < 2) return "Name must be at least 2 characters.";
        return null;
      case "phone": {
        const trimmed = phone.trim();
        if (!trimmed) return "Please provide a phone number or email.";
        // Accept valid email format
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
        // Accept all phone number formats: only numbers, with country code (+91, etc.), spaces, dashes, parens
        const digits = trimmed.replace(/\D/g, "");
        if (digits.length >= 7 && digits.length <= 16) return null;
        return "Please enter a valid phone number or email address.";
      }
      case "needs":
        return null;
      case "story":
        if (!story.trim()) return "Tell us what we are making.";
        if (story.trim().length < 5) return "Please share a few more details.";
        if (story.length > 600) return "Story must be 600 characters or fewer.";
        return null;
      default:
        return null;
    }
  };

  const handleBlur = (field: string) => {
    const err = validateField(field);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Validate all required fields
    const newErrors: Record<string, string> = {};
    const nameErr = validateField("name");
    if (nameErr) newErrors.name = nameErr;
    const phoneErr = validateField("phone");
    if (phoneErr) newErrors.phone = phoneErr;
    const needsErr = validateField("needs");
    if (needsErr) newErrors.needs = needsErr;
    const storyErr = validateField("story");
    if (storyErr) newErrors.story = storyErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Focus first invalid field
      const firstFieldId = Object.keys(newErrors)[0];
      const el = document.getElementById(firstFieldId);
      if (el) el.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const entranceTime = getSiteEntranceTime() ?? formRenderTimeRef.current;
      const timeOnSiteMs = Math.max(0, Date.now() - entranceTime);

      const payload = {
        name,
        phone,
        needs,
        story,
        website,
        formRenderTime: formRenderTimeRef.current,
        siteEntranceTime: entranceTime,
        timeOnSiteMs,
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const k of Object.keys(json.fieldErrors)) {
            mapped[k] = json.fieldErrors[k][0];
          }
          setErrors(mapped);
        }
        setServerError(json.error || "Could not record brief. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Fire analytics conversion event when GA4 or Meta Pixel is active
      try {
        const w = window as unknown as {
          gtag?: (...args: unknown[]) => void;
          fbq?: (...args: unknown[]) => void;
        };
        w.gtag?.("event", "generate_lead", {
          event_category: "engagement",
          event_label: selectedPackage?.name || "Website Brief",
        });
        w.fbq?.("track", "Lead", {
          content_name: selectedPackage?.name || "Website Brief",
        });
      } catch {
        // ignore analytics dispatch errors
      }

      // Success!
      onSubmitSuccess(currentTimecode);
    } catch (err) {
      console.error("[FORM_SUBMIT_ERROR]", err);
      setServerError("Network error. Please try again or message us on WhatsApp.");
      setIsSubmitting(false);
    }
  };

  const handleChangePackage = (e: React.MouseEvent) => {
    e.preventDefault();

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("close-mobile-sheet"));

      setTimeout(() => {
        const pkgEl = selectedPackage?.id
          ? document.getElementById(selectedPackage.id) || document.getElementById("packages")
          : document.getElementById("packages");

        if (pkgEl) {
          pkgEl.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          window.location.hash = "packages";
        }

        try {
          window.history.pushState(null, "", `#${selectedPackage?.id || "packages"}`);
        } catch {}
      }, 50);
    }
  };

  const handleRemovePackage = () => {
    setSelectedPackage(null);
    setStory("");
    setNeeds([]);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.story;
      delete next.needs;
      return next;
    });
  };

  const deliverableOptions = deliverablesList.map((d) => ({ id: d.id, label: d.label }));

  const currentFormValues: ContactFormValues = {
    name,
    phone,
    needs,
    story,
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 w-full">
      {/* Honeypot field (hidden for bots) */}
      <div className="absolute opacity-0 pointer-events-none -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Server Error Banner */}
      {serverError && (
        <div
          role="alert"
          className="p-3.5 rounded-lg border border-[#FF5A3D]/40 bg-[#FF5A3D]/10 text-xs font-mono text-[#F4F1EA] flex items-start gap-2.5"
        >
          <AlertCircle size={16} className="text-[#FF5A3D] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 flex flex-col gap-1">
            <span>{serverError}</span>
            <span className="text-[#A9A7A0] text-[11px]">
              Fallback: email us directly at{" "}
              <a
                href={`mailto:${siteConfig.recipientEmail || siteConfig.contactEmail}`}
                className="text-[#C6FF3D] underline"
              >
                {siteConfig.recipientEmail || siteConfig.contactEmail}
              </a>
            </span>
          </div>
        </div>
      )}

      {/* Selected Package Field (Cinema Slate HUD) */}
      {selectedPackage && (
        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-medium text-[#F4F1EA]">
              <span className="font-mono text-[#C6FF3D] font-bold">TIER.</span>
              <span>Selected Package</span>
            </div>
            <button
              type="button"
              onClick={handleRemovePackage}
              className="font-mono text-[10px] text-[#A9A7A0] hover:text-[#FF5A3D] transition-colors uppercase tracking-wider cursor-pointer"
              title="Remove selected package"
            >
              [ REMOVE ]
            </button>
          </div>
          <div className="relative min-h-[48px] px-3.5 py-2.5 rounded-lg border border-[#2A2A30] bg-[#141419] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-mono text-xs font-bold text-[#C6FF3D] tracking-wide shrink-0">
                {selectedPackage.tierNumber}
              </span>
              <span className="text-[#A9A7A0]/40 font-mono text-xs shrink-0">—</span>
              <span className="text-sm font-medium text-[#F4F1EA] truncate">
                {selectedPackage.name}
              </span>
            </div>
            <a
              href="#packages"
              onClick={handleChangePackage}
              className="font-mono text-[10px] tracking-widest text-[#C6FF3D] uppercase px-2.5 py-1 rounded border border-[#C6FF3D]/40 bg-[#C6FF3D]/10 hover:bg-[#C6FF3D] hover:text-[#0B0B0F] transition-all cursor-pointer select-none shrink-0"
              title="Go to packages section to change tier"
            >
              CHANGE
            </a>
          </div>
        </div>
      )}

      {/* Top 2 Columns: DIR. Name & CAM. Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* DIR. Name */}
        <FieldWithBrackets
          id="name"
          label="Name"
          slateTag="DIR."
          error={errors.name}
          reducedMotion={reducedMotion}
        >
          {({ onFocus, onBlur, hasError }) => (
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={onFocus}
              onBlur={() => {
                onBlur();
                handleBlur("name");
              }}
              aria-invalid={hasError}
              aria-describedby={hasError ? "name-error" : undefined}
              className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border bg-[#141419] text-base text-[#F4F1EA] outline-none transition-colors font-sans placeholder:text-[#A9A7A0]/40 ${
                hasError
                  ? "border-[#FF5A3D]"
                  : "border-[#2A2A30] hover:border-[#C6FF3D]/50 focus:border-[#C6FF3D]"
              }`}
            />
          )}
        </FieldWithBrackets>

        {/* CAM. Phone / Contact */}
        <FieldWithBrackets
          id="phone"
          label="Phone or Email"
          slateTag="CAM."
          error={errors.phone}
          reducedMotion={reducedMotion}
        >
          {({ onFocus, onBlur, hasError }) => (
            <input
              id="phone"
              name="phone"
              type="text"
              inputMode="text"
              autoComplete="email tel"
              placeholder="Phone number or email"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.phone;
                    return next;
                  });
                }
              }}
              onFocus={onFocus}
              onBlur={() => {
                onBlur();
                handleBlur("phone");
              }}
              aria-invalid={hasError}
              aria-describedby={hasError ? "phone-error" : undefined}
              className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border bg-[#141419] text-base text-[#F4F1EA] outline-none transition-colors font-sans placeholder:text-[#A9A7A0]/40 ${
                hasError
                  ? "border-[#FF5A3D]"
                  : "border-[#2A2A30] hover:border-[#C6FF3D]/50 focus:border-[#C6FF3D]"
              }`}
            />
          )}
        </FieldWithBrackets>
      </div>

      {/* ROLL: Deliverables Multi-select Chip Group */}
      <div className="p-3.5 rounded-lg border border-[#2A2A30]/80 bg-[#0B0B0F]/40">
        <ChipGroup
          label="What you need"
          slateTag="ROLL"
          options={deliverableOptions}
          selected={needs}
          isMulti
          onChange={(val) => {
            setNeeds(val);
            handleBlur("needs");
          }}
          error={errors.needs}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Story Textarea with 600 character limit */}
      <FieldWithBrackets
        id="story"
        label="Tell us the story"
        slateTag="BRIEF"
        error={errors.story}
        charCount={story.length}
        maxChars={600}
        reducedMotion={reducedMotion}
      >
        {({ onFocus, onBlur, hasError }) => (
          <textarea
            id="story"
            name="story"
            rows={4}
            maxLength={600}
            placeholder="A rough idea is fine. What are we making, and who is it for?"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            onFocus={onFocus}
            onBlur={() => {
              onBlur();
              handleBlur("story");
            }}
            aria-invalid={hasError}
            aria-describedby={hasError ? "story-error" : undefined}
            className={`w-full px-3.5 py-3 rounded-lg border bg-[#141419] text-base text-[#F4F1EA] outline-none transition-colors font-sans placeholder:text-[#A9A7A0]/40 resize-none leading-relaxed ${
              hasError
                ? "border-[#FF5A3D]"
                : "border-[#2A2A30] hover:border-[#C6FF3D]/50 focus:border-[#C6FF3D]"
            }`}
          />
        )}
      </FieldWithBrackets>

      {/* Two Buttons: Send Brief (Primary Lime) & Book on WhatsApp (Secondary Outlined) */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-2">
        <SendBriefButton isLoading={isSubmitting} reducedMotion={reducedMotion} />
        <WhatsAppButton formValues={currentFormValues} reducedMotion={reducedMotion} />
      </div>
    </form>
  );
}
