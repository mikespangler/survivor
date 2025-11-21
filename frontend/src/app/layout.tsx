import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "@/components/Navigation";

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
      <html lang="en">
        <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
          <Providers>
            <Navigation />
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
