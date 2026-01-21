import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recovery Lock - Block Your Phone Until You Check In",
  description: "Turn screen time into recovery time. The #1 habit app for people in recovery.",
  keywords: "recovery, sobriety, AA, 12-step, screen time, addiction recovery, sober app",
  openGraph: {
    title: "Recovery Lock",
    description: "Block your phone until you check in with your recovery",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Recovery Lock",
    description: "Block your phone until you check in with your recovery",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Recovery Lock",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF6B00",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-white">
        <div className="max-w-md mx-auto min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
