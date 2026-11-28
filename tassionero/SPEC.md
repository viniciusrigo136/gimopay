# SPEC.md — Tassionero Estética Automotiva

**Versão:** 1.1 — decisões de 28/11/2026 registradas em CLAUDE.md (seção "Decisões aprovadas")  
**Negócio:** Tassionero Estética Automotiva  
**Localização:** União do Oeste, Santa Catarina, Brasil  
**Fuso horário:** America/Sao_Paulo  
**Plataforma:** aplicação web desenvolvida com Claude Code e conectada/publicada com Lovable Cloud.

---

## 1. Visão do produto

Construir uma aplicação para apresentar os serviços da Tassionero Estética Automotiva, permitir que clientes solicitem agendamentos diretamente pelo site e oferecer ao proprietário um painel administrativo para controlar agenda, clientes, veículos, serviços e financeiro.

O sistema não é uma plataforma multiempresa no MVP. Existe um único negócio, um proprietário e uma agenda.

### Objetivos
- Apresentar serviços, preços de referência, duração e fotos.
- Permitir que o cliente escolha serviço, veículo, data, horário e forma de pagamento.
- Calcular disponibilidade com base na duração real dos serviços.
- Impedir reservas sobrepostas, inclusive quando duas pessoas tentam reservar ao mesmo tempo.
- Manter reservas pendentes bloqueando o horário até decisão do proprietário.
- Permitir ao proprietário revisar o pedido, ajustar o preço final e confirmar pelo WhatsApp.
- Registrar receitas e despesas de forma correta e gerar indicadores financeiros.

### Fora do escopo inicial
- Aplicativo nativo iOS/Android.
- Vários funcionários, boxes ou filiais.
- Pagamento online, gateway, cobrança automática ou conciliação bancária.
- Envio automático de WhatsApp por API.
- Emissão fiscal/NFS-e.
- Estoque de produtos e comissão de funcionários.
- Portal do cliente com login.
Esses itens podem ser avaliados em versões futuras.

---

## 2. Perfis e permissões

### Visitante/cliente
Pode:
- Ver páginas públicas, serviços ativos, preços públicos, galeria publicada e informações de contato.
- Consultar horários disponíveis.
- Criar uma reserva informando nome, telefone, veículo, serviço, data, horário e pagamento.
- Ver instruções de Pix ou pagamento em dinheiro após concluir a solicitação.
- Abrir WhatsApp para falar com a empresa e enviar comprovante ou solicitar cancelamento.

Não pode:
- Ver reservas de outras pessoas.
- Consultar dados de clientes.
- Alterar ou cancelar diretamente uma reserva no banco.
- Acessar painel, transações ou configurações privadas.

### Proprietário
Acesso autenticado ao painel para:
- Consultar e administrar todos os agendamentos.
- Confirmar, recusar, cancelar e reagendar.
- Ajustar preço final.
- Cadastrar serviços, preços e durações.
- Cadastrar/consultar clientes e veículos.
- Bloquear períodos.
- Registrar pagamentos, receitas e despesas.
- Consultar relatórios.
- Alterar expediente, chave Pix, WhatsApp e dados públicos da empresa.

No MVP, criar apenas um usuário administrativo. Não disponibilizar cadastro público de administradores.

---

## 3. Mapa do site e navegação

### Área pública
1. `/` — início
2. `/servicos` — catálogo
3. `/servicos/:slug` — detalhe de serviço
4. `/galeria` — trabalhos realizados
5. `/agendar` — fluxo de agendamento
6. `/agendamento/confirmacao` — resumo da solicitação e instruções
7. `/contato` — WhatsApp, localização e informações

### Área administrativa
1. `/admin/login`
2. `/admin` — dashboard
3. `/admin/agenda`
4. `/admin/agendamentos`
5. `/admin/clientes`
6. `/admin/veiculos`
7. `/admin/servicos`
8. `/admin/financeiro`
9. `/admin/relatorios`
10. `/admin/galeria`
11. `/admin/configuracoes`

Proteger todas as rotas `/admin/*` no frontend e, principalmente, no backend por autenticação e RLS.

---

## 4. Site público

### 4.1 Página inicial
- Identidade visual premium e automotiva.
- Hero com foto/vídeo otimizado de estética automotiva.
- Chamada principal e CTA “Agendar serviço”.
- Serviços em destaque.
- Galeria/antes e depois.
- Diferenciais da empresa.
- Localização e contato.
- CTA de WhatsApp.
- Rodapé com dados da empresa e links.

### 4.2 Catálogo
Cada serviço deve apresentar:
- Nome.
- Categoria.
- Foto/capa.
- Descrição.
- Duração estimada.
- Preço ou indicação “a partir de”.
- Nota de que o valor pode variar conforme veículo/avaliação, quando aplicável.
- Botão para agendar.

Serviços inativos não aparecem no catálogo público.

### 4.3 Modalidades de preço
O serviço pode usar uma destas modalidades:
1. `fixed`: preço único.
2. `vehicle_category`: preço conforme categoria do veículo.
3. `quote`: sob avaliação, sem preço fechado público.
4. `mixed`: preço base e/ou valores por categoria, sujeito a ajuste após avaliação.

Categorias iniciais sugeridas, editáveis pelo proprietário:
- Hatch/compacto.
- Sedan.
- SUV.
- Picape.
- Outros.

Não presumir que as categorias e preços estão aprovados: o proprietário deverá cadastrar/ajustar a tabela real.

O catálogo deve deixar claro quando o preço é apenas referência. O valor final confirmado pelo proprietário é salvo no agendamento sem modificar o preço-base do serviço.

---

## 5. Fluxo de agendamento do cliente

### Etapas
1. Selecionar um ou mais serviços (se a implementação inicial suportar múltiplos; caso contrário, começar com um serviço por reserva e manter o modelo extensível).
2. Informar veículo: categoria e marca/modelo. (Decisão: placa não é coletada.)
3. Informar nome e telefone/WhatsApp.
4. Escolher data.
5. Consultar e escolher um horário disponível.
6. Escolher pagamento: Pix ou dinheiro.
7. Revisar resumo e enviar solicitação.
8. Receber número de protocolo, resumo, status pendente e instruções de pagamento.

### Dados mínimos
- Nome do cliente.
- Telefone/WhatsApp.
- Categoria do veículo.
- Marca/modelo ou descrição do veículo.
- Placa opcional.
- Serviço(s).
- Data e hora de início.
- Forma de pagamento.

### Tela final
Mostrar:
- Código da reserva.
- Serviço(s) solicitado(s).
- Veículo.
- Data e horário.
- Duração prevista.
- Preço de referência ou “sob avaliação”.
- Forma de pagamento escolhida.
- Status: “Aguardando confirmação da Tassionero”.
- Aviso de que a reserva só está confirmada após retorno do proprietário.

Se Pix:
- Exibir chave Pix e tipo/chave conforme configuração.
- Botão “Copiar chave Pix”.
- Botão “Enviar comprovante pelo WhatsApp”.
- Informar que o pagamento será conferido manualmente.
Não afirmar que o pagamento foi recebido só porque o cliente abriu o WhatsApp.

Se dinheiro:
- Informar que o pagamento será presencial, conforme combinado com a empresa.

### Cancelamento
O cliente solicita cancelamento pelo WhatsApp. O proprietário localiza a reserva e atualiza o status no painel. Não oferecer cancelamento automático pelo cliente no MVP.

---

## 6. Agenda e motor de disponibilidade

Esta é a regra central do produto.

### 6.1 Expediente inicial
- Segunda a sexta: 08:00–18:00.
- Sábado: 08:00–12:00.
- Domingo: fechado.
- Sem intervalo interno inicialmente.
- Fuso: `America/Sao_Paulo`.

O expediente deve ser configurável no painel.

### 6.2 Duração
Cada serviço possui duração estimada em minutos. Para múltiplos serviços na mesma reserva, somar as durações. Se houver serviços simultâneos ou dependências no futuro, isso exigirá regra explícita; no MVP, considerar execução sequencial.

### 6.3 Geração de horários
- O cliente escolhe uma data.
- O servidor consulta expediente, bloqueios e agendamentos que ocupam a agenda.
- Gerar possíveis horários de início usando um intervalo configurável (sugestão inicial: passos de 15 minutos).
- Um horário só é válido se `início + duração_total` couber integralmente no expediente e não sobrepor bloqueio ou reserva ativa.
- A última reserva do dia deve terminar até o encerramento.
- Não criar horários que comecem antes da abertura ou terminem depois do fechamento.
- Recalcular disponibilidade no momento de criar a reserva; a lista exibida no navegador pode ficar desatualizada.

### 6.4 Exemplo
Expediente 08:00–18:00:
- Lavagem com duração de 40 min, início 08:00, termina 08:40.
- Próximo serviço de 2h pode começar 08:40, se não houver outro bloqueio.
- Um serviço de 40 min pode começar 10:40 e terminar 11:20.

O sistema não deve usar intervalos fixos de uma hora para todos os serviços.

### 6.5 Status que bloqueiam a agenda
Bloqueiam:
- `pending` — aguardando decisão do proprietário.
- `confirmed` — confirmado.
- `in_progress` — em andamento.

Não bloqueiam:
- `rejected`.
- `cancelled`.
- `completed` após o horário reservado terminar.
A implementação deve evitar que registros concluídos antigos continuem bloqueando horários futuros.

### 6.6 Reserva provisória sem expiração
Decisão do negócio: reserva pendente bloqueia o horário até o proprietário confirmar ou recusar. Não expira automaticamente.

Consequências operacionais:
- Mostrar pendências em destaque no dashboard.
- Mostrar há quanto tempo cada reserva está pendente.
- Alertar o proprietário sobre pendências antigas.
- Oferecer ações rápidas confirmar/recusar.
- O proprietário deve recusar ou cancelar pedidos que não serão atendidos para liberar o horário.
- Não implementar expiração automática nem liberar horário apenas por decurso de tempo.

### 6.7 Concorrência e integridade
A criação da reserva deve ser atômica:
- Validar novamente expediente, duração, bloqueios e sobreposições no banco/servidor.
- Duas solicitações simultâneas para intervalos incompatíveis: apenas uma deve ser criada.
- Preferir uma função PostgreSQL/RPC transacional ou Edge Function que chame operação transacional no banco.
- Considerar constraint de exclusão com range de tempo para estados ativos, ou lock transacional por data/recurso, conforme viabilidade do schema.
- Não confiar em uma verificação feita somente no frontend.
- Retornar erro amigável de “horário acabou de ser reservado; escolha outro” quando houver conflito.

### 6.8 Bloqueios
O proprietário pode bloquear:
- Período específico.
- Dia inteiro.
- Motivo/observação.
Bloqueios não podem ser criados sobre reservas ativas sem uma confirmação explícita e tratamento das reservas conflitantes.

---

## 7. Painel administrativo

### 7.1 Dashboard
Cards/indicadores:
- Agendamentos de hoje.
- Próximos agendamentos.
- Reservas pendentes de confirmação.
- Serviços concluídos no mês.
- Receita recebida no mês.
- Despesas no mês.
- Resultado operacional do período.
- Valores a receber/pendências de pagamento.

Gráficos:
- Receitas e despesas por mês.
- Serviços mais realizados.
- Quantidade de agendamentos por período.

Filtros por período. Distinguir receita recebida de valor previsto.

### 7.2 Agenda
- Visualização dia/semana/mês.
- Lista de agendamentos.
- Cores por status.
- Exibir cliente, veículo, serviço, duração e preço final.
- Abrir detalhes.
- Confirmar, recusar, cancelar, reagendar.
- Marcar início e conclusão.
- Criar bloqueio.
- Não permitir edição que gere sobreposição sem aviso e validação.

### 7.3 Detalhe do agendamento
- Código.
- Dados do cliente e veículo.
- Serviços e duração.
- Data/hora inicial e final.
- Preço de referência.
- Preço final editável.
- Forma de pagamento.
- Status do pagamento.
- Status operacional.
- Observações internas.
- Histórico de alterações.
- Ações WhatsApp.

### 7.4 Confirmação via WhatsApp
Botão no painel abre `wa.me` com telefone e mensagem codificada. A mensagem deve conter:
- Nome do cliente.
- Serviço.
- Veículo.
- Data e horário.
- Duração.
- Valor final.
- Orientação de pagamento.
- Dados Pix, se aplicável.

O proprietário revisa e envia manualmente. Após envio, o proprietário atualiza o status para confirmado. Não inferir que mensagem foi enviada apenas porque a janela abriu.

### 7.5 Clientes
- Nome.
- Telefone.
- Data de cadastro.
- Observações.
- Lista de veículos.
- Histórico de agendamentos.
- Total pago/recebido registrado.
- Busca por nome ou telefone.

### 7.6 Veículos
- Cliente relacionado.
- Categoria.
- Marca.
- Modelo.
- Ano (opcional).
- Placa (opcional).
- Cor (opcional).
- Observações.

### 7.7 Serviços
- Nome, slug e descrição.
- Categoria.
- Foto/capa.
- Duração em minutos.
- Modalidade de preço.
- Preço base.
- Preços por categoria.
- Ativo/inativo.
- Destaque no site.
- Ordem de exibição.
- Observações internas.

### 7.8 Galeria
- Upload de imagem.
- Título/descrição.
- Serviço relacionado (opcional).
- Imagem antes/depois (se houver).
- Publicado/não publicado.
- Ordenação.
Armazenar imagens no Storage com regras adequadas. Otimizar imagens para o site.

---

## 8. Financeiro

### 8.1 Princípios
- Reserva não é receita.
- Preço final do serviço não significa pagamento recebido.
- Receita é reconhecida no controle gerencial quando o pagamento é registrado como recebido.
- Despesa é registrada quando paga; se houver contas a pagar no futuro, separar vencimento de pagamento.
- Não calcular “lucro” como faturamento agendado menos despesas pagas sem explicar a base.

### 8.2 MVP financeiro
Receitas:
- Associadas a agendamento ou lançamento manual.
- Valor.
- Data de recebimento.
- Forma: Pix, dinheiro, cartão, outro.
- Status: recebido/pendente, conforme o modelo adotado.
- Descrição e observação.

Despesas:
- Descrição.
- Categoria.
- Valor.
- Data da despesa/pagamento.
- Status, inicialmente paga ou pendente se o módulo de contas a pagar for implementado.
- Forma de pagamento.
- Observações.

Indicadores:
- Total recebido no período.
- Total de despesas pagas no período.
- Resultado operacional gerencial = receitas recebidas – despesas pagas.
- Valores pendentes de clientes.
- Receita por serviço.
- Despesas por categoria.

Filtros por mês, intervalo, tipo e forma de pagamento.

### 8.3 Pagamentos
O cliente escolhe Pix ou dinheiro no agendamento. O proprietário registra manualmente o recebimento no painel:
- Valor efetivamente recebido.
- Data.
- Método.
- Referência ao agendamento.
- Observação.

Permitir pagamento parcial e múltiplos pagamentos por agendamento se possível; caso contrário, documentar a limitação inicial e não marcar como quitado antes de receber o total.

Não integrar API bancária/gateway no MVP.

---

## 9. Configurações

- Nome e descrição da empresa.
- WhatsApp comercial com DDI/DDD.
- Endereço e link de mapa.
- Horários por dia da semana.
- Intervalo de geração de horários (default sugerido: 15 min).
- Chave Pix e tipo da chave.
- Nome do titular (opcional, para exibição).
- Instruções de pagamento.
- Política de agendamento/cancelamento.
- Logo, cores e imagens.
- Redes sociais.

Dados privados como chave Pix completa devem ser entregues somente quando necessário para a tela de pagamento e nunca embutidos no código-fonte.

---

## 10. Modelo de dados sugerido

O schema final deve ser criado por migrações. Nomes abaixo são sugestões e podem ser ajustados à convenção do projeto.

### `profiles`
- `id` UUID PK, referência ao usuário Auth.
- `full_name`.
- `role` (no MVP: `owner`).
- `created_at`, `updated_at`.

### `business_settings`
- `id` UUID PK.
- `business_name`.
- `public_description`.
- `whatsapp_phone`.
- `address`.
- `pix_key`.
- `pix_key_type`.
- `pix_holder_name`.
- `timezone` default `America/Sao_Paulo`.
- `slot_interval_minutes` default 15.
- `created_at`, `updated_at`.

### `business_hours`
- `id` UUID PK.
- `weekday` (0–6 com convenção documentada).
- `is_open`.
- `opens_at`.
- `closes_at`.
- Unique por dia da semana.

Seed inicial:
- Segunda a sexta 08:00–18:00.
- Sábado 08:00–12:00.
- Domingo fechado.

### `vehicle_categories`
- `id` UUID PK.
- `name`.
- `slug`.
- `is_active`.
- `sort_order`.

### `services`
- `id` UUID PK.
- `name`, `slug`, `description`.
- `category`.
- `duration_minutes` inteiro positivo.
- `pricing_mode` (`fixed`, `vehicle_category`, `quote`, `mixed`).
- `base_price` numeric nullable.
- `cover_image_path`.
- `is_active`, `is_featured`, `sort_order`.
- `created_at`, `updated_at`.

### `service_category_prices`
- `id` UUID PK.
- `service_id` FK.
- `vehicle_category_id` FK.
- `price` numeric >= 0.
- Unique (`service_id`, `vehicle_category_id`).

### `customers`
- `id` UUID PK.
- `name`.
- `phone` normalizado.
- `notes`.
- `created_at`, `updated_at`.

### `vehicles`
- `id` UUID PK.
- `customer_id` FK.
- `vehicle_category_id` FK.
- `make`, `model`.
- `year` nullable.
- `plate` nullable.
- `color` nullable.
- `notes`.
- `created_at`, `updated_at`.

### `appointments`
- `id` UUID PK.
- `public_code` único e não sequencial/previsível.
- `customer_id` FK.
- `vehicle_id` FK.
- `starts_at`, `ends_at` `timestamptz`.
- `status`: `pending`, `confirmed`, `in_progress`, `completed`, `rejected`, `cancelled`.
- `payment_method`: `pix`, `cash`.
- `payment_status`: `unpaid`, `partially_paid`, `paid`, `refunded` (se necessário).
- `reference_total` numeric.
- `final_total` numeric nullable até avaliação/confirmação.
- `customer_notes`.
- `internal_notes`.
- `created_at`, `updated_at`.

### `appointment_items`
- `id` UUID PK.
- `appointment_id` FK.
- `service_id` FK.
- `service_name_snapshot`.
- `duration_minutes_snapshot`.
- `reference_price_snapshot`.
- `final_price` nullable.
- Guardar snapshots para que alterações futuras no catálogo não modifiquem o histórico.

### `blocked_periods`
- `id` UUID PK.
- `starts_at`, `ends_at` `timestamptz`.
- `reason`.
- `created_by`.
- `created_at`.

### `transactions`
- `id` UUID PK.
- `appointment_id` FK nullable.
- `type`: `income` ou `expense`.
- `description`.
- `category`.
- `amount` numeric > 0.
- `payment_method`.
- `status`: `pending`, `paid`, `cancelled`.
- `occurred_at`/`paid_at`.
- `notes`.
- `created_at`, `updated_at`.

### `gallery_items`
- `id` UUID PK.
- `title`, `description`.
- `image_path`.
- `before_image_path`, `after_image_path` opcionais.
- `service_id` nullable.
- `is_published`.
- `sort_order`.
- `created_at`, `updated_at`.

### `appointment_status_history`
- `id` UUID PK.
- `appointment_id` FK.
- `old_status`, `new_status`.
- `changed_by`.
- `note`.
- `created_at`.

### Observações do modelo
- Usar `numeric`/decimal para dinheiro, nunca float.
- Usar FK, índices e constraints.
- Normalizar telefone para formato internacional E.164 quando possível.
- Placa não deve ser obrigatória; validar e normalizar se informada.
- Evitar armazenar dados pessoais duplicados sem necessidade.
- Histórico/snapshots preservam os valores usados na data do agendamento.

---

## 11. API/RPC e operações críticas

Operações sugeridas:
- `get_available_slots(date, service_ids, vehicle_category_id)`: consulta slots disponíveis, sem expor reservas de terceiros.
- `create_public_appointment(payload)`: valida dados, recalcula duração/preço, verifica expediente/bloqueios/conflitos e cria cliente/veículo/reserva em transação.
- `owner_update_appointment_status(id, status, note)`: ação autenticada com validação de transição.
- `owner_reschedule_appointment(id, new_start)`: recalcula término e valida conflito.
- `owner_update_final_price(id, amount)`: registra valor final e histórico.
- `owner_register_payment(appointment_id, amount, method, paid_at)`: cria registro financeiro.
- `owner_create_block(start, end, reason)`: valida conflitos e cria bloqueio.

Todas as operações `owner_*` devem validar autenticação e autorização. Operações públicas devem aceitar somente campos permitidos e aplicar proteção contra abuso.

---

## 12. Segurança, RLS e proteção contra abuso

- RLS habilitada em todas as tabelas acessíveis pela API.
- Visitantes não podem fazer SELECT de `appointments`, `customers`, `vehicles`, `transactions` ou dados privados.
- Serviços ativos e conteúdo publicado podem ser lidos publicamente.
- Criar reserva pública somente por RPC/Edge Function controlada, com validação de schema e limites de frequência.
- Proprietário autenticado pode ler e administrar dados privados.
- Não confiar em `user_id` fornecido pelo navegador.
- Não expor `service_role` no frontend.
- Storage: imagens públicas de catálogo/galeria podem ter leitura pública; uploads administrativos exigem autenticação. Separar buckets/pastas conforme necessário.
- Adicionar proteção anti-spam no formulário público (rate limit e, se necessário, CAPTCHA).
- Validar telefone, texto, preço, duração, data e IDs no servidor.
- Registrar ações administrativas relevantes sem armazenar conteúdo sensível desnecessário.

---

## 13. Identidade visual e UX

Direção proposta:
- Premium, limpa e automotiva.
- Preto/grafite como base.
- Branco para legibilidade.
- Dourado ou cobre discreto como acento (a confirmar com o cliente).
- Fotografia real da empresa/serviços como prioridade.
- Evitar excesso de cards, gradientes exagerados e estética genérica de dashboard.

### Site
- Mobile-first.
- CTA de agendamento sempre fácil de encontrar.
- Preços e duração legíveis.
- Explicar quando o valor é estimado/sob avaliação.
- Formulário dividido em etapas curtas.
- Mostrar progresso e resumo antes de enviar.

### Painel
- Navegação lateral em desktop e navegação adaptada no celular.
- Dashboard objetivo.
- Agenda com leitura rápida dos horários e status.
- Ações importantes com confirmação.
- Busca e filtros.
- Estados de carregamento, erro, vazio e sucesso.

---

## 14. Testes obrigatórios

### Agenda
- Serviço de 40 min às 08:00 termina 08:40.
- Serviço seguinte pode iniciar 08:40 se o slot estiver livre.
- Serviço que ultrapassa o fechamento não aparece.
- Domingo não oferece horários.
- Sábado respeita 12:00 como encerramento.
- Reserva `pending` bloqueia horário.
- Reserva `rejected` ou `cancelled` libera horário.
- Bloqueio impede reserva.
- Duas requisições concorrentes para o mesmo período: somente uma é aceita.
- Reagendamento verifica conflitos.
- Mudança de duração no catálogo não altera duração snapshot de reservas antigas.

### Financeiro
- Criar reserva não gera receita.
- Confirmar agendamento não gera receita.
- Registrar pagamento gera entrada financeira.
- Despesa reduz resultado operacional.
- Pagamento parcial não marca reserva como quitada.
- Cancelar reserva não apaga transações existentes; estorno deve ser explícito.

### Segurança
- Visitante não lê reservas ou clientes.
- Visitante não acessa painel.
- Proprietário autenticado consegue administrar dados.
- Usuário não autorizado não altera dados via chamada direta à API.
- Nenhuma chave privada no bundle do frontend.

### Interface
- Fluxos funcionam em celular e desktop.
- Formulários validam campos.
- Mensagens de erro são compreensíveis.
- Navegação por teclado e foco visível.
- Imagens otimizadas e carregamento razoável.

---

## 15. Fases de implementação

### Fase 0 — Auditoria e fundação
- Inspecionar repositório.
- Definir estrutura de pastas, rotas, tokens de design e componentes.
- Configurar lint, typecheck e testes.
- Criar este documento e `CLAUDE.md`.

### Fase 1 — Site público
- Home, catálogo, detalhes, galeria e contato.
- Conteúdo inicial de demonstração identificado como provisório.
- Sem fluxo de reserva real ainda.

### Fase 2 — Backend e segurança
- Conectar Lovable Cloud.
- Criar migrações, Auth, RLS e Storage.
- Seed de expediente e categorias.
- Criar usuário proprietário com processo seguro.

### Fase 3 — Agendamento
- Formulário em etapas.
- Consulta de slots.
- RPC/Edge Function para reserva atômica.
- Estados pendente e confirmação administrativa.
- Testes de concorrência e expediente.

### Fase 4 — Painel operacional
- Dashboard.
- Agenda.
- Serviços e preços.
- Clientes e veículos.
- Bloqueios e histórico.
- WhatsApp com mensagem pré-preenchida.

### Fase 5 — Financeiro
- Receitas e despesas.
- Registro de pagamentos.
- Indicadores e relatórios.
- Testes de consistência.

### Fase 6 — Finalização
- Pix informativo.
- Galeria administrável.
- Responsividade e acessibilidade.
- Revisão de RLS.
- Testes ponta a ponta.
- Preparação para publicação no Lovable Cloud.

---

## 16. Decisões ainda pendentes

Não inventar esses dados. Deixar configuráveis ou usar placeholders até o proprietário fornecer:
- Logo e identidade visual final.
- WhatsApp comercial.
- Chave Pix e tipo da chave.
- Endereço completo e link de localização.
- Lista real de serviços.
- Preços reais por categoria.
- Duração de cada serviço.
- Categorias finais de veículos.
- Fotografias reais e textos comerciais.
- Intervalo preferido para oferecer horários (15 minutos é sugestão inicial).
- Se o cliente poderá selecionar vários serviços no mesmo agendamento.
- Política de antecedência mínima/máxima para agendar.
- Se haverá prazo mínimo para solicitar cancelamento (mesmo que o pedido seja por WhatsApp).

Até essas definições serem fornecidas, construir a estrutura configurável e não publicar dados fictícios como se fossem reais.

---

## 17. Definição de pronto

O MVP só pode ser considerado pronto quando:
1. O site público apresenta dados reais e permite solicitar agendamento.
2. O sistema calcula horários pela duração real dos serviços.
3. Reservas pendentes bloqueiam horários até decisão do proprietário.
4. Não existem conflitos de agenda em requisições simultâneas.
5. O proprietário consegue administrar serviços, preços, agenda, clientes e veículos.
6. O proprietário consegue confirmar/recusar e enviar mensagem preparada pelo WhatsApp.
7. Pix e dinheiro aparecem corretamente como opções, sem alegar pagamento automático.
8. Receitas e despesas são registradas separadamente.
9. Painel e dados privados estão protegidos por autenticação e RLS.
10. Testes essenciais passam e a aplicação funciona em celular e desktop.
