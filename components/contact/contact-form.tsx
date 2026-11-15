"use client";

import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, ArrowRight, MessageCircle } from "lucide-react";
import {
  needs as deliverablesList,
  type ContactFormValues,
} from "@/data/contact";
import { siteConfig } from "@/data/siteConfig";
import { FieldWithBrackets } from "./field-with-brackets";
import { ChipGroup } from "./chip-group";

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
  const [needs, setNeeds] = useState<string[]>(["reels"]);
  const [timeline, setTimeline] = useState<string>("This month");
  const [story, setStory] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstInvalidRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Timeline options
  const timelineOptions = [
    { id: "This week", label: "This week" },
    { id: "This month", label: "This month" },
    { id: "Just exploring", label: "Just exploring" },
  ];

  // Notify parent of updates for slate header / WhatsApp
  useEffect(() => {
    onFormValuesChange?.({
      name,
      phone,
      needs,
      story,
    });
  }, [
    name,
    phone,
    needs,
    story,
    onFormValuesChange,
  ]);

  // Validation function
  const validateField = (field: string): string | null => {
    switch (field) {
      case "name":
        if (!name.trim()) return "Please add your name.";
        if (name.trim().length < 2) return "Name must be at least 2 characters.";
        return null;
      case "phone":
        if (!phone.trim()) return "Please provide your phone or email.";
        if (phone.trim().length < 5) return "Please enter a valid phone or email.";
        return null;
      case "needs":
        if (!needs || needs.length === 0) return "Please select what you need.";
        return null;
      case "story":
        if (story.length > 600) return "Brief must be 600 characters or fewer.";
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

    // Validate required fields
    const newErrors: Record<string, string> = {};
    const nameErr = validateField("name");
    if (nameErr) newErrors.name = nameErr;
    const phoneErr = validateField("phone");
    if (phoneErr) newErrors.phone = phoneErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstFieldId = Object.keys(newErrors)[0];
      const el = document.getElementById(firstFieldId);
      if (el) el.focus();
      return;
    }

    setIsSubmitting(true);

    // Construct prefilled WhatsApp message
    const msgLines = [
      `Hi 27 Creative Studio, I'd like to discuss a project.`,
      ``,
      `*Name:* ${name.trim()}`,
      `*Phone/Email:* ${phone.trim()}`,
      `*What do you need:* ${needs.join(", ") || "Instagram reels"}`,
      `*How soon to start:* ${timeline}`,
      story.trim() ? `*Brief:* ${story.trim()}` : "",
    ].filter(Boolean);

    const whatsappUrl = `https://wa.me/918300478244?text=${encodeURIComponent(msgLines.join("\n"))}`;

    // Open WhatsApp
    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }

    // Also persist brief asynchronously via contact API
    try {
      const payload = {
        name,
        phone,
        needs,
        story: `${story.trim()} [Timeline: ${timeline}]`,
        website,
        formRenderTime: formRenderTimeRef.current,
      };

      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      onSubmitSuccess(currentTimecode);
    } catch (err) {
      console.error("[FORM_BACKGROUND_SYNC_ERROR]", err);
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Top 2 Columns: Name & Phone or email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <FieldWithBrackets
          id="name"
          label="Name"
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
                  : "border-[#2A2A30] hover:border-[#D4FF3F]/50 focus:border-[#D4FF3F]"
              }`}
            />
          )}
        </FieldWithBrackets>

        {/* Phone or email */}
        <FieldWithBrackets
          id="phone"
          label="Phone or email"
          error={errors.phone}
          reducedMotion={reducedMotion}
        >
          {({ onFocus, onBlur, hasError }) => (
            <input
              id="phone"
              name="phone"
              type="text"
              inputMode="text"
              autoComplete="tel"
              placeholder="+91 ... or email"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
                  : "border-[#2A2A30] hover:border-[#D4FF3F]/50 focus:border-[#D4FF3F]"
              }`}
            />
          )}
        </FieldWithBrackets>
      </div>

      {/* What do you need */}
      <div className="p-3.5 rounded-lg border border-[#2A2A30]/80 bg-[#0B0B0F]/40">
        <ChipGroup
          label="What do you need"
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

      {/* How soon do you want to start? (Optional chips) */}
      <div className="p-3.5 rounded-lg border border-[#2A2A30]/80 bg-[#0B0B0F]/40">
        <span className="block text-xs text-[#F4F1EA] font-medium mb-2.5">
          How soon do you want to start?
        </span>
        <div className="flex flex-wrap gap-2">
          {timelineOptions.map((opt) => {
            const isSelected = timeline === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTimeline(opt.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                  isSelected
                    ? "bg-[#D4FF3F] text-[#0B0B0B] font-bold shadow-sm"
                    : "bg-[#141419] text-[#EFE6D8]/80 border border-[#2A2A30] hover:border-white/30"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brief */}
      <FieldWithBrackets
        id="story"
        label="Brief"
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
            placeholder="Tell us what you are looking to create and any upcoming promotions or milestones..."
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
                : "border-[#2A2A30] hover:border-[#D4FF3F]/50 focus:border-[#D4FF3F]"
            }`}
          />
        )}
      </FieldWithBrackets>

      {/* Primary Action: Send on WhatsApp */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-lg bg-[#D4FF3F] !text-[#0B0B0B] font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md hover:brightness-105 active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF3F] cursor-pointer"
        >
          <span>Send on WhatsApp</span>
          <ArrowRight className="w-4 h-4 !text-[#0B0B0B]" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
