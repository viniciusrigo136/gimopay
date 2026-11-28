# CLAUDE.md — Tassionero Estética Automotiva

## Missão
Desenvolver o Tassionero, uma aplicação web profissional para a Tassionero Estética Automotiva, em União do Oeste/SC. O produto possui:
1. Site público com catálogo de serviços, preços de referência, galeria e agendamento online.
2. Painel administrativo exclusivo do proprietário para agenda, clientes, veículos, serviços, financeiro e configurações.

O projeto será desenvolvido com Claude Code e posteriormente conectado/publicado usando Lovable Cloud. Priorize compatibilidade com o ambiente Lovable Cloud e não introduza infraestrutura externa sem necessidade.

## Antes de alterar o projeto
- Leia este arquivo e `SPEC.md` por completo.
- Inspecione a estrutura, dependências e estado atual do repositório antes de editar.
- Não substitua arquivos ou configurações existentes sem entender sua função.
- Se o repositório já tiver decisões técnicas válidas, preserve-as, desde que não contrariem requisitos de segurança ou negócio documentados.
- Apresente um plano curto antes de mudanças grandes ou que afetem banco, autenticação ou arquitetura.

## Stack preferencial
- React + TypeScript + **TanStack Start** (Vite). Decisão de 28/11/2026: é o template atual do Lovable; substitui o React + Vite SPA.
- Tailwind CSS v4 (tokens em `src/styles.css`). Componentes de UI próprios e enxutos em `src/components/ui` (sem dependência do shadcn).
- Supabase/Lovable Cloud para PostgreSQL, autenticação, Storage e Edge Functions.
- TanStack Query para dados remotos.
- React Hook Form + Zod para formulários e validação.
- Lucide para ícones.
- Use as versões já instaladas no projeto sempre que possível; não atualize dependências em massa.

Não crie backend paralelo, servidor próprio ou integração de pagamento externa sem requisito aprovado. A lógica crítica de disponibilidade e criação de reservas deve ser validada no servidor/banco, nunca somente no navegador.

## Regras de trabalho
1. Trabalhe em etapas pequenas e verificáveis.
2. TypeScript estrito; evite `any`. Tipos compartilhados para entidades e estados.
3. Componentes reutilizáveis, páginas organizadas por domínio e lógica de negócio fora dos componentes visuais.
4. Não duplicar regras de preço, duração, permissões ou disponibilidade no frontend.
5. Validar entradas no cliente e novamente no servidor.
6. Tratar loading, erro, vazio, sucesso e estados desabilitados em todas as telas relevantes.
7. Não inserir dados fictícios em produção. Dados de demonstração devem ser claramente identificados e isolados.
8. Não registrar tokens, senhas, chaves privadas, dados pessoais ou comprovantes em logs.
9. Nunca expor `service_role` ou segredos no frontend. Variáveis públicas devem conter apenas chaves explicitamente destinadas ao cliente.
10. Não afirmar que WhatsApp, Pix ou qualquer integração foi concluída sem testar o fluxo real.
11. Criar migrações versionadas para alterações de banco. Não depender de alterações manuais não documentadas no dashboard.
12. Não remover ou relaxar RLS para resolver problemas de acesso. Corrija as políticas corretamente.

## Regras de negócio obrigatórias
- Fuso horário: `America/Sao_Paulo`; persistir timestamps de forma consistente (preferencialmente `timestamptz`) e exibir no horário local.
- Expediente inicial: segunda a sexta, 08:00–18:00; sábado, 08:00–12:00; domingo fechado. Sem intervalo interno configurado inicialmente.
- Um único proprietário/operador e uma única agenda/recurso no escopo inicial.
- A duração do agendamento é a soma das durações dos serviços selecionados, se a experiência permitir selecionar mais de um.
- Horários disponíveis devem respeitar expediente, duração, bloqueios e todos os agendamentos que ocupam a agenda.
- Reserva criada pelo cliente fica `pending` e BLOQUEIA o horário até o proprietário confirmar ou recusar. Não expira automaticamente.
- O proprietário pode confirmar, recusar, cancelar, reagendar e alterar o preço final.
- Alterar preço final não deve alterar silenciosamente o preço de referência do catálogo.
- O preço público é indicativo quando sujeito à categoria/avaliação. Mostrar isso claramente.
- Cliente escolhe Pix ou dinheiro no pedido. Não existe cobrança automática nem confirmação automática do Pix no escopo inicial.
- Pix: mostrar chave e instruções configuradas pelo proprietário; botão para copiar chave e abrir WhatsApp para enviar comprovante.
- Dinheiro: informar que o pagamento será presencial.
- WhatsApp deve abrir uma conversa com mensagem pré-preenchida; o proprietário revisa e envia manualmente. Não prometer envio automático.
- Agendamento não é receita. Receita só é registrada quando o pagamento for efetivamente recebido e lançado.
- Cancelamento do cliente é solicitado via WhatsApp; o proprietário altera o status no painel.
- Não permitir sobreposição entre reservas ativas, incluindo `pending`, `confirmed` e `in_progress`.
- A checagem de conflito deve ser atômica no servidor/banco para impedir duas reservas concorrentes no mesmo horário.

## Segurança e privacidade
- Painel exige autenticação.
- No MVP, somente o proprietário possui acesso administrativo.
- Ativar RLS em todas as tabelas expostas ao cliente.
- Visitantes podem ler apenas serviços ativos, preços públicos, categorias necessárias, galeria publicada e horários públicos necessários.
- Visitantes podem criar reservas por operação controlada (RPC/Edge Function) com validação, rate limit/antiabuso e campos permitidos; não podem listar ou ler reservas de terceiros.
- Apenas o proprietário autenticado pode consultar/alterar clientes, veículos, agenda, transações, configurações privadas e registros administrativos.
- Não expor chave Pix privada, dados internos ou informações pessoais em endpoints públicos além do estritamente necessário.
- Guardar apenas dados necessários: nome, telefone e dados básicos do veículo. CPF/endereço não fazem parte do cadastro inicial.
- Usar variáveis de ambiente e secrets do ambiente Lovable Cloud para credenciais.
- Validar autorização no servidor, não apenas esconder rotas no frontend.

## Diretrizes de interface
- Identidade premium, automotiva e elegante; evitar aparência genérica de template ou “futurista de IA”.
- Identidade aprovada: Vermelho Esportivo #E10600 (só ação/destaque), Preto Premium #0B0B0B, grafites, Cinza Metálico #9CA3AF, Branco #F5F5F5; tipografia Montserrat. Status da agenda têm paleta própria (vermelho nunca significa erro/recusa).
- Fotografias reais da estética e dos serviços têm prioridade sobre imagens genéricas.
- Site público rápido, responsivo, acessível e otimizado para celular.
- Painel pode usar layout desktop-first, mas deve funcionar bem em celular.
- Usar textos em português do Brasil, moeda BRL e datas no padrão brasileiro.
- Acessibilidade: contraste, foco visível, labels, navegação por teclado e feedback compreensível.

## Processo de desenvolvimento
Para cada etapa:
1. Resuma o objetivo e arquivos/áreas que serão afetados.
2. Implemente apenas o escopo daquela etapa.
3. Rode lint, typecheck, testes e build disponíveis.
4. Corrija erros introduzidos.
5. Liste o que foi concluído, o que foi testado e pendências.
6. Não avance para integrações externas ou funcionalidades não aprovadas.

## Sequência recomendada
1. Auditoria do repositório e fundação visual/arquitetural.
2. Rotas e site público com conteúdo gerenciável.
3. Banco, migrações, autenticação e RLS.
4. Agenda e reserva atômica.
5. Painel de serviços, clientes, veículos e agendamentos.
6. Financeiro e relatórios.
7. WhatsApp/Pix informativo.
8. Testes ponta a ponta, segurança, responsividade e publicação.

## Critérios de aceite inegociáveis
- Nenhum visitante acessa o painel ou dados privados.
- Duas tentativas concorrentes não conseguem ocupar o mesmo intervalo.
- Reserva `pending` bloqueia o horário até ação do proprietário.
- Duração e expediente são respeitados inclusive no limite do dia.
- Um agendamento não vira receita automaticamente.
- Preço final personalizado é preservado no histórico.
- WhatsApp abre mensagem correta, mas só é enviado após ação humana.
- Nenhuma chave secreta aparece no bundle do frontend.

## Decisões aprovadas (28/11/2026)
- Escopo: todas as fases do SPEC. Fora: NFS-e, gateway/pagamento online, portal do cliente, app nativo, vários funcionários, WhatsApp automático, estoque e comissões.
- Vários serviços por reserva; duração = soma; cada reserva cabe em um único dia.
- Serviços longos (ex.: vitrificação) têm `booking_mode = 'whatsapp'`: o site mostra "Conferir disponibilidade" e abre o WhatsApp; o proprietário lança o agendamento no painel (pode definir início/término manuais).
- Antecedência: mínimo 2 h, máximo 60 dias (configurável). Grade de 15 min + encaixe automático logo após o término de cada reserva/bloqueio.
- Placa NÃO é coletada.
- Telefone já cadastrado: por enquanto cada pedido do site cria um cliente novo; nada é mesclado/sobrescrito. Regra definitiva pendente com o proprietário.
- Antiabuso: rate limit por IP (5 pedidos/h), no máx. 2 pendentes por telefone (configurável) e honeypot. Sem CAPTCHA.
- Bloqueio sobre reservas ativas: cada conflito precisa ser cancelado ou reagendado; senão o bloqueio não é criado.
- Concluir antes do previsto libera o restante do horário.
- Pagamentos parciais e múltiplos por reserva; despesas com status "a pagar"; exportação CSV.
- Avisos de novas reservas: contador em tempo real + notificação do navegador com o painel aberto.
- Preços iniciais: referência de mercado (pesquisa nov/2026), marcados `is_demo` até revisão do proprietário. Categoria "Outros" sempre sob avaliação.
- Imagens: geradas por IA (via Lovable) só no hero, capas de serviço e ambientes. Galeria de trabalhos só com fotos reais (ou marcadas "ilustrativa").

## Onde ficam as regras críticas
- Agenda, preço, duração, antiabuso e permissões: `supabase/migrations/*.sql` (funções `get_available_slots`, `create_public_appointment`, `owner_*`). O frontend nunca recalcula essas regras.
- Erros de negócio saem do banco como códigos (`slot_unavailable`, …) e são traduzidos em `src/domain/errors.ts`.
- Testes do banco (agenda, concorrência, financeiro, RLS): `tests/db` — rodar `npm run test:db` com o Supabase local ativo.
