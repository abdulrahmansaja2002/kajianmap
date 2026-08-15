import Link from "next/link";
import { LandPlot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-sm supports-backdrop-filter:bg-card/80 sm:px-6">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LandPlot className="h-4 w-4" />
        </span>
        <span className="font-display text-base font-bold tracking-tight text-foreground">
          Kajian<span className="text-primary-700">Map</span>
        </span>
      </Link>

      <nav className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
          <Link href="/login">Masuk Admin</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="sm:hidden">
          <Link href="/login">Masuk</Link>
        </Button>
      </nav>
    </header>
  );
}
