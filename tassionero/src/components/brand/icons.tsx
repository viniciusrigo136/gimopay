import { createElement, type SVGProps } from "react";
import { Car, Droplets, Gem, ShieldCheck, Sofa, Sparkles, Wrench, type LucideIcon } from "lucide-react";

/** Ícone por categoria de serviço (texto livre do catálogo). */
export function serviceIcon(category: string): LucideIcon {
  const c = category.toLowerCase();
  if (c.includes("lav")) return Droplets;
  if (c.includes("inter")) return Sofa;
  if (c.includes("pint") || c.includes("polim")) return Sparkles;
  if (c.includes("prote") || c.includes("vitri")) return ShieldCheck;
  if (c.includes("motor")) return Wrench;
  if (c.includes("couro")) return Gem;
  return Car;
}

/** Ícone do serviço como componente estável (evita criar componentes durante a renderização). */
export function ServiceIcon({ category, ...props }: { category: string } & SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return createElement(serviceIcon(category), props);
}
