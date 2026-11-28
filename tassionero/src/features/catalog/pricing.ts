import type { ServiceWithPrices, VehicleCategory } from "@/domain/types";
import { fmtMoneyShort } from "@/lib/money";

/**
 * Apresentação dos preços de referência do catálogo (somente exibição).
 * O preço usado numa reserva é sempre calculado no banco (quote_services / create_public_appointment).
 */
export type PriceDisplay = {
  /** Texto principal: "R$ 80", "a partir de R$ 50" ou "Sob avaliação". */
  headline: string;
  /** Valor final pode mudar após avaliação. */
  isEstimate: boolean;
  isQuote: boolean;
};

export function priceDisplay(service: ServiceWithPrices, categories: VehicleCategory[]): PriceDisplay {
  const priced = new Set(categories.filter((c) => c.is_active && !c.is_quote_only).map((c) => c.id));
  const catPrices = service.service_category_prices.filter((p) => priced.has(p.vehicle_category_id)).map((p) => Number(p.price));
  const base = service.base_price === null ? null : Number(service.base_price);

  switch (service.pricing_mode) {
    case "quote":
      return { headline: "Sob avaliação", isEstimate: true, isQuote: true };
    case "fixed":
      return { headline: fmtMoneyShort(base), isEstimate: false, isQuote: base === null };
    case "vehicle_category":
    case "mixed": {
      const all = [...catPrices, ...(service.pricing_mode === "mixed" && base !== null ? [base] : [])];
      if (all.length === 0) return { headline: "Sob avaliação", isEstimate: true, isQuote: true };
      const min = Math.min(...all);
      const max = Math.max(...all);
      return {
        headline: min === max ? fmtMoneyShort(min) : `a partir de ${fmtMoneyShort(min)}`,
        isEstimate: service.pricing_mode === "mixed",
        isQuote: false,
      };
    }
  }
}

/** Preço de referência por categoria para a tabela do detalhe do serviço. */
export function priceForCategory(service: ServiceWithPrices, category: VehicleCategory): number | null {
  if (category.is_quote_only || service.pricing_mode === "quote") return null;
  if (service.pricing_mode === "fixed") return service.base_price === null ? null : Number(service.base_price);
  const p = service.service_category_prices.find((x) => x.vehicle_category_id === category.id);
  if (p) return Number(p.price);
  return service.pricing_mode === "mixed" && service.base_price !== null ? Number(service.base_price) : null;
}
