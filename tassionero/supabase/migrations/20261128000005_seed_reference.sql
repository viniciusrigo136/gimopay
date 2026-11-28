-- Tassionero — dados iniciais.
-- Expediente e categorias: valores iniciais aprovados (editáveis no painel).
-- Serviços e preços: REFERÊNCIA de mercado (pesquisa nov/2026), marcados is_demo = true
-- até o proprietário revisar. Exibidos no site como "valores de referência".

insert into public.business_settings (id, public_description, payment_instructions, booking_policy)
values (
  true,
  'Estética automotiva em União do Oeste/SC: lavagem detalhada, higienização, polimento e proteção de pintura com cuidado em cada detalhe.',
  'Pix: envie o comprovante pelo WhatsApp para conferência manual. Dinheiro: pagamento presencial na entrega do veículo.',
  'Sua solicitação fica reservada até a nossa confirmação pelo WhatsApp. Para cancelar ou remarcar, fale com a gente pelo WhatsApp.'
)
on conflict (id) do nothing;

insert into public.business_hours (weekday, is_open, opens_at, closes_at) values
  (0, false, null, null),
  (1, true, '08:00', '18:00'),
  (2, true, '08:00', '18:00'),
  (3, true, '08:00', '18:00'),
  (4, true, '08:00', '18:00'),
  (5, true, '08:00', '18:00'),
  (6, true, '08:00', '12:00')
on conflict (weekday) do nothing;

insert into public.vehicle_categories (name, slug, description, is_quote_only, sort_order) values
  ('Hatch / compacto', 'hatch', 'Gol, Onix, HB20, Argo, Polo…', false, 1),
  ('Sedan', 'sedan', 'Virtus, Cruze, Corolla, Civic…', false, 2),
  ('SUV', 'suv', 'T-Cross, Creta, Compass, Tracker…', false, 3),
  ('Picape', 'picape', 'Strada, Toro, Hilux, S10…', false, 4),
  ('Outros', 'outros', 'Vans, utilitários, motos e casos especiais', true, 5)
on conflict (slug) do nothing;

insert into public.services
  (name, slug, summary, description, category, duration_minutes, pricing_mode, base_price, booking_mode, is_featured, is_demo, sort_order)
values
  ('Lavagem simples', 'lavagem-simples',
   'Lavagem externa cuidadosa e aspiração interna.',
   'Pré-lavagem com espuma, lavagem técnica com luva de microfibra, limpeza de rodas e caixas, secagem sem riscos e aspiração do interior.',
   'Lavagem', 40, 'vehicle_category', null, 'online', true, true, 1),
  ('Lavagem detalhada', 'lavagem-detalhada',
   'Lavagem completa por dentro e por fora, com acabamento.',
   'Tudo da lavagem simples, mais limpeza de painel, portas, vidros por dentro, frisos, borrachas e pneus com acabamento. Ideal para manter o carro sempre impecável.',
   'Lavagem', 90, 'vehicle_category', null, 'online', true, true, 2),
  ('Limpeza de motor', 'limpeza-de-motor',
   'Desengraxe e proteção do cofre do motor.',
   'Limpeza com produtos específicos, proteção das partes elétricas e aplicação de revitalizador nos plásticos do cofre.',
   'Lavagem', 45, 'fixed', 80, 'online', false, true, 3),
  ('Higienização interna completa', 'higienizacao-interna',
   'Bancos, carpetes, teto e forros limpos a fundo.',
   'Extração em bancos e carpetes, limpeza de teto e forros, eliminação de odores e higienização de dutos. O valor final pode variar conforme o estado do interior.',
   'Interior', 240, 'mixed', null, 'online', true, true, 4),
  ('Hidratação de couro', 'hidratacao-de-couro',
   'Limpeza e hidratação dos bancos de couro.',
   'Limpeza com produto de pH neutro e hidratação que devolve maciez e protege contra ressecamento e rachaduras.',
   'Interior', 120, 'mixed', null, 'online', false, true, 5),
  ('Polimento de faróis', 'polimento-de-farois',
   'Faróis transparentes de novo, com proteção UV.',
   'Lixamento e polimento do par de faróis amarelados ou opacos, finalizado com proteção contra raios UV.',
   'Pintura', 60, 'fixed', 120, 'online', false, true, 6),
  ('Polimento técnico', 'polimento-tecnico',
   'Remove riscos leves e devolve o brilho da pintura.',
   'Descontaminação da pintura, polimento de corte e refino para remover marcas de lavagem, riscos leves e oxidação. O valor final depende da avaliação da pintura.',
   'Pintura', 300, 'mixed', null, 'online', true, true, 7),
  ('Vitrificação de pintura', 'vitrificacao',
   'Proteção cerâmica com brilho intenso e duradouro.',
   'Polimento de preparação e aplicação de revestimento cerâmico que protege a pintura contra sol, chuva ácida e sujeira, facilitando as lavagens. Serviço longo: confira a disponibilidade pelo WhatsApp.',
   'Proteção', 480, 'mixed', null, 'whatsapp', true, true, 8)
on conflict (slug) do nothing;

-- Preços de referência por categoria (Hatch, Sedan, SUV, Picape). "Outros" é sob avaliação.
insert into public.service_category_prices (service_id, vehicle_category_id, price)
select s.id, c.id, p.price
from (values
  ('lavagem-simples', 'hatch', 50), ('lavagem-simples', 'sedan', 55), ('lavagem-simples', 'suv', 65), ('lavagem-simples', 'picape', 70),
  ('lavagem-detalhada', 'hatch', 90), ('lavagem-detalhada', 'sedan', 100), ('lavagem-detalhada', 'suv', 120), ('lavagem-detalhada', 'picape', 130),
  ('higienizacao-interna', 'hatch', 280), ('higienizacao-interna', 'sedan', 300), ('higienizacao-interna', 'suv', 350), ('higienizacao-interna', 'picape', 380),
  ('hidratacao-de-couro', 'hatch', 200), ('hidratacao-de-couro', 'sedan', 220), ('hidratacao-de-couro', 'suv', 250), ('hidratacao-de-couro', 'picape', 280),
  ('polimento-tecnico', 'hatch', 400), ('polimento-tecnico', 'sedan', 450), ('polimento-tecnico', 'suv', 550), ('polimento-tecnico', 'picape', 600),
  ('vitrificacao', 'hatch', 1000), ('vitrificacao', 'sedan', 1200), ('vitrificacao', 'suv', 1400), ('vitrificacao', 'picape', 1600)
) as p (service_slug, category_slug, price)
join public.services s on s.slug = p.service_slug
join public.vehicle_categories c on c.slug = p.category_slug
on conflict (service_id, vehicle_category_id) do nothing;
