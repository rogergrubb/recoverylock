import type { Metadata, Viewport } from "next";
import "./globals.css";

// ═══════════════════════════════════════════════════════════════════════════
// METADATA CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  // ─────────────────────────────────────────────────────────────────────────
  // PRIMARY SEO
  // ─────────────────────────────────────────────────────────────────────────
  title: "Recovery Lock - Block Your Phone Until You Check In | Sobriety & Recovery App",
  description:
    "Recovery Lock helps you stay accountable on your recovery journey. Block your phone until you complete daily check-ins. Track progress, connect with supporters, and build lasting sobriety habits.",
  keywords: [
    "recovery app",
    "sobriety tracker",
    "addiction recovery",
    "accountability app",
    "phone blocker",
    "daily check-in",
    "habit tracking",
    "mental health app",
    "support network",
    "wellness app",
    "sober living",
    "recovery journey",
    "AA",
    "12-step",
    "screen time",
  ],
  authors: [{ name: "Number One Son Software" }],
  creator: "Number One Son Software",
  publisher: "Number One Son Software",

  // ─────────────────────────────────────────────────────────────────────────
  // ROBOTS & INDEXING
  // ─────────────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CANONICAL & ALTERNATES
  // ─────────────────────────────────────────────────────────────────────────
  metadataBase: new URL("https://recoverylock.app"),
  alternates: {
    canonical: "https://recoverylock.app",
    languages: {
      "en-US": "https://recoverylock.app",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OPEN GRAPH (Facebook, LinkedIn, Discord, Slack)
  // ─────────────────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://recoverylock.app",
    siteName: "Recovery Lock",
    title: "Recovery Lock - Block Your Phone Until You Check In | Sobriety & Recovery App",
    description:
      "Recovery Lock helps you stay accountable on your recovery journey. Block your phone until you complete daily check-ins.",
    images: [
      {
        url: "https://recoverylock.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Recovery Lock - Sobriety and Accountability Made Simple",
        type: "image/png",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TWITTER CARD
  // ─────────────────────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@recoverylock",
    creator: "@recoverylock",
    title: "Recovery Lock - Block Your Phone Until You Check In | Sobriety & Recovery App",
    description:
      "Recovery Lock helps you stay accountable on your recovery journey. Block your phone until you complete daily check-ins.",
    images: ["https://recoverylock.app/og-image.png"],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ICONS & MANIFEST
  // ─────────────────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#FF6B00" }],
  },
  manifest: "/manifest.json",

  // ─────────────────────────────────────────────────────────────────────────
  // APP CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────
  applicationName: "Recovery Lock",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Recovery Lock",
  },
  formatDetection: {
    telephone: false,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY
  // ─────────────────────────────────────────────────────────────────────────
  category: "Health & Fitness",
};

// ═══════════════════════════════════════════════════════════════════════════
// VIEWPORT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF6B00" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// STRUCTURED DATA (JSON-LD)
// ═══════════════════════════════════════════════════════════════════════════

const jsonLd = {
  mobileApp: {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: "Recovery Lock",
    description:
      "Block your phone until you check in. The accountability app for sobriety and recovery.",
    url: "https://recoverylock.app",
    applicationCategory: "HealthApplication",
    operatingSystem: "iOS, Android",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "Number One Son Software",
    },
    featureList: [
      "Phone blocking until daily check-in",
      "Progress tracking and streaks",
      "Accountability partner connections",
      "Daily motivational content",
      "Private and secure",
    ],
  },
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Number One Son Software",
    url: "https://recoverylock.app",
    logo: "https://recoverylock.app/logo.png",
    sameAs: ["https://twitter.com/recoverylock"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@recoverylock.app",
    },
  },
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Recovery Lock",
    url: "https://recoverylock.app",
    description:
      "Block your phone until you check in. The accountability app for sobriety and recovery.",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ROOT LAYOUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect for fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.mobileApp) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.organization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.website) }}
        />
      </head>
      <body className="font-sans antialiased bg-white">
        <div className="max-w-md mx-auto min-h-screen">{children}</div>
      </body>
    </html>
  );
}
