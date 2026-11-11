"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  businessTypes,
  channels,
  needs as deliverables,
  type ContactFormValues,
} from "@/data/contact";
import { siteContent } from "@/lib/site-content";
import { ChannelList } from "./channel-list";
import { Clapper } from "./clapper";
import { ContactForm } from "./contact-form";
import { SlateHeader } from "./slate-header";
import { SuccessWrap } from "./success-wrap";

interface ContactSectionProps {
  kicker?: string;
  heading?: string;
  subline?: string;
  serviceAreaNote?: string;
}

export function ContactSection({
  kicker = siteContent.contact.kicker,
  heading = siteContent.contact.heading,
  subline = siteContent.contact.body,
  serviceAreaNote = siteContent.contact.serviceArea,
}: ContactSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const [isShut, setIsShut] = useState(false);
  const [takeCount, setTakeCount] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentTimecode, setCurrentTimecode] = useState("00:00:00:00");
  const [frozenTimecode, setFrozenTimecode] = useState<string>();
  const [formValues, setFormValues] = useState<Partial<ContactFormValues>>({
    needs: ["reels"],
  });

  const selectedBusiness = businessTypes.find(
    (business) => business.id === formValues.businessType,
  );
  const selectedDeliverable = deliverables.find(
    (item) => item.id === formValues.needs?.[0],
  );

  const handleFormValuesChange = useCallback(
    (values: Partial<ContactFormValues>) => setFormValues(values),
    [],
  );

  const handleSubmitSuccess = (timecode?: string) => {
    setIsShut(true);
    setFrozenTimecode(timecode ?? currentTimecode);
    setIsSubmitted(true);
  };

  const handleResetForm = () => {
    setIsShut(false);
    setIsSubmitted(false);
    setFrozenTimecode(undefined);
    setTakeCount((count) => count + 1);
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="contact-section"
    >
      <div className="clapperboard-wrapper">
        <Clapper isShut={isShut} reducedMotion={reducedMotion} />

        <div className="clapperboard-body">
          <SlateHeader
            businessName={formValues.businessName}
            businessTypeLabel={selectedBusiness?.label}
            sceneCode={selectedBusiness?.sceneCode ?? "01"}
            rollCode={selectedDeliverable?.rollCode ?? "R01"}
            takeCount={takeCount}
            isSubmitting={isShut && !isSubmitted}
            isFrozen={Boolean(frozenTimecode)}
            frozenTimecode={frozenTimecode}
            onTimecodeUpdate={setCurrentTimecode}
            reducedMotion={reducedMotion}
          />

          <div className="clapper-board-content">
            <div className="clapper-copy">
              <p className="kicker">{kicker}</p>
              <h2 id="contact-heading">{heading}</h2>
              <p>{subline}</p>
              <ChannelList channels={channels} reducedMotion={reducedMotion} />
              <p className="contact-area">{serviceAreaNote}</p>
            </div>

            <div className="clapper-form-area">
              <AnimatePresence mode="wait" initial={false}>
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
                    initial={false}
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
        </div>
      </div>
    </section>
  );
}
