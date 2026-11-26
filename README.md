# GIMO Pay — site institucional

Landing page da GIMO Pay. Primeira etapa: design, estrutura, responsividade e animações com a copy oficial. Dados institucionais e integrações entram na segunda etapa (ver **Pendências**).

## Stack

- Next.js 16 (App Router, Cache Components) + React 19 + TypeScript
- Tailwind CSS v4 via PostCSS, como no guia de CSS do Next (tokens em `src/app/globals.css`)
- Motion (`motion/react`, com `LazyMotion` + `domMax`) e Lenis (rolagem suave)
- Poppins via `next/font` (auto-hospedada)

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
npm run lint
```

## Estrutura

```
src/
  app/                 rotas (/, /privacidade, /termos, /cookies) e a Server Action do formulário
  config/site.ts       ← dados institucionais, links e contatos (preencher na etapa 2)
  content/copy.ts      ← copy oficial (literal) + `ui`: microcopy de interface a validar
  components/
    layout/            Header, Footer, LegalPage
    sections/          uma seção da página por arquivo, na ordem da página
    mockups/           interfaces ilustrativas (hero, telas do link, cartão, solutions/)
    graphics/          diagramas (integrações)
    motion/            provedores e peças de animação (FadeIn, ScaleToFit, SwipeDeck, ScrubText, marquee)
    ui/ brand/         botões, títulos animados, logo, ondas do símbolo
  lib/                 validação/máscaras, entrega de leads, curva de animação, hooks
```

Convenções:

- Todo texto visível vem de `content/copy.ts` (`copy` = oficial, `ui` = microcopy de interface). Mockups são a exceção: seus dados fictícios ficam nos próprios arquivos.
- Cores e sombras só por tokens de `globals.css` (sem hex solto nos componentes).
- Animações usam `EASE_OUT` de `lib/motion.ts` e respeitam `prefers-reduced-motion`.
- CTAs pré-preenchem o formulário por id tipado (`SolutionId`, `SegmentId`), nunca por texto.

## Identidade visual

| Token | Hex | Origem |
|---|---|---|
| `ciano-500` | `#02AAD7` | logo GIMO Pay: marca, CTAs |
| `ciano-700` | `#00799C` | derivado: texto/links em ciano (AA) |
| `marinho-800` | `#00316D` | logo GIMO Pay: títulos |
| `marinho-950` | `#0D182A` | manual Gimo: seções escuras |
| `ardosia-700` / `-500` | `#334155` / `#667280` | manual Gimo: textos |
| `nevoa` | `#F5F7FA` | manual Gimo: fundos alternados |

Os mockups trazem o selo **"Interface ilustrativa"** e usam apenas dados fictícios ("Loja Exemplo", "Pedido 0482"). Nenhum recurso fora da copy é apresentado.

## Pendências (etapa 2)

Tudo abaixo é configurável sem mexer nos componentes:

- [ ] `site.url`: domínio oficial (metadados/Open Graph)
- [ ] `site.links.account`: URL de "Acessar minha conta" (link oculto enquanto vazio)
- [ ] `site.links.helpCenter`: Central de atendimento (link oculto enquanto vazio)
- [ ] `site.links.gimoCharge`: site da GIMO Charge (sem link enquanto vazio)
- [ ] `site.contact`: e-mail, telefone, WhatsApp, endereço, razão social, CNPJ (ocultos enquanto vazios)
- [ ] `site.social`: redes sociais (ocultas enquanto vazias)
- [ ] Textos de Política de privacidade, Termos de uso e Política de cookies
- [ ] Destino dos leads: definir `LEADS_WEBHOOK_URL` (+ `LEADS_WEBHOOK_TOKEN`) ou trocar o adaptador em `src/lib/leads.ts`. **Sem destino, o formulário avisa o visitante que o envio ainda não está disponível** e nenhum dado pessoal é registrado.
- [ ] Faixas de "Faturamento mensal estimado", se o comercial preferir faixas em vez de valor livre
- [ ] Logo em vetor (SVG) da GIMO Pay e logo oficial da GIMO Charge
- [ ] Imagem de compartilhamento (Open Graph)

Microcopy de interface criada nesta etapa, a validar: está toda em `ui` dentro de `src/content/copy.ts` (mensagens do formulário, páginas legais, rótulos do fluxo de mobilidade e do diagrama de integrações). O CPF/CNPJ aceita também o CNPJ alfanumérico da Receita Federal.
