import type { Metadata } from "next";
// import { Outfit } from "next/font/google"; // Premium, clean sans-serif
import "./globals.css";
import { Providers } from "./providers";

// const outfit = Outfit({
//   subsets: ["latin"],
//   variable: "--font-outfit",
//   display: "swap",
// });

export const metadata: Metadata = {
  title: "creative.ke | Premier Tech Talent Marketplace",
  description: "Securely hire verified developers in Kenya & East Africa. Escrow protection, 110% refund guarantee.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased bg-[var(--bg-app)] text-[var(--text-primary)]`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
