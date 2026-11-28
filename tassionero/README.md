# Tassionero Estética Automotiva

Site público com catálogo e agendamento online + painel do proprietário (agenda, clientes, veículos, serviços, financeiro, relatórios, galeria e configurações).

Leia `CLAUDE.md` (regras e decisões aprovadas) e `SPEC.md` (especificação) antes de alterar o projeto.

## Stack

- TanStack Start (React 19 + Vite) · TypeScript estrito · Tailwind CSS v4 · TanStack Query · React Hook Form + Zod · Motion · Lucide
- Backend: Supabase / Lovable Cloud (PostgreSQL, Auth, Storage, Realtime). Regras críticas em funções SQL com RLS.

## Rodar localmente

Requer Node 22 e Docker (para o Supabase local).

```bash
npm install
npx supabase start          # sobe Postgres/Auth/Storage locais
npx supabase db reset       # aplica as migrações em supabase/migrations
cp .env.example .env.local  # preencha VITE_SUPABASE_PUBLISHABLE_KEY com a chave "anon" de `npx supabase status`
npm run dev                 # http://localhost:3000
```

Usuário proprietário local: não há cadastro público. Crie o usuário pelo Auth (Studio local ou API admin); o **primeiro** usuário criado vira proprietário automaticamente (`profiles.role = 'owner'`).

## Verificações

```bash
npm run typecheck   # tsc (app + testes)
npm run lint        # ESLint (inclui regras do React Compiler)
npm test            # testes unitários (domínio, preços, WhatsApp, datas)
npm run test:db     # agenda, concorrência, financeiro e RLS contra o banco local
npm run build
npm run check:secrets  # garante que nenhuma credencial privada foi para o bundle
npm run check          # tudo acima, exceto test:db
```

## Estrutura

```
src/
  routes/                 rotas por arquivo (TanStack Router)
    _site/                site público (início, serviços, galeria, contato, agendar, confirmação)
    admin/login.tsx
    admin/_panel/         painel (guarda de autenticação em _panel.tsx; ssr: false)
  domain/                 tipos, status/transições (UI), erros, mensagens de WhatsApp
  features/catalog        consultas públicas, hero, cartões, exibição de preços
  features/booking        RPCs do agendamento e validação do formulário
  features/admin          consultas/ações do painel, componentes (agenda semanal, diálogos, gráficos)
  components/             UI base (botões, campos, diálogo, feedback), marca e layout
  lib/                    datas no fuso America/Sao_Paulo, dinheiro BRL, telefone, CSV
  config/media.ts         imagens do site (hero/estúdio) — preencher quando o Lovable gerar
supabase/migrations/      schema, motor de agenda, relatórios, RLS/Storage, dados de referência
tests/db/                 testes de banco (Vitest + pg)
scripts/                  verificação de segredos no bundle
```

## Pendências com o proprietário

- WhatsApp comercial, chave Pix, endereço e link do mapa (Configurações do painel).
- Revisar serviços, durações e preços de referência (marcados "referência").
- Logo vetorial oficial (o wordmark atual é uma recriação provisória).
- Imagens: gerar no Lovable (hero, capas de serviço, ambiente) e apontar em `src/config/media.ts` / capas no painel.
- Regra para telefone já cadastrado (hoje cada pedido cria um cliente novo).
- Política de cancelamento (texto em Configurações).
