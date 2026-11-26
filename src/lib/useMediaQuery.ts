"use client";

import { useSyncExternalStore } from "react";

/**
 * Lê uma media query de forma segura para hidratação:
 * no servidor (e na hidratação) retorna `false`, depois sincroniza.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
