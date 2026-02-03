import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Nunito, Fredoka } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

// Google Fonts
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Survivor Fantasy League - Compete with Friends",
  description: "Create fantasy leagues, draft castaways, and compete with friends while watching Survivor. Track scores, manage teams, and crown your champion.",
  keywords: ["survivor", "fantasy league", "fantasy survivor", "reality tv", "competition"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${nunito.variable} ${fredoka.variable}`} suppressHydrationWarning>
        <head>
          <link
            rel="preload"
            as="image"
            href="https://res.cloudinary.com/dm2gfa9t8/image/upload/w_2560,q_auto,f_auto/hero-background"
            imageSrcSet="https://res.cloudinary.com/dm2gfa9t8/image/upload/w_768,q_auto,f_auto/hero-background 768w, https://res.cloudinary.com/dm2gfa9t8/image/upload/w_1280,q_auto,f_auto/hero-background 1280w, https://res.cloudinary.com/dm2gfa9t8/image/upload/w_2560,q_auto,f_auto/hero-background 2560w, https://res.cloudinary.com/dm2gfa9t8/image/upload/w_3840,q_auto,f_auto/hero-background 3840w"
            imageSizes="100vw"
            fetchPriority="high"
          />
        </head>
        <body suppressHydrationWarning>
          <Script
            id="chakra-color-mode"
            strategy="beforeInteractive"
            src="/color-mode-script.js"
          />
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
