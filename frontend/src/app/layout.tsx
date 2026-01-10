import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Nunito, Fredoka } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "@/components/Navigation";

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
        <body suppressHydrationWarning>
          <Script
            id="chakra-color-mode"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var mode = localStorage.getItem('chakra-ui-color-mode') || 'dark';
                    document.documentElement.setAttribute('data-theme', mode);
                    document.documentElement.style.colorScheme = mode;
                    document.body.className = 'chakra-ui-' + mode;
                  } catch (e) {}
                })();
              `,
            }}
          />
          <Providers>
            <Navigation />
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
