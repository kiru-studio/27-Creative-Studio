"use client";

import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import {
  needs as deliverablesList,
  type ContactFormValues,
} from "@/data/contact";
import { siteConfig } from "@/data/siteConfig";
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
  const [needs, setNeeds] = useState<string[]>(["reels"]);
  const [story, setStory] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot

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
    });
  }, [
    name,
    phone,
    needs,
    story,
    onFormValuesChange,
  ]);

  // Validation function
  const validateField = (field: string, val?: any): string | null => {
    switch (field) {
      case "name":
        if (!name.trim()) return "Please add your name.";
        if (name.trim().length < 2) return "Name must be at least 2 characters.";
        return null;
      case "phone":
        if (!phone.trim()) return "Please provide a phone number or email.";
        if (phone.trim().length < 5) return "Please enter a valid phone or email.";
        return null;
      case "needs":
        if (!needs || needs.length === 0) return "Please select at least one deliverable.";
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
      const payload = {
        name,
        phone,
        needs,
        story,
        website,
        formRenderTime: formRenderTimeRef.current,
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

      // Success!
      onSubmitSuccess(currentTimecode);
    } catch (err) {
      console.error("[FORM_SUBMIT_ERROR]", err);
      setServerError("Network error. Please try again or message us on WhatsApp.");
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
          className="p-4 rounded-none border-2 border-[#FF2DA8] bg-[#0B0B0B] text-xs font-mono text-[#D4FF3F] flex items-start gap-2.5 shadow-[4px_4px_0px_#FF2DA8]"
        >
          <AlertCircle size={16} className="text-[#FF2DA8] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 flex flex-col gap-1">
            <span className="font-bold">{serverError}</span>
            <span className="text-[#D4FF3F] text-[11px]">
              Fallback: email us directly at{" "}
              <a
                href={`mailto:${siteConfig.recipientEmail || siteConfig.contactEmail}`}
                className="text-[#D4FF3F] underline font-bold"
              >
                {siteConfig.recipientEmail || siteConfig.contactEmail}
              </a>
            </span>
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
              className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-none border-2 bg-[#0B0B0B] text-base text-[#D4FF3F] outline-none font-mono placeholder:text-[#D4FF3F]/40 transition-all ${
                hasError
                  ? "border-[#FF2DA8] shadow-[4px_4px_0px_#FF2DA8]"
                  : "border-[#FF2DA8] shadow-[4px_4px_0px_#D4FF3F] focus:border-[#D4FF3F] focus:shadow-[5px_5px_0px_#FF2DA8]"
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
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+00 000 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={onFocus}
              onBlur={() => {
                onBlur();
                handleBlur("phone");
              }}
              aria-invalid={hasError}
              aria-describedby={hasError ? "phone-error" : undefined}
              className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-none border-2 bg-[#0B0B0B] text-base text-[#D4FF3F] outline-none font-mono placeholder:text-[#D4FF3F]/40 transition-all ${
                hasError
                  ? "border-[#FF2DA8] shadow-[4px_4px_0px_#FF2DA8]"
                  : "border-[#FF2DA8] shadow-[4px_4px_0px_#D4FF3F] focus:border-[#D4FF3F] focus:shadow-[5px_5px_0px_#FF2DA8]"
              }`}
            />
          )}
        </FieldWithBrackets>
      </div>

      {/* ROLL: Deliverables Multi-select Chip Group */}
      <div className="p-4 rounded-none border-2 border-[#FF2DA8] bg-[#0B0B0B] shadow-[4px_4px_0px_#D4FF3F]">
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
            className={`w-full px-3.5 py-3 rounded-none border-2 bg-[#0B0B0B] text-base text-[#D4FF3F] outline-none font-mono placeholder:text-[#D4FF3F]/40 resize-none leading-relaxed transition-all ${
              hasError
                ? "border-[#FF2DA8] shadow-[4px_4px_0px_#FF2DA8]"
                : "border-[#FF2DA8] shadow-[4px_4px_0px_#D4FF3F] focus:border-[#D4FF3F] focus:shadow-[5px_5px_0px_#FF2DA8]"
            }`}
          />
        )}
      </FieldWithBrackets>

      {/* Two Buttons: Send Brief (Primary Lime) & Book on WhatsApp (Secondary Outlined) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 pt-2">
        <SendBriefButton isLoading={isSubmitting} reducedMotion={reducedMotion} />
        <WhatsAppButton formValues={currentFormValues} reducedMotion={reducedMotion} />
      </div>
    </form>
  );
}
