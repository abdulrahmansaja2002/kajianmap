'use client'
import { useState, useEffect } from "react";

/**
 * Device breakpoint detector (TailwindCSS default breakpoints)
 *
 * - mobile: < 640px
 * - tablet: >= 640px and < 1024px
 * - desktop: >= 1024px
 *
 * Returns:
 * {
 *   isMobile: boolean
 *   isTablet: boolean
 *   isDesktop: boolean
 *   breakpoint: "mobile" | "tablet" | "desktop"
 * }
 */
type Breakpoint = "mobile" | "tablet" | "desktop";
type MediaDeviceState = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint;
}
const useMediaDevice = () => {
  const [state, setState] = useState<MediaDeviceState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    breakpoint: "mobile" as Breakpoint,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Tailwind CSS breakpoints
    const mqMobile = window.matchMedia("(max-width: 639px)");
    const mqTablet = window.matchMedia("(min-width: 640px) and (max-width: 1023px)");
    const mqDesktop = window.matchMedia("(min-width: 1024px)");

    const update = () => {
      const isMobile = mqMobile.matches;
      const isTablet = mqTablet.matches;
      const isDesktop = mqDesktop.matches;

      setState({
        isMobile,
        isTablet,
        isDesktop,
        breakpoint: isDesktop ? "desktop" : isTablet ? "tablet" : "mobile",
      });
    };

    // Initial run
    update();

    // Add listeners (fallback for older browsers)
    const add = (mq: MediaQueryList, handler: (...args: any[]) => void) => {
      if (mq.addEventListener) mq.addEventListener("change", handler);
      else mq.addListener(handler);
    };

    const remove = (mq: MediaQueryList, handler: (...args: any[]) => void) => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };

    add(mqMobile, update);
    add(mqTablet, update);
    add(mqDesktop, update);

    return () => {
      remove(mqMobile, update);
      remove(mqTablet, update);
      remove(mqDesktop, update);
    };
  }, []);

  return state;
};

export default useMediaDevice;