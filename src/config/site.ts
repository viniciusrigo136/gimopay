/**
 * Configuração institucional do site.
 *
 * Tudo que depende de dados oficiais da empresa fica centralizado aqui.
 * Campos vazios ("") não são exibidos no site — basta preenchê-los
 * quando os dados forem enviados, sem tocar nos componentes.
 */

type SiteConfig = {
  name: string;
  url: string;
  description: string;
  links: { account: string; helpCenter: string; gimoCharge: string };
  contact: Record<"email" | "phone" | "whatsapp" | "address" | "legalName" | "cnpj", string>;
  social: Array<{ name: string; url: string }>;
};

export const site: SiteConfig = {
  name: "GIMO Pay",
  /** TODO: domínio oficial (ex.: "https://..."). Usado em metadados e Open Graph. */
  url: "",
  description:
    "Soluções de pagamento que conectam empresas, pessoas e oportunidades. Gateway, link de pagamento, Pix, cartões, antecipação de recebíveis e gestão de transações.",

  links: {
    /** TODO: URL do painel do cliente ("Acessar minha conta"). */
    account: "#",
    /** TODO: URL da central de atendimento. Enquanto vazio, aponta para o formulário. */
    helpCenter: "/#contato",
    /** TODO: site oficial da GIMO Charge. Enquanto vazio, o nome aparece sem link. */
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

export const isPlaceholderHref = (href: string) => href === "" || href === "#";
