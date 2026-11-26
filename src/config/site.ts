/**
 * Configuração institucional do site.
 *
 * Tudo que depende de dados oficiais da empresa fica centralizado aqui.
 * Campos vazios ("") não são exibidos no site — basta preenchê-los
 * quando os dados forem enviados, sem tocar nos componentes.
 */

import { copy } from "@/content/copy";

type SiteConfig = {
  name: string;
  title: string;
  url: string;
  description: string;
  links: { account: string; helpCenter: string; gimoCharge: string };
  contact: Record<"email" | "phone" | "whatsapp" | "address" | "legalName" | "cnpj", string>;
  social: Array<{ name: string; url: string }>;
};

export const site: SiteConfig = {
  name: "GIMO Pay",
  /** Título padrão das páginas: marca + rótulo do banner principal da copy. */
  title: `GIMO Pay | ${copy.hero.label}`,
  /** TODO: domínio oficial (ex.: "https://..."). Usado em metadados e Open Graph. */
  url: "",
  /** Descrição para buscadores e redes: texto do banner principal da copy oficial. */
  description: copy.hero.lead,

  links: {
    /** TODO: URL do painel do cliente ("Acessar minha conta"). Vazio = link oculto. */
    account: "",
    /** TODO: URL da central de atendimento. Vazio = link oculto. */
    helpCenter: "",
    /** TODO: site oficial da GIMO Charge. Vazio = o nome aparece sem link. */
    gimoCharge: "",
  },

  /** Contatos exibidos no rodapé. Campos vazios ficam ocultos. */
  contact: {
    email: "", // TODO
    phone: "", // TODO
    whatsapp: "", // TODO: número no formato 5599999999999
    address: "", // TODO
    legalName: "", // TODO: razão social
    cnpj: "", // TODO
  },

  /** Redes sociais. Entradas com URL vazia ficam ocultas. */
  social: [
    { name: "Instagram", url: "" },
    { name: "LinkedIn", url: "" },
    { name: "YouTube", url: "" },
  ],
};

/** Um link só é exibido quando há URL de verdade configurada. */
export const hasLink = (href: string) => href !== "" && href !== "#";
