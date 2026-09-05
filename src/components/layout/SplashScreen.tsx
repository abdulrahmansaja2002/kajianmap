"use client";
import { useEffect, useState } from "react";
// import Image from "next/image"; // Buka komentar ini nanti jika menggunakan Next.js Image

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Diperlama: Tahan splash screen selama 3.5 detik untuk menikmati animasi lompatan
    const timer = setTimeout(() => {
      setIsFading(true);
    }, 3500);

    // Hapus dari DOM layar setelah memudar penuh (total 4.2 detik)
    const removeTimer = setTimeout(() => {
      onFinish();
    }, 4200);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-700 ease-in-out ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Container Utama Animasi Lompat Tengah */}
      <div 
        className="flex flex-col items-center justify-center"
        style={{ animation: "jumpCenter 3.5s ease-in-out forwards" }}
      >
        
        {/* // ========================================================
          // --- TEMPLATE LOGO (Hapus tanda // jika logo sudah siap) ---
          //
          // <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full shadow-lg">
          //   <img 
          //     src="/path-ke-logo-anda.png" 
          //     alt="Logo KajianMap" 
          //     className="h-full w-full object-cover"
          //   />
          // </div>
          //
          // ========================================================
        */}

        {/* Teks Utama (Warna Hijau) */}
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-emerald-600 drop-shadow-sm">
          KajianMap
        </h1>
        
        {/* CSS Khusus Animasi Lompatan Vertikal (Atas-Bawah) */}
        <style>{`
          @keyframes jumpCenter {
            0% { 
              transform: translateY(0) scale(0.8); 
            }
            15% { 
              transform: translateY(-150px) scale(1); /* Lompatan pertama paling tinggi */
            }
            30% { 
              transform: translateY(0) scale(1.05); /* Mendarat */
            }
            45% { 
              transform: translateY(-25px) scale(1.1); /* Lompatan kedua sedang */
            }
            60% { 
              transform: translateY(0) scale(1.15); /* Mendarat */
            }
            75% { 
              transform: translateY(-10px) scale(1.2); /* Lompatan ketiga kecil */
            }
            90%, 120% { 
              transform: translateY(0) scale(1.2); /* Mendarat mantap dan diam hingga memudar */
            }
          }
        `}</style>
      </div>
    </div>
  );
}
