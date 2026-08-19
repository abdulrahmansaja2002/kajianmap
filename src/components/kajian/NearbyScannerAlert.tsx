import { Loader2, MapPin, SearchX, AlertCircle, X } from "lucide-react";
import { ScannerStatus } from "@/hooks/useNearbyKajian";
import { Button } from "@/components/ui/button";

interface NearbyScannerProps {
  status: ScannerStatus;
  nearbyLocations: any[]; 
  onShowDetail?: (locationId: string) => void;
  onClose?: () => void; 
}

export function NearbyScannerAlert({ status, nearbyLocations, onShowDetail, onClose }: NearbyScannerProps) {
  if (status === "idle") return null;

  // Hitung angka jarak dengan aman
  const rawDistance = nearbyLocations?.[0]?.distance;
  const formattedDistance = typeof rawDistance === "number" ? rawDistance.toFixed(1) : "0.0";

  return (
    <div className="relative flex w-[90vw] max-w-[340px] sm:max-w-[380px] flex-col items-center justify-center gap-3 rounded-2xl border border-white/20 bg-black/65 p-5 sm:p-6 text-center text-white shadow-2xl backdrop-blur-md transition-all duration-300">
      
      {/* Tombol X (Close) di dalam box */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/20 hover:text-white active:scale-95"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* 1. STATUS: SCANNING */}
      {status === "scanning" && (
        <>
          <Loader2 className="mb-1 h-12 w-12 animate-spin text-yellow-400"/>
          <p className="font-display text-base font-bold leading-snug">Bismillah...</p>
          <p className="text-sm leading-relaxed text-slate-300">
            Sedang memindai majelis ilmu di sekitar Anda...
          </p>
          <div className="mt-1 rounded-xl bg-white/5 p-2.5 text-[11px] leading-relaxed text-slate-300 border border-white/10">
            <p className="italic">
              {'"Jika kalian melewati taman-taman surga, singgahlah." Para sahabat bertanya: "Apakah taman-taman surga itu?" Beliau menjawab: "Halaqah-halaqah dzikir / majelis ilmu."'}
            </p>
            <span className="block mt-1 font-semibold not-italic text-yellow-400/90">
              (HR. Tirmidzi no. 3510, Dihasankan oleh Syaikh Al-Albani)
            </span>
          </div>
        </>
      )}

      {/* 2. STATUS: FOUND */}
      {status === "found" && nearbyLocations && nearbyLocations.length > 0 && (
        <>
          <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <MapPin className="h-8 w-8 animate-bounce"/>
          </div>
          <p className="text-[15px] font-bold text-emerald-400">Alhamdulillah, majelis ilmu ditemukan!</p>
          <p className="text-sm text-slate-200">
            <span className="font-semibold text-white">{nearbyLocations[0]?.name}</span> berjarak sekitar <span className="font-bold text-emerald-400">{formattedDistance} km</span>.
          </p>
          
          <div className="mt-1 rounded-xl bg-white/5 p-2.5 text-[11px] leading-relaxed text-slate-300 border border-white/10">
            <p className="italic">
              {'"Barangsiapa menempuh suatu jalan untuk menuntut ilmu, maka Allah mudahkan baginya jalan menuju surga."'}
            </p>
            <span className="block mt-1 font-semibold not-italic text-emerald-400/90">
              (HR. Muslim no. 2699)
            </span>
          </div>

          <Button 
            className="mt-2 w-full rounded-xl bg-emerald-600 font-semibold hover:bg-emerald-700" 
            size="sm"
            onClick={() => onShowDetail?.(nearbyLocations[0]?.id)} 
          >
            Lihat Detail Kajian
          </Button>
        </>
      )}

      {/* 3. STATUS: EMPTY */}
      {status === "empty" && (
        <>
          <SearchX className="mb-1 h-12 w-12 text-slate-400"/>
          <p className="text-[15px] font-bold text-slate-200">{"Qaddarallah wa maa sya'a fa'al"}</p>
          <p className="text-sm leading-relaxed text-slate-300">
            Belum ada jadwal majelis ilmu terdekat (radius 10 km) saat ini.
          </p>
          <div className="mt-1 rounded-xl bg-white/5 p-2.5 text-[11px] leading-relaxed text-slate-300 border border-white/10">
            <p className="italic">
              {'"Allah telah mentakdirkan penggarisan-Nya, dan apa yang Dia kehendaki pasti terjadi."'}
            </p>
            <span className="block mt-1 font-semibold not-italic text-slate-400">
              (HR. Muslim no. 2664)
            </span>
          </div>
        </>
      )}

      {/* 4. STATUS: ERROR */}
      {status === "error" && (
        <>
          <AlertCircle className="mb-1 h-12 w-12 text-amber-400"/>
          <p className="text-[15px] font-bold text-amber-400">{"Alhamdulillah 'alaa kulli haal"}</p>
          <p className="text-sm leading-relaxed text-slate-300">
            Qadarullah, akses lokasi Anda belum diizinkan. Mohon aktifkan izin lokasi agar dapat mencari majelis terdekat.
          </p>
          <div className="mt-1 rounded-xl bg-white/5 p-2.5 text-[11px] leading-relaxed text-slate-300 border border-white/10">
            <p className="italic">
              {'"Segala puji bagi Allah dalam setiap keadaan."'}
            </p>
            <span className="block mt-1 font-semibold not-italic text-amber-400/90">
              (HR. Ibnu Majah no. 3803, Dihasankan oleh Syaikh Al-Albani)
            </span>
          </div>
        </>
      )}
      
    </div>
  );
}