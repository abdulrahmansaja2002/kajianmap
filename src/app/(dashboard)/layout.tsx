"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LandPlot, Menu, X, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/admin/jadwal", label: "Jadwal Saya" },
  { href: "/super-admin", label: "Overview" },
  { href: "/super-admin/locations", label: "Lokasi Masjid" },
  { href: "/super-admin/users", label: "Admin Masjid" },
];

const ADMIN_LINKS = [{ href: "/admin/jadwal", label: "Jadwal Saya" }];
const SUPER_ADMIN_LINKS = [
  { href: "/super-admin", label: "Overview" },
  { href: "/super-admin/locations", label: "Lokasi Masjid" },
  { href: "/super-admin/users", label: "Admin Masjid" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Every /admin/* and /super-admin/* page shares this layout, so guarding
  // here once covers all of them instead of repeating the check per page.
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace("/login");
    }
  }, [isAuthenticated, router, isLoading]);
  const handleLogout = () => {
    logout();
    router.push("/login");
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <p className="text-sm text-muted-foreground">Memuat halaman...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null; // redirecting
  }

  const navLinks = user.role === "super_admin" ? SUPER_ADMIN_LINKS : ADMIN_LINKS;

  return (
    <div className="flex h-full flex-col overflow-y-auto scroll-slim">
      <header className="relative flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6 z-20">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LandPlot className="h-4 w-4" />
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            Kajian<span className="text-primary-700">Map</span>{" "}
            <span className="hidden font-normal text-muted-foreground sm:inline-block">
              Dashboard
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
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
          <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-1">
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </Button>
        </nav>

        <button
          className="flex md:hidden items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 py-3 shadow-sm animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
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
            <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-1">
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </Button>
          </nav>
        </div>
      )}

      <main className="flex-1">{children}</main>
    </div>
  );
}