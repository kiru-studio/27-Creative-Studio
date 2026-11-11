"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/data/siteConfig";
import {
  businessTypes,
  needs as deliverablesList,
  channels,
  type ContactFormValues,
} from "@/data/contact";
import { Clapper } from "./clapper";
import { SlateHeader } from "./slate-header";
import { ChannelList } from "./channel-list";
import { ContactForm } from "./contact-form";
import { SuccessWrap } from "./success-wrap";

interface ContactSectionProps {
  kicker?: string;
  heading?: string;
  subline?: string;
  serviceAreaNote?: string;
}

export function ContactSection({
  kicker = "say hello",
  heading = "Let's grow your brand.",
  subline = "Your business could be our next success story. Call 83004 78244 or send your brief below.",
  serviceAreaNote = "Serving businesses across Thoothukudi, Tirunelveli, and Tamil Nadu.",
}: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const prefersReduced = useReducedMotion();
  const reducedMotion = prefersReduced || false;

  // Clapper & Slate State
  const [isShut, setIsShut] = useState(false);
  const [takeCount, setTakeCount] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [currentTimecode, setCurrentTimecode] = useState("00:00:00:00");
  const [frozenTimecode, setFrozenTimecode] = useState<string | undefined>(undefined);

  // Live Slate Sync from Form
  const [formValues, setFormValues] = useState<Partial<ContactFormValues>>({
    businessType: "restaurant",
    needs: ["instagram"],
  });

  // Derived codes for slate
  const selectedTypeObj = businessTypes.find((b) => b.id === formValues.businessType);
  const sceneCode = selectedTypeObj ? selectedTypeObj.sceneCode : "01";
  const businessTypeLabel = selectedTypeObj ? selectedTypeObj.label : undefined;

  const firstNeedId = formValues.needs && formValues.needs[0];
  const selectedNeedObj = deliverablesList.find((d) => d.id === firstNeedId);
  const rollCode = selectedNeedObj ? selectedNeedObj.rollCode : "A01";

  // Playful audio clapper sound
  const playClapSound = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio fallback
    }
  }, []);

  const handleFormValuesChange = useCallback((vals: Partial<ContactFormValues>) => {
    setFormValues(vals);
  }, []);

  const handleSubmitSuccess = (tc?: string) => {
    // 1. Snap clapper shut
    setIsShut(true);
    playClapSound();

    // 2. Freeze timecode
    const finalTc = tc || currentTimecode;
    setFrozenTimecode(finalTc);

    // 3. Flash & screen shake
    if (!reducedMotion) {
      setIsFlashing(true);
      setIsShaking(true);
      setTimeout(() => setIsFlashing(false), 260);
      setTimeout(() => setIsShaking(false), 300);
    }

    // 4. Show success state
    setTimeout(() => {
      setIsSubmitted(true);
    }, 450);
  };

  const handleResetForm = () => {
    // Reopen clapper arm and increment take count
    setIsShut(false);
    setIsSubmitted(false);
    setFrozenTimecode(undefined);
    setTakeCount((prev) => prev + 1);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-heading"
      className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0B0B0F] text-[#F4F1EA]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Unified Clapperboard Wrapper */}
        <div className="w-full flex flex-col">
          {/* Top Movable Clapper Arm and Bar */}
          <Clapper
            isShut={isShut}
            reducedMotion={reducedMotion}
            onPlayfulSnap={playClapSound}
          />

          {/* Clapperboard Slate Body */}
          <motion.div
            initial={reducedMotion ? false : { y: 20, opacity: 0 }}
            animate={
              isInView
                ? isShaking && !reducedMotion
                  ? { y: [0, -2, 2, -1, 1, 0], opacity: 1 }
                  : { y: 0, opacity: 1 }
                : { y: 20, opacity: 0 }
            }
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-full rounded-b-xl border border-[#2A2A30] bg-[#141419] p-5 sm:p-8 md:p-10 shadow-[0_24px_64px_rgba(0,0,0,0.85)] overflow-hidden"
          >
            {/* L-shaped Lime Corner Brackets */}
            <motion.div
              initial={reducedMotion ? false : { scale: 1.15, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 1.15, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute inset-0 pointer-events-none select-none z-10"
              aria-hidden="true"
            >
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#C6FF3D]" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#C6FF3D]" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#C6FF3D]" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#C6FF3D]" />
            </motion.div>

            {/* Subtle SVG Film Grain Overlay (4% opacity) */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"
              aria-hidden="true"
            />

            {/* White Flash Overlay on Submit */}
            <AnimatePresence>
              {isFlashing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.65 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 bg-white z-30 pointer-events-none"
                  aria-hidden="true"
                />
              )}
            </AnimatePresence>

            {/* Slate Header Row */}
            <SlateHeader
              businessName={formValues.businessName}
              businessTypeLabel={businessTypeLabel}
              sceneCode={sceneCode}
              rollCode={rollCode}
              takeCount={takeCount}
              isSubmitting={isShut && !isSubmitted}
              isFrozen={Boolean(frozenTimecode)}
              frozenTimecode={frozenTimecode}
              onTimecodeUpdate={setCurrentTimecode}
              reducedMotion={reducedMotion}
            />

            {/* Main Slate Two-Column Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
              {/* Left Column: Eyebrow, Heading, and Channels (Sticky on Desktop) */}
              <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-[15vh]">

                <div>
                  <p className="font-mono text-xs text-[#C6FF3D] uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF3D]" />
                    {kicker}
                  </p>
                  <h2
                    id="contact-heading"
                    className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F4F1EA] font-display leading-[0.95]"
                  >
                    {heading}
                  </h2>
                  <p className="mt-3 text-sm text-[#A9A7A0] leading-relaxed max-w-md">
                    {subline}
                  </p>
                </div>

                {/* Channels list with hover hairlines and copy buttons */}
                <ChannelList channels={channels} reducedMotion={reducedMotion} />

                {/* Service Area Note */}
                <p className="text-xs font-mono text-[#A9A7A0]/60 leading-relaxed mt-2">
                  {serviceAreaNote}
                </p>
              </div>

              {/* Right Column: Interactive Contact Form or SuccessWrap State */}
              <div className="lg:col-span-7">
                {/* Mobile Quick Direct Contact Actions */}
                <div className="md:hidden flex items-center gap-2 mb-5 font-mono select-none">
                  <a
                    href="tel:8300478244"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-[#2A2A30] bg-[#141419] text-xs text-[#F4F1EA] hover:border-[#C6FF3D] font-bold active:scale-95 transition-all"
                  >
                    <span>📞</span>
                    <span>CALL DIRECT</span>
                  </a>
                  <a
                    href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2027%20Creative%20Studio%2C%20I%20would%20like%20to%20grow%20my%20brand.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-[#C6FF3D] bg-[#C6FF3D] text-xs !text-[#0B0B0F] font-black active:scale-95 transition-all shadow-sm"
                  >
                    <span>💬</span>
                    <span>WHATSAPP</span>
                  </a>
                </div>

                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <SuccessWrap
                      key="success"
                      confirmationTimecode={frozenTimecode}
                      onReset={handleResetForm}
                      reducedMotion={reducedMotion}
                    />
                  ) : (
                    <motion.div
                      key="form"
                      initial={reducedMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reducedMotion ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ContactForm
                        onFormValuesChange={handleFormValuesChange}
                        onSubmitSuccess={handleSubmitSuccess}
                        currentTimecode={currentTimecode}
                        reducedMotion={reducedMotion}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
