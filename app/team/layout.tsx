import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio Operations // CRM Hub',
  description: 'Operations hub, shoot calendar, client roster, and production pipeline for 27 Creative Studio.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
