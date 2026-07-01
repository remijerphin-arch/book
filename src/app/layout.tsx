import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { BookProvider } from "../context/BookContext";
import { CinematicBackground } from "../components/CinematicBackground";
import { AmbientAudio } from "../components/AmbientAudio";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#070708",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Unnamed Feels — An Interactive Digital Book",
  description: "Some feelings are never spoken. Some stories are never named. Experience the premium interactive novel 'Unnamed Feels' by JR.",
  keywords: ["Unnamed Feels", "Unnamed Feelings", "JR", "poetry", "novel", "interactive novel", "love stories", "modern book"],
  authors: [{ name: "JR" }],
  metadataBase: new URL("https://unnamedfeels.vercel.app"),
  openGraph: {
    title: "Unnamed Feels — An Interactive Digital Book",
    description: "Some feelings are never spoken. Some stories are never named. Experience the premium interactive novel 'Unnamed Feels' by JR.",
    type: "website",
    locale: "en_US",
    siteName: "Unnamed Feels",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Unnamed Feels Cover - Sometimes, the loudest feelings are the ones left unsaid",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unnamed Feels — An Interactive Digital Book",
    description: "Some feelings are never spoken. Some stories are never named. Experience 'Unnamed Feels' by JR.",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full antialiased`}>
      <body className="font-sans min-h-full flex flex-col selection:bg-amber-200/30 selection:text-amber-200">
        <BookProvider>
          {/* Headless components running globally */}
          <CinematicBackground />
          <AmbientAudio />
          <div className="relative z-0 flex flex-col flex-1 min-h-screen">
            {children}
          </div>
        </BookProvider>
      </body>
    </html>
  );
}
