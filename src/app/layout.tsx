import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KajianMap — Temukan Kajian Islami di Sekitarmu",
  description:
    "Platform peta interaktif untuk menemukan jadwal kajian Islami secara real-time di daerahmu.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0D6350",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="h-dvh overflow-hidden bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
