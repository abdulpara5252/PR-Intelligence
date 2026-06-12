import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";

import { Sidebar } from "@/components/layout/Sidebar";
import { Providers } from "@/components/providers/Providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PR Intelligence",
  description: "Developer dashboard for PR quality metrics and team performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          <div className="flex min-h-screen w-full">
            <Sidebar />
            <main className="min-w-0 flex-1 overflow-auto px-6 py-8 lg:px-10">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
