/**
 * Copy oficial do site GIMO Pay.
 * Textos transcritos literalmente do documento "GIMO PAY | COPY OFICIAL DO SITE".
 * Não editar sem aprovação — ajustes de conteúdo devem vir do cliente.
 */

export const solutions = [
  {
    id: "gateway",
    name: "Gateway de pagamento",
    description:
      "Integre pagamentos à sua plataforma digital e centralize o processamento das suas transações.",
  },
  {
    id: "link",
    name: "Link de pagamento",
    description:
      "Venda de qualquer lugar. Gere links de pagamento e compartilhe diretamente com seus clientes por WhatsApp, e-mail ou outros canais digitais.",
  },
  {
    id: "pix",
    name: "Pix",
    description:
      "Receba pagamentos de maneira rápida e prática, simplificando suas transações do dia a dia.",
  },
  {
    id: "credito",
    name: "Cartão de crédito",
    description:
      "Amplie suas possibilidades de venda oferecendo opções de pagamento à vista ou parcelado.",
  },
  {
    id: "debito",
    name: "Cartão de débito",
    description: "Disponibilize mais uma alternativa de pagamento para seus clientes.",
  },
  {
    id: "antecipacao",
    name: "Antecipação de recebíveis",
    description:
      "Tenha mais flexibilidade para administrar seu fluxo de caixa com a possibilidade de antecipar seus recebimentos, conforme as condições disponíveis.",
  },
  {
    id: "gestao",
    name: "Gestão de transações",
    description:
      "Acompanhe seus pagamentos, transações e recebimentos com mais organização e transparência.",
  },
] as const;

export type SolutionId = (typeof solutions)[number]["id"];

export const segments = [
  { id: "varejo", label: "Comércio e varejo." },
  { id: "servicos", label: "Prestadores de serviços." },
  { id: "distribuidores", label: "Distribuidores e revendedores." },
  { id: "plataformas", label: "Plataformas digitais." },
  { id: "tecnologia", label: "Empresas de tecnologia." },
  { id: "mobilidade", label: "Mobilidade elétrica." },
  { id: "eletropostos", label: "Eletropostos e redes de recarga." },
  { id: "b2b", label: "Vendas B2B." },
] as const;

export type SegmentId = (typeof segments)[number]["id"];

export const copy = {
  nav: {
    items: [
      { label: "Início", href: "#inicio" },
      { label: "Sobre nós", href: "#sobre" },
      { label: "Soluções", href: "#solucoes" },
      { label: "Integrações", href: "#integracoes" },
      { label: "Perguntas frequentes", href: "#faq" },
      { label: "Contato", href: "#contato" },
    ],
    account: "Acessar minha conta",
    cta: "Seja cliente",
  },

  hero: {
    label: "Soluções inteligentes de pagamento",
    titleLines: ["Mais possibilidades para vender.", "Mais facilidade para receber."],
    lead: "Simplifique seus pagamentos, amplie suas possibilidades de venda e tenha mais controle sobre suas transações com a tecnologia da GIMO Pay.",
    support: "Soluções de pagamento que conectam empresas, pessoas e oportunidades.",
    primary: "Seja cliente GIMO Pay",
    secondary: "Conheça nossas soluções",
  },

  about: {
    title: "Tecnologia financeira que movimenta negócios.",
    paragraphs: [
      "A GIMO Pay nasceu para transformar a maneira como empresas realizam e recebem pagamentos.",
      "Desenvolvemos soluções que conectam tecnologia e meios de pagamento, tornando as transações comerciais mais simples, eficientes e transparentes.",
      "Nosso propósito é facilitar a jornada financeira de empresas e consumidores, oferecendo soluções que acompanham a evolução de cada negócio.",
    ],
    statement: "Sua empresa vende. A GIMO Pay facilita o pagamento.",
  },

  solutions: {
    title: "Diferentes formas de pagar. Novas possibilidades de crescer.",
    intro:
      "Conheça as soluções da GIMO Pay e descubra como simplificar a operação financeira da sua empresa.",
    cta: "Encontre a solução ideal para seu negócio",
  },

  paymentLink: {
    title: "Venda de onde estiver.",
    intro:
      "Sem precisar de uma loja virtual ou de uma máquina de cartão, sua empresa pode realizar vendas à distância de maneira prática e digital.",
    steps: [
      { title: "Crie", text: "Gere um link com o valor da sua venda." },
      { title: "Compartilhe", text: "Envie o link diretamente ao seu cliente." },
      {
        title: "Venda",
        text: "Seu cliente escolhe uma das condições de pagamento disponíveis e finaliza a transação.",
      },
      { title: "Acompanhe", text: "Consulte o status do pagamento e acompanhe seus recebimentos." },
    ],
    closing: "Mais liberdade para vender. Mais praticidade para comprar.",
    cta: "Quero vender com a GIMO Pay",
  },

  integrations: {
    title: "Conecte seus pagamentos ao seu negócio.",
    paragraphs: [
      "Integre as soluções da GIMO Pay à sua operação e ofereça uma experiência de pagamento mais fluida aos seus clientes.",
      "Nossa tecnologia permite conectar meios de pagamento a plataformas digitais, sistemas de gestão e diferentes modelos de negócio, conforme a compatibilidade de cada operação.",
      "Simplifique processos e concentre seus esforços no crescimento da sua empresa.",
    ],
    cta: "Conheça nossas integrações",
  },

  segments: {
    title: "Soluções que acompanham diferentes modelos de negócio.",
    intro:
      "A GIMO Pay oferece soluções de pagamento para empresas que buscam mais eficiência, praticidade e controle em suas operações financeiras.",
    closing:
      "Independentemente do segmento, nosso objetivo é conectar sua empresa a novas possibilidades de pagamento.",
  },

  mobility: {
    title: "Conectando pagamentos ao futuro da mobilidade.",
    paragraphs: [
      "A GIMO Pay integra tecnologia financeira ao ecossistema de mobilidade elétrica, facilitando as transações entre motoristas e operadores de estações de recarga.",
      "Por meio da integração com a GIMO Charge, os operadores podem disponibilizar diferentes meios de pagamento e acompanhar os recebimentos das suas operações.",
      "Enquanto a GIMO Charge fornece a tecnologia de gestão das recargas, a GIMO Pay atua no processamento dos pagamentos.",
    ],
    closing: "Duas soluções independentes que, juntas, proporcionam uma experiência integrada.",
    cta: "Conheça nossas soluções para mobilidade elétrica",
  },

  differentials: {
    title: "Mais inteligência para suas transações.",
    items: [
      { title: "Praticidade", text: "Simplifique o processo de pagamento para sua empresa e seus clientes." },
      { title: "Flexibilidade", text: "Ofereça diferentes meios e condições de pagamento." },
      { title: "Transparência", text: "Acompanhe suas transações e condições de recebimento." },
      { title: "Integração", text: "Conecte soluções financeiras à sua operação digital." },
      {
        title: "Escalabilidade",
        text: "Conte com soluções preparadas para acompanhar o crescimento do seu negócio.",
      },
      {
        title: "Atendimento",
        text: "Conte com nossa equipe para encontrar as soluções adequadas às necessidades da sua empresa.",
      },
    ],
  },

  contact: {
    title: "Seu negócio pode ir mais longe com a GIMO Pay.",
    intro:
      "Descubra como nossas soluções de pagamento podem simplificar suas transações, ampliar suas possibilidades de venda e facilitar seus recebimentos.",
    instruction: "Preencha o formulário e fale com nossa equipe comercial.",
    fields: {
      name: "Nome completo",
      company: "Nome da empresa",
      document: "CPF ou CNPJ",
      email: "E-mail",
      whatsapp: "WhatsApp",
      segment: "Segmento de atuação",
      revenue: "Faturamento mensal estimado",
      solution: "Solução de interesse",
    },
    submit: "Quero ser cliente GIMO Pay",
    privacy: "Ao enviar este formulário, você declara estar ciente da nossa Política de Privacidade.",
  },

  faq: {
    title: "Perguntas frequentes",
    items: [
      {
        q: "O que é a GIMO Pay?",
        a: "A GIMO Pay é uma empresa de soluções de pagamento que conecta tecnologia e meios de pagamento para facilitar as transações comerciais.",
      },
      {
        q: "Quais meios de pagamento posso oferecer aos meus clientes?",
        a: "As soluções incluem Pix, cartão de crédito e cartão de débito, conforme a modalidade contratada.",
      },
      {
        q: "Preciso de uma máquina de cartão para realizar vendas?",
        a: "Não. Com o link de pagamento, você pode realizar vendas à distância sem a necessidade de uma máquina física.",
      },
      {
        q: "Posso oferecer parcelamento aos meus clientes?",
        a: "Sim. As condições de parcelamento dependem da modalidade de pagamento e das condições comerciais contratadas.",
      },
      {
        q: "Quais são as taxas da GIMO Pay?",
        a: "As taxas variam conforme a solução contratada e as características da operação. Entre em contato com nossa equipe para conhecer as condições comerciais.",
      },
      {
        q: "Qual é o prazo para receber minhas vendas?",
        a: "Os prazos de recebimento variam conforme o meio de pagamento e as condições contratadas.",
      },
      {
        q: "Posso antecipar meus recebimentos?",
        a: "Sim, conforme a disponibilidade, elegibilidade e condições comerciais da operação.",
      },
      {
        q: "A GIMO Pay atende apenas empresas de mobilidade elétrica?",
        a: "Não. A GIMO Pay possui soluções de pagamento que podem atender diferentes segmentos e modelos de negócio.",
      },
      {
        q: "Qual é a diferença entre a GIMO Pay e a GIMO Charge?",
        a: "A GIMO Pay atua com soluções de pagamento, enquanto a GIMO Charge fornece tecnologia para gerenciamento de estações de recarga de veículos elétricos.",
      },
      {
        q: "Como posso contratar a GIMO Pay?",
        a: "Entre em contato com nossa equipe comercial para conhecer nossas soluções e iniciar seu processo de cadastro.",
      },
    ],
  },

  finalCta: {
    title: "Simplificamos pagamentos. Impulsionamos negócios.",
    text: "Conecte sua empresa a novas possibilidades com a GIMO Pay.",
    primary: "Seja cliente",
    secondary: "Fale com um especialista",
  },

  footer: {
    tagline: "Tecnologia financeira que movimenta negócios.",
    columns: [
      {
        title: "Institucional",
        links: [
          { label: "Sobre nós", href: "/#sobre" },
          { label: "Nossas soluções", href: "/#solucoes" },
          { label: "Integrações", href: "/#integracoes" },
          { label: "Seja cliente", href: "/#contato" },
        ],
      },
      {
        title: "Soluções",
        links: [
          { label: "Gateway de pagamento", href: "/#solucoes" },
          { label: "Link de pagamento", href: "/#link-de-pagamento" },
          { label: "Pix", href: "/#solucoes" },
          { label: "Cartão de crédito", href: "/#solucoes" },
          { label: "Antecipação de recebíveis", href: "/#solucoes" },
        ],
      },
    ],
    support: {
      title: "Atendimento",
      contact: "Fale conosco",
      helpCenter: "Central de atendimento",
      account: "Acessar minha conta",
    },
    legal: {
      title: "Informações legais",
      links: [
        { label: "Política de privacidade", href: "/privacidade" },
        { label: "Termos de uso", href: "/termos" },
        { label: "Política de cookies", href: "/cookies" },
      ],
    },
    copyright: "© 2026 GIMO Pay. Todos os direitos reservados.",
  },
} as const;

/**
 * Microcopy de interface criada nesta etapa (NÃO faz parte da copy oficial).
 * Textos funcionais, de rótulo ou derivados literalmente da copy oficial.
 * Validar com o cliente na etapa 2.
 */
export const ui = {
  form: {
    select: "Selecione",
    otherSegment: "Outro",
    undecidedSolution: "Ainda não sei",
    documentPlaceholder: "CPF ou CNPJ",
    phonePlaceholder: "(00) 00000-0000",
    revenuePlaceholder: "R$ 0,00",
    sending: "Enviando",
    success: {
      title: "Dados enviados",
      text: "Suas informações foram enviadas para a equipe comercial da GIMO Pay.",
    },
    unavailable: "O envio do formulário ainda não está disponível. Tente novamente mais tarde.",
    error: "Não foi possível enviar agora. Tente novamente em alguns instantes.",
    privacyLinkText: "Política de Privacidade",
    errors: {
      name: "Informe nome e sobrenome.",
      company: "Informe o nome da empresa.",
      document: "Informe um CPF ou CNPJ válido.",
      email: "Informe um e-mail válido, como nome@empresa.com.br.",
      whatsapp: "Informe o WhatsApp com DDD.",
      segment: "Selecione o segmento de atuação.",
      revenue: "Informe o faturamento mensal estimado.",
      solution: "Selecione a solução de interesse.",
    },
  },
  legal: {
    back: "Voltar para o início",
    pendingTitle: "Conteúdo em definição",
    pendingText: "O texto oficial deste documento está sendo preparado e será publicado nesta página.",
  },
  /** Rótulos do fluxo de mobilidade, retirados literalmente da seção 08 da copy. */
  mobility: {
    drivers: "Motoristas",
    operators: "Operadores de estações de recarga",
    chargeRole: "Tecnologia de gestão das recargas",
    payRole: "Processamento dos pagamentos",
  },
  /** Rótulos do diagrama de integrações, retirados da seção 06 e das soluções da copy. */
  integrations: {
    sources: ["Plataformas digitais", "Sistemas de gestão", "Modelos de negócio"],
    methods: ["Pix", "Cartão de crédito", "Cartão de débito"],
    diagramLabel:
      "Diagrama ilustrativo: plataformas digitais, sistemas de gestão e modelos de negócio conectados à GIMO Pay, que conecta Pix, cartão de crédito e cartão de débito.",
  },
} as const;
