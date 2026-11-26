"use client";

import { useMediaQuery } from "./useMediaQuery";

/** Preferência do sistema por menos movimento (segura para hidratação). */
export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
