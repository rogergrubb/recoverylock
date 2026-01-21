import './globals.css'

export const metadata = {
  title: 'Recovery Lock - Block Your Phone Until You Check In',
  description: 'Turn screen time into recovery time. The #1 habit app for people in recovery.',
  keywords: 'recovery, sobriety, AA, 12-step, screen time, addiction recovery, sober app',
  openGraph: {
    title: 'Recovery Lock',
    description: 'Block your phone until you check in with your recovery',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#FF6B00" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
