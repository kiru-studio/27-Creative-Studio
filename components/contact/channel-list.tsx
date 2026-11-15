"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ContactChannel } from "@/data/contact";

interface ChannelListProps {
  channels: ContactChannel[];
  reducedMotion?: boolean;
}

export function ChannelList({ channels, reducedMotion = false }: ChannelListProps) {
  return (
    <div className="flex flex-col w-full mt-6" role="list" aria-label="Direct contact channels">
      {channels.map((ch, idx) => (
        <div key={ch.id} className="relative group" role="listitem">
          {/* Hairline Divider above that turns lime on hover */}
          <div className="w-full h-[1px] bg-[#FF2DA8] group-hover:bg-[#D4FF3F] transition-colors duration-300" />

          {/* Row container with x: 6px shift on hover */}
          <motion.div
            className="flex items-center justify-between py-3 px-1 transition-colors duration-200"
            whileHover={reducedMotion ? undefined : { x: 6 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
            <a
              href={ch.href}
              target={ch.id === "email" ? undefined : "_blank"}
              rel={ch.id === "email" ? undefined : "noreferrer"}
              className="flex items-center justify-between w-full text-sm text-[#D4FF3F] group-hover:text-[#D4FF3F] transition-colors min-h-[36px]"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="font-mono text-[11px] sm:text-xs text-[#D4FF3F] uppercase min-w-[78px] sm:min-w-[84px] shrink-0">
                  {ch.label}
                </span>
                <span className="font-mono text-xs sm:text-sm font-medium truncate text-[#D4FF3F] group-hover:text-[#D4FF3F] transition-colors">
                  {ch.value}
                </span>
              </div>
              <ArrowUpRight
                size={16}
                className="shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#D4FF3F]"
                aria-hidden="true"
              />
            </a>
          </motion.div>
        </div>
      ))}
      {/* Bottom closing hairline */}
      <div className="w-full h-[1px] bg-[#FF2DA8]" />
    </div>
  );
}
