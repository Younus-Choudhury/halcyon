import type { Metadata, Viewport } from "next";
import { Archivo, Bodoni_Moda } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
});

export const metadata: Metadata = {
  title: "Halcyon — a holiday desk",
  description:
    "Four questions about how you like a holiday, then three British Airways Holidays places and a reason for each.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${bodoni.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-white text-[#111]">{children}</body>
    </html>
  );
}
