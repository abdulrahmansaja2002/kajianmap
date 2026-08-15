"use client";

import { List, Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileViewToggleProps {
  view: "map" | "list";
  onChange: (view: "map" | "list") => void;
}

/** Floating segmented control letting mobile users flip between the
 *  full-screen map and the scrollable list, per the mobile-first spec. */
export function MobileViewToggle({ view, onChange }: MobileViewToggleProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-400 flex justify-center md:hidden">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-card/95 p-1 shadow-raised backdrop-blur-sm">
        <button
          onClick={() => onChange("map")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            view === "map"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          )}
        >
          <MapIcon className="h-4 w-4" />
          Peta
        </button>
        <button
          onClick={() => onChange("list")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            view === "list"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          )}
        >
          <List className="h-4 w-4" />
          Daftar
        </button>
      </div>
    </div>
  );
}
