import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ExternalLink, MapPin, Phone, User } from "lucide-react";
import { mockKajian, mockLocations } from "@/lib/mock-data";
import { occursToday, scheduleWithTimeLabel } from "@/lib/date-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { useKajianDetailQuery } from "@/hooks/queries/useKajian";

interface KajianDetailPageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return mockKajian.map((k) => ({ id: k.id }));
}

export default function KajianDetailPage({ params }: KajianDetailPageProps) {
  const { data, isLoading, isError } = useKajianDetailQuery(params.id);
  const kajian = mockKajian.find((k) => k.id === params.id);
  if (!kajian) notFound();

  const location = mockLocations.find((l) => l.id === kajian.locationId);
  const isToday = occursToday(kajian);
  const mapsUrl = location
    ? `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`
    : undefined;

  return (
    <div className="flex h-full flex-col overflow-y-auto scroll-slim">
      <Navbar />
      <div className="mx-auto w-full max-w-2xl p-5 sm:p-8">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke peta
        </Link>

        {isLoading && (
          <div className="flex items-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Memuat detail kajian…</span>
          </div>
        )}

        {isError && (
          <div className="py-16 text-center">
            <p className="font-display text-lg font-semibold">Kajian tidak ditemukan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Jadwal ini mungkin sudah dihapus atau tautannya salah.
            </p>
          </div>
        )}

        {data && (
          <>
            {data.kajian.posterUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.kajian.posterUrl}
                alt={`Poster ${data.kajian.title}`}
                className="mb-5 h-56 w-full rounded-xl object-cover"
              />
            )}

            <div className="flex items-start justify-between gap-3">
              <h1 className="font-display text-2xl font-bold leading-snug">
                {data.kajian.title}
              </h1>
              {occursToday(data.kajian) && (
                <Badge variant="today" className="shrink-0">
                  Hari ini
                </Badge>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {data.kajian.ustadz}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-primary-700">
                <Clock className="h-4 w-4" />
                {scheduleWithTimeLabel(data.kajian)}
              </span>
            </div>

            <Badge variant="sage" className="mt-3">
              {data.kajian.category}
            </Badge>

            <p className="mt-5 leading-relaxed text-foreground/90">{data.kajian.description}</p>

            <div className="mt-6 rounded-xl border border-border p-4">
              <p className="flex items-start gap-1.5 text-sm font-medium">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                {data.location.name}
              </p>
              <p className="mt-1 pl-6 text-sm text-muted-foreground">
                {data.location.address}, {data.location.city}
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${data.location.lat},${data.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Buka Navigasi Google Maps
                </a>
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>Kontak: {data.kajian.contactPerson}</span>
              {data.kajian.contactPhone && (
                <a
                  href={`tel:${data.kajian.contactPhone}`}
                  className="flex items-center gap-1 font-medium text-primary-700 hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {data.kajian.contactPhone}
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
  