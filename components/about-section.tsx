"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TeamLanyardRail, type LanyardMember } from "@/components/ui/team-lanyard-rail";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import { siteContent } from "@/lib/site-content";

const lanyardPeople: LanyardMember[] = siteContent.people.map((person, index) => {
  const customTaglines = [
    "Shoots first. Sleeps later.",
    "Finds the audience before the algorithm does.",
    "Turns raw footage into stories people actually stop and watch.",
  ];
  const customSpecialties = [
    "Direction & High-Velocity Cinematography",
    "Growth Strategy & Conversion Funnels",
    "Editing, Filmic Color & Beat Sound Design",
  ];
  const customWorks = ["#films", "#cases", "#reels"];

  return {
    id: `person-${index}`,
    name: person.name,
    role: person.role,
    specialty: customSpecialties[index] ?? person.workLabel,
    tagline: customTaglines[index] ?? person.workLabel,
    featuredWork: customWorks[index] ?? "#work",
    team: `${siteContent.brand.name} ${siteContent.brand.descriptor}`,
    image: person.photoSrc ?? "",
    portrait: person.photoSrc ?? "",
    bio: person.bio,
    tags: [person.workLabel, person.stats ?? "ALL ACCESS"],
    gear: person.gear,
    signatureGear: person.gear,
    focalLength: person.focalLength,
    signatureAesthetic: person.focalLength,
    passId: person.passId ?? `27-PASS-0${index + 1}`,
    access: person.access ?? "ALL ACCESS // VIP",
    stats: person.stats,
    links: [
      {
        label: "WHATSAPP",
        href: `https://wa.me/${siteContent.contact.whatsappNumber}?text=${encodeURIComponent(
          `Hi 27 Creative Studio, I'd like to connect with ${person.name} regarding video production.`
        )}`,
      },
      {
        label: "INSTAGRAM",
        href: `https://instagram.com/${siteContent.contact.instagram.replace("@", "")}`,
      },
    ],
  };
});

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-8% 0px" });
  const shouldReduceMotion = useHydratedReducedMotion();
  const headingLines = siteContent.ui.aboutHeading.match(/[^.]+\./g) ?? [
    siteContent.ui.aboutHeading,
  ];

  return (
    <section
      className="about-section relative overflow-hidden py-20 sm:py-28"
      id="crew"
      ref={sectionRef}
      aria-labelledby="about-heading"
    >
      <div id="team" className="sr-only" />
      <div id="about" className="sr-only" />
      <div className="about-grain-overlay" aria-hidden="true" />

      <div className="about-copy relative z-10 max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-intro mb-10 sm:mb-14">
          <div className="overflow-mask-inline">
            <motion.div
              className="flex items-center gap-2 mb-3 select-none"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span
                className="w-2 h-2 rounded-full bg-[#C6FF3D] shadow-[0_0_8px_#C6FF3D] animate-pulse"
                aria-hidden="true"
              />
              <p className="kicker m-0">{siteContent.ui.aboutKicker}</p>
            </motion.div>
          </div>

          <h2
            id="about-heading"
            className="m-0 font-display font-black leading-tight text-4xl sm:text-5xl lg:text-6xl text-[var(--paper)] tracking-tight uppercase"
          >
            {headingLines.map((line, index) => (
              <span className="overflow-mask block" key={`${line}-${index}`}>
                <motion.span
                  className="block"
                  initial={
                    shouldReduceMotion
                      ? { y: 0, opacity: 1 }
                      : { y: "100%", opacity: 0 }
                  }
                  animate={
                    isInView
                      ? { y: 0, opacity: 1 }
                      : { y: "100%", opacity: 0 }
                  }
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.08 + index * 0.1,
                  }}
                >
                  {line.trim()}
                </motion.span>
              </span>
            ))}
          </h2>

          <div className="overflow-mask mt-3">
            <motion.p
              className="m-0 max-w-[50ch] text-base sm:text-lg text-[var(--muted)] leading-relaxed font-body"
              initial={
                shouldReduceMotion ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }
              }
              animate={isInView ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.28,
              }}
            >
              {siteContent.ui.aboutIntro}
            </motion.p>
          </div>
        </div>
      </div>

      <TeamLanyardRail
        className="team-lanyard-fullbleed relative z-10"
        items={lanyardPeople}
      />
    </section>
  );
}

export default AboutSection;
