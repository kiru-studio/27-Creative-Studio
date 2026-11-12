import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '27 Creative Studio',
    short_name: '27 Studio',
    description: 'Instagram growth and local visibility for Thoothukudi businesses.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0B0F',
    theme_color: '#0B0B0F',
    icons: [
      {
        src: '/icon-dark-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
