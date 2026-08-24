"use client";

import { useState } from "react";
import Link from "next/link";
//  1: Tambahkan icon Menu dan X untuk tombol hamburger
import { LandPlot, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/admin/jadwal", label: "Jadwal Saya" },
  { href: "/super-admin", label: "Overview" },
  { href: "/super-admin/locations", label: "Lokasi Masjid" },
  { href: "/super-admin/users", label: "Admin Masjid" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //  2: State untuk mengontrol buka/tutup menu di HP
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-y-auto scroll-slim">
      <header className="relative flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6 z-20">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LandPlot className="h-4 w-4" />
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            Kajian<span className="text-primary-700">Map</span>{" "}
            {/*  3: Sembunyikan teks "Dashboard" di HP agar tidak makan tempat */}
            <span className="hidden font-normal text-muted-foreground sm:inline-block">
              Dashboard
            </span>
          </span>
        </Link>

        {/*  4: Navigasi Desktop (Sembunyikan di layar kecil dengan 'hidden md:flex') */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/"
            className="ml-1 whitespace-nowrap rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Lihat Peta
          </Link>
        </nav>

        {/*  5: Tombol Hamburger Menu khusus untuk HP ('flex md:hidden') */}
        <button
          className="flex md:hidden items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/*  6: Dropdown Menu yang muncul saat tombol hamburger ditekan */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 py-3 shadow-sm animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)} // Tutup menu setelah diklik
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)} // Tutup menu setelah diklik
              className="mt-2 rounded-md border border-input px-3 py-2.5 text-center text-sm font-medium text-foreground hover:bg-secondary"
            >
              Lihat Peta
            </Link>
          </nav>
        </div>
      )}

      <main className="flex-1">{children}</main>
    </div>
  );
}