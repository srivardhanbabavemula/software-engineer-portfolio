import { Geist, Geist_Mono, Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/ui/Cursor";
import { SITE_URL } from '@/lib/siteConfig';
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const description =
  'Software Engineer with 3+ years progressing from Python/SQL applications into backend services, cloud workflows, data systems, and AI-enabled software. MS Data Science @ University at Buffalo.';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#faf8f4',
}

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Srivardhan Vemula | Software Engineer',
    template: '%s | Srivardhan Vemula',
  },
  description,
  keywords: [
    'Srivardhan Vemula',
    'Software Engineer',
    'Data Engineer',
    'Machine Learning Engineer',
    'Python Developer',
    'PySpark',
    'AWS',
    'Azure',
    'Buffalo NY',
  ],
  authors: [{ name: 'Srivardhan Baba Vemula', url: SITE_URL }],
  creator: 'Srivardhan Baba Vemula',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Srivardhan Vemula',
    title: 'Srivardhan Vemula | Software Engineer',
    description,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Srivardhan Vemula | Software Engineer Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Srivardhan Vemula | Software Engineer',
    description,
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicons/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicons/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/favicons/apple-touch-icon.png' },
      { url: '/favicons/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/favicons/manifest.webmanifest',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${serif.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${serif.variable} h-full antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Srivardhan Baba Vemula',
              url: SITE_URL,
              email: 'srivardhanbaba@gmail.com',
              jobTitle: 'Software Engineer',
              sameAs: [
                'https://github.com/srivardhanbabavemula',
                'https://linkedin.com/in/srivardhan-baba-vemula',
                'https://public.tableau.com/app/profile/srivardhan.baba.vemula/vizzes',
              ],
            }),
          }}
        />
        <Cursor />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
