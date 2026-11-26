/**
 * Pré-preenchimento do formulário comercial a partir de CTAs da página.
 * Um CTA dispara o evento; o formulário escuta e aplica os valores.
 */
export type PrefillPayload = { segment?: string; solution?: string };

const EVENT = "gimopay:prefill";

export function emitPrefill(payload: PrefillPayload) {
  window.dispatchEvent(new CustomEvent<PrefillPayload>(EVENT, { detail: payload }));
}

export function onPrefill(handler: (payload: PrefillPayload) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<PrefillPayload>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
