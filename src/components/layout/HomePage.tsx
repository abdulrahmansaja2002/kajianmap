"use client";
import { useState, useEffect } from "react";
import { BookOpen, User } from "lucide-react"; 
import { SplashScreen } from "@/components/layout/SplashScreen";

const SLIDES = [
  {
    image: "/pictures_home/kartun_1.png", 
    text: "Tetap semangat, terus perbaiki diri! KajianMap hadir sebagai teman perjalanan terpercaya yang siap memandumu menemukan lokasi kajian dan majelis ilmu terbaru dengan mudah."
  },
  {
    image: "/pictures_home/kartun_2.png", 
    text: "Luruskan niat, temukan arahmu! KajianMap hadir sebagai kompas andalan untuk melacak jadwal dan titik lokasi kajian Islami paling akurat, menuntun perjalanan hijrahmu."
  },
  {
    image: "/pictures_home/kartun_3.png", 
    text: "Jemput hidayah, temukan majelisnya! KajianMap hadir sebagai solusi peta interaktif terpercaya untuk info lokasi kajian Islami terbaru di kotamu."
  }
];

export function HomePage({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!showLanding || showSplash) return; 
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4800); 

    return () => clearInterval(interval);
  }, [showLanding, showSplash]);


  useEffect(() => {
    const handleReset = () => {
      setShowLanding(true);
    };

    window.addEventListener("resetHomePage", handleReset);
    return () => window.removeEventListener("resetHomePage", handleReset);
  }, []);

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-background">
      
      {children}

      {showLanding && (
        <div className="absolute inset-0 z-[50] flex flex-col bg-gradient-to-b from-white to-slate-50/50 overflow-y-auto">
          
          <header className="flex w-full items-center justify-between px-6 py-6 md:px-12 lg:px-20">
            <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-emerald-800 drop-shadow-sm select-none">
              Ahlan wa Sahlan
            </h1>
            <div className="flex items-center gap-3 text-emerald-600">
              <button className="rounded-full p-2.5 hover:bg-emerald-50 hover:text-emerald-700 transition-all active:scale-95">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button className="rounded-full p-2.5 hover:bg-emerald-50 hover:text-emerald-700 transition-all active:scale-95">
                <User className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </header>

          <div className="flex flex-1 flex-col items-center justify-center px-6 md:flex-row md:px-12 lg:px-24">
            
            <div className="flex w-full justify-center md:w-1/2">
              {/* Ditambahkan select-none dan pointer-events-none agar tombol IDM / blokir gambar tidak muncul */}
              <div className="relative h-64 w-64 sm:h-80 sm:w-80 lg:h-[420px] lg:w-[420px] select-none pointer-events-none">
                {SLIDES.map((slide, index) => (
                  <img
                    key={index}
                    src={slide.image}
                    alt="Karikatur KajianMap"
                    className={`absolute inset-0 h-full w-full object-contain drop-shadow-[0_20px_30px_rgba(4,120,87,0.15)] transition-all duration-1000 ease-out ${
                      index === currentIndex 
                        ? "opacity-100 scale-100 translate-y-0" 
                        : "opacity-0 scale-95 translate-y-4" 
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-2 sm:mt-10 flex w-full flex-col items-center text-center md:mt-0 md:w-1/2 md:items-start md:text-left">
              {/* Ditambahkan select-none agar teks tidak bisa diblok */}
              <div className="relative min-h-[140px] w-full select-none">
                {SLIDES.map((slide, index) => (
                  <p
                    key={index}
                    className={`absolute inset-0 text-[14px] sm:text-[15px] md:text-lg lg:text-xl font-medium sm:font-light leading-relaxed sm:leading-loose text-emerald-800 transition-all duration-1000 ease-out ${
                      index === currentIndex 
                        ? "opacity-100 translate-x-0" 
                        : "opacity-0 translate-x-4 pointer-events-none"
                    }`}
                  >
                    {slide.text.split("KajianMap").map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i !== arr.length - 1 && <span className="font-bold tracking-wide text-emerald-900">KajianMap</span>}
                      </span>
                    ))}
                  </p>
                ))}
              </div>

              <div className="mt-6 sm:mt-8 mb-8 sm:mb-10 flex gap-2.5">
                {SLIDES.map((_, index) => (
                  <div 
                    key={index} 
                    className={`h-1.5 rounded-full shadow-sm transition-all duration-700 ease-out ${
                      index === currentIndex ? "w-10 bg-emerald-600 shadow-emerald-500/40" : "w-2.5 bg-emerald-100"
                    }`}
                  />
                ))}
              </div>

              <button 
                onClick={() => setShowLanding(false)} 
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-9 py-4 font-bold tracking-wide text-white shadow-[0_8px_30px_rgb(4,120,87,0.3)] ring-1 ring-emerald-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgb(4,120,87,0.5)] active:translate-y-0 active:scale-95 select-none"
              >
                Bismillah, Mulai
              </button>
            </div>
            
          </div>
        </div>
      )}

      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      
    </main>
  );
}