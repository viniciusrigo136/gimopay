import { describe, expect, it } from "vitest";

/** Intl usa espaço não separável depois de "R$". */
const nb = (s: string) => s.replace(/\u00a0/g, " ");
import { errorMessage } from "./errors";
import { msgOwnerConfirmation, waLink } from "./whatsapp";
import { priceDisplay, priceForCategory } from "@/features/catalog/pricing";
import type { ServiceWithPrices, VehicleCategory } from "./types";
import { fmtMoney, parseMoney } from "@/lib/money";
import { fmtPhone, isPlausibleBrPhone, maskPhone } from "@/lib/phone";
import { addDaysLocal, fmtDuration, localToIso, weekdayOf } from "@/lib/datetime";
import { toCsv } from "@/lib/csv";

const cat = (id: string, over: Partial<VehicleCategory> = {}): VehicleCategory => ({
  id, name: id, slug: id, description: "", is_quote_only: false, is_active: true, sort_order: 0, created_at: "", updated_at: "", ...over,
});
const service = (over: Partial<ServiceWithPrices>): ServiceWithPrices => ({
  id: "s", name: "Lavagem", slug: "lavagem", summary: "", description: "", category: "Lavagem", duration_minutes: 40,
  pricing_mode: "fixed", base_price: 80, booking_mode: "online", cover_image_path: null, is_active: true, is_featured: false,
  is_demo: false, sort_order: 0, internal_notes: "", created_at: "", updated_at: "", service_category_prices: [], ...over,
});

describe("preço de referência (exibição)", () => {
  const cats = [cat("hatch"), cat("suv"), cat("outros", { is_quote_only: true })];
  it("fixo mostra o valor", () => {
    const p = priceDisplay(service({}), cats);
    expect(nb(p.headline)).toBe("R$ 80");
    expect(p.isEstimate).toBe(false);
  });
  it("por categoria mostra 'a partir de' o menor", () => {
    const s = service({ pricing_mode: "vehicle_category", base_price: null, service_category_prices: [
      { id: "1", service_id: "s", vehicle_category_id: "hatch", price: 50 },
      { id: "2", service_id: "s", vehicle_category_id: "suv", price: 65 },
    ] });
    expect(nb(priceDisplay(s, cats).headline)).toBe("a partir de R$ 50");
    expect(priceForCategory(s, cats[2]!)).toBeNull();
  });
  it("sob avaliação", () => {
    expect(priceDisplay(service({ pricing_mode: "quote", base_price: null }), cats)).toMatchObject({ headline: "Sob avaliação", isQuote: true });
  });
  it("misto é sempre estimativa", () => {
    expect(priceDisplay(service({ pricing_mode: "mixed", base_price: 300 }), cats)).toMatchObject({ isEstimate: true });
  });
});

describe("WhatsApp", () => {
  it("monta wa.me com a mensagem codificada", () => {
    expect(waLink("+5549991234567", "Olá & tchau")).toBe("https://wa.me/5549991234567?text=Ol%C3%A1%20%26%20tchau");
    expect(waLink("", "x")).toBeNull();
  });
  it("mensagem de confirmação traz os dados exigidos (SPEC 7.4)", () => {
    const msg = msgOwnerConfirmation({
      customerName: "Maria Souza", services: ["Lavagem detalhada"], vehicle: "Sedan · Corolla", startsAt: "2026-12-07T11:40:00Z",
      durationMinutes: 90, finalTotal: 120, referenceTotal: 100, paymentMethod: "pix", pix: { key: "chave@pix.com", holderName: "Tassionero" }, code: "ABCD-2345",
    });
    for (const part of ["Maria", "Lavagem detalhada", "Corolla", "08:40", "1h30", "R$ 120,00", "chave@pix.com", "ABCD-2345"]) expect(nb(msg)).toContain(part);
  });
});

describe("dinheiro, telefone, datas", () => {
  it("formata e lê valores em BRL", () => {
    expect(nb(fmtMoney(1234.5))).toBe("R$ 1.234,50");
    expect(parseMoney("1.234,50")).toBe(1234.5);
    expect(parseMoney("80")).toBe(80);
    expect(parseMoney("abc")).toBeNull();
    expect(parseMoney("-5")).toBeNull();
  });
  it("máscara e validação de telefone", () => {
    expect(maskPhone("49991234567")).toBe("(49) 99123-4567");
    expect(isPlausibleBrPhone("(49) 99123-4567")).toBe(true);
    expect(isPlausibleBrPhone("123")).toBe(false);
    expect(fmtPhone("+5549991234567")).toBe("(49) 99123-4567");
  });
  it("datas no fuso de São Paulo", () => {
    expect(localToIso("2026-12-07", "08:00")).toBe("2026-12-07T11:00:00.000Z");
    expect(weekdayOf("2026-12-06")).toBe(0);
    expect(addDaysLocal("2026-12-31", 1)).toBe("2027-01-01");
    expect(fmtDuration(40)).toBe("40 min");
    expect(fmtDuration(120)).toBe("2h");
    expect(fmtDuration(90)).toBe("1h30");
  });
  it("CSV escapa separadores e usa vírgula decimal", () => {
    expect(toCsv([["a;b", 1.5, null], ['x"y', "z", 2]])).toBe('"a;b";1,5;\r\n"x""y";z;2');
  });
  it("traduz códigos de erro do banco", () => {
    expect(errorMessage({ message: "slot_unavailable" })).toMatch(/acabou de ser reservado/);
    expect(errorMessage(new Error("qualquer"))).toMatch(/Algo deu errado/);
  });
});
