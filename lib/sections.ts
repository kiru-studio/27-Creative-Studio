/**
 * Canonical Section IDs for 27 Creative Studio
 * Used consistently across Header Nav, Mobile Menu, In-page links, and Footer
 */
export const SECTION_IDS = {
  work: "work",
  films: "films",
  process: "process",
  cases: "cases",
  packages: "packages",
  about: "about",
  faq: "faq",
  contact: "contact",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export const NAV_SECTIONS: { id: SectionId; label: string; href: string }[] = [
  { id: SECTION_IDS.work, label: "Work", href: `#${SECTION_IDS.work}` },
  { id: SECTION_IDS.films, label: "Films", href: `#${SECTION_IDS.films}` },
  { id: SECTION_IDS.process, label: "Process", href: `#${SECTION_IDS.process}` },
  { id: SECTION_IDS.cases, label: "Cases", href: `#${SECTION_IDS.cases}` },
  { id: SECTION_IDS.packages, label: "Packages", href: `#${SECTION_IDS.packages}` },
  { id: SECTION_IDS.about, label: "About", href: `#${SECTION_IDS.about}` },
  { id: SECTION_IDS.faq, label: "FAQ", href: `#${SECTION_IDS.faq}` },
  { id: SECTION_IDS.contact, label: "Contact", href: `#${SECTION_IDS.contact}` },
];
