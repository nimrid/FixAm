import ServiceWorkerRegister from "./sw-register";

export const viewport = {
  themeColor: "#047857",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
