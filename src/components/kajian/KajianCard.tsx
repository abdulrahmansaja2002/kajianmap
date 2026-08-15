import { Clock, User } from "lucide-react";
import type { Kajian } from "@/types";
import { occursToday, scheduleWithTimeLabel } from "@/lib/date-helpers";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KajianCardProps {
  kajian: Kajian;
  /** Denser layout for use inside popups / narrow list rows. */
  compact?: boolean;
  className?: string;
}

/** Deterministic gradient fallback for kajian without a poster image, so
 *  every card still has a visual anchor without relying on stock photos. */
function posterGradient(seed: string) {
  const gradients = [
    "from-primary-700 to-primary-500",
    "from-sage-700 to-sage-400",
    "from-primary-800 to-sage-500",
    "from-slate-700 to-primary-600",
  ];
  const idx =
    seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradients.length;
  return gradients[idx];
}

export function KajianCard({ kajian, compact, className }: KajianCardProps) {
  const isToday = occursToday(kajian);

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-card",
        className
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-md bg-linear-to-br",
          posterGradient(kajian.id),
          compact ? "h-14 w-14" : "h-16 w-16"
        )}
      >
        {kajian.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={kajian.posterUrl}
            alt={`Poster ${kajian.title}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold text-white/90">
            {kajian.category.slice(0, 1)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 font-display text-sm font-semibold leading-snug text-foreground">
            {kajian.title}
          </p>
          {isToday && (
            <Badge variant="today" className="shrink-0">
              Hari ini
            </Badge>
          )}
        </div>

        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate">{kajian.ustadz}</span>
        </p>

        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-primary-700">
          <Clock className="h-3 w-3 shrink-0" />
          {scheduleWithTimeLabel(kajian)}
        </p>

        {!compact && (
          <Badge variant="sage" className="mt-2">
            {kajian.category}
          </Badge>
        )}
      </div>
    </div>
  );
}
