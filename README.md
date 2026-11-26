# GIMO Pay — site institucional

Landing page da GIMO Pay. Primeira etapa: design, estrutura, responsividade e animações com a copy oficial. Dados institucionais e integrações entram na segunda etapa (ver **Pendências**).

## Stack

- Next.js 16 (App Router, Cache Components) + React 19 + TypeScript
- Tailwind CSS v4 (tokens em `src/app/globals.css`)
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
  app/                 rotas (/, /privacidade, /termos, /cookies), Server Action do formulário
  config/site.ts       ← dados institucionais, links e contatos (preencher na etapa 2)
  content/copy.ts      ← copy oficial, transcrita literalmente
  components/
    layout/            Header, Footer, LegalPage
    sections/          uma seção por arquivo, na ordem da página
    mockups/           interfaces ilustrativas (dados fictícios)
    motion/            Providers, FadeIn, ScaleToFit
    ui/ brand/         botões, títulos animados, logo, ondas do símbolo
  lib/                 validação/máscaras, entrega de leads, utilitários
```

## Identidade visual

| Token | Hex | Origem |
|---|---|---|
| `ciano-500` | `#02AAD7` | logo GIMO Pay: marca, CTAs |
| `ciano-700` | `#00799C` | derivado: texto/links em ciano (AA) |
| `marinho-800` | `#00316D` | logo GIMO Pay: títulos |
| `marinho-950` | `#0D182A` | manual Gimo: seções escuras |
| `ardosia-700` / `-500` | `#334155` / `#667280` | manual Gimo: textos |
| `nevoa` | `#F5F7FA` | manual Gimo: fundos alternados |

Os mockups trazem o selo **"Interface ilustrativa"** e usam apenas dados fictícios ("Loja Exemplo", valores redondos). Nenhum recurso fora da copy é apresentado.

## Pendências (etapa 2)

Tudo abaixo é configurável sem mexer nos componentes:

- [ ] `site.url`: domínio oficial (metadados/Open Graph)
- [ ] `site.links.account`: URL de "Acessar minha conta" (hoje `#`)
- [ ] `site.links.helpCenter`: Central de atendimento (hoje aponta para o formulário)
- [ ] `site.links.gimoCharge`: site da GIMO Charge (sem link enquanto vazio)
- [ ] `site.contact`: e-mail, telefone, WhatsApp, endereço, razão social, CNPJ (ocultos enquanto vazios)
- [ ] `site.social`: redes sociais (ocultas enquanto vazias)
- [ ] Textos de Política de privacidade, Termos de uso e Política de cookies
- [ ] Destino dos leads: definir `LEADS_WEBHOOK_URL` (+ `LEADS_WEBHOOK_TOKEN`) ou trocar o adaptador em `src/lib/leads.ts`. Sem destino, o lead só é registrado no log do servidor.
- [ ] Faixas de "Faturamento mensal estimado", se o comercial preferir faixas em vez de valor livre
- [ ] Logo em vetor (SVG) da GIMO Pay e logo oficial da GIMO Charge
- [ ] Imagem de compartilhamento (Open Graph)

Microcopy de interface criada para esta etapa, a validar: confirmação do formulário ("Dados enviados", "Nossa equipe comercial vai entrar em contato pelos dados informados."), mensagens de erro dos campos e o aviso "Conteúdo em definição" das páginas legais.
