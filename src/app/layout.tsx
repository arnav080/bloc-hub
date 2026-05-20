import type { Metadata } from "next";
import { Geist_Mono, Silkscreen, Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bloc Hub - Local AI Model Registry",
  description: "The Docker Hub for local AI models. Pull and run optimized LLMs instantly.",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "dark", geistMono.variable, silkscreen.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col bg-[#171616] text-white">
        <Providers>
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
