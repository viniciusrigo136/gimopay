import type { SegmentId, SolutionId } from "@/content/copy";

/**
 * Pré-preenchimento do formulário comercial a partir de CTAs da página.
 * Usa ids tipados: se a copy mudar, o TypeScript acusa os CTAs afetados.
 */
export type PrefillPayload = { segment?: SegmentId; solution?: SolutionId };

const EVENT = "gimopay:prefill";

export function emitPrefill(payload: PrefillPayload) {
  window.dispatchEvent(new CustomEvent<PrefillPayload>(EVENT, { detail: payload }));
}

export function onPrefill(handler: (payload: PrefillPayload) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<PrefillPayload>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
