import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://frogface.space";
const SITE_TITLE = "Frogface — Life OS";
const SITE_DESC = "Персональная операционная система жизни. AI-агенты, RPG-движок, контент-конвейер, голосовое управление.";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: "%s | Frogface",
  },
  description: SITE_DESC,
  manifest: "/manifest.json",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "Frogface",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Frogface Life OS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Frogface",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Frogface Life OS",
  url: SITE_URL,
  description: SITE_DESC,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  author: {
    "@type": "Person",
    name: "Sergey Orlov",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "RUB",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js"))`,
          }}
        />
      </body>
    </html>
  );
}
