import Link from "next/link";
import { LandPlot } from "lucide-react";

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
  return (
    <div className="flex h-full flex-col overflow-y-auto scroll-slim">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LandPlot className="h-4 w-4" />
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            Kajian<span className="text-primary-700">Map</span>{" "}
            <span className="font-normal text-muted-foreground">Dashboard</span>
          </span>
        </Link>
        <nav className="scroll-slim flex items-center gap-1 overflow-x-auto">
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
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
