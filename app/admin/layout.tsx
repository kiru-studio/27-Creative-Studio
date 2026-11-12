import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Site Editor // Admin Control',
  description: 'Admin content manager for 27 Creative Studio.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
