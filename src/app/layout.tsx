import type { Metadata,Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "PathPicsTales",
  description: "PathPicsTales - Twoje trasy, zdjęcia i opowieści",
};
export const viewport: Viewport = {
  themeColor: "#bbf451",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-lime-300 text-blue-950 `}
      >
        {children}
      </body>
    </html>
  );
}
