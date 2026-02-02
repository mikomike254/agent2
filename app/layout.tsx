import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CREATIVE.KE | Premium Tech Marketplace & Escrow",
  description: "Kenya's most powerful agency production engine. Secure escrow, verified developers, and high-trust project management for startups and enterprise.",
  keywords: ["tech marketplace", "kenya", "software development", "escrow", "verified developers", "milestone payments", "mpesa payments"],
  manifest: "/manifest.json",
  themeColor: "#5347CE",
  openGraph: {
    title: "CREATIVE.KE | High-Trust Tech Marketplace",
    description: "Build secure development projects with 43% deposit and 110% refund guarantee.",
    url: "https://creative.ke",
    siteName: "CREATIVE.KE",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CREATIVE.KE | Premium Tech Marketplace",
    description: "The most secure way to build software in East Africa.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased bg-[var(--bg-app)] text-[var(--text-primary)]`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
