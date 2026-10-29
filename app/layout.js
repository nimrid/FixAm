export const viewport = {
  themeColor: "#0b4a32",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export const metadata = {
  title: "FixAm - Snap it, fix am",
  description: "AI repair guide for Nigeria: generator, okada, solar, phone & car. Photo + Pidgin voice, powered by Meta Muse + SAM.",
  manifest: "/manifest.json",
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  );
}
