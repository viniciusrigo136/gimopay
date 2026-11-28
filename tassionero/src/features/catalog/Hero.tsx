import { Link } from "@tanstack/react-router";
import { m, useReducedMotion, type Transition } from "motion/react";
import { ArrowRight, CalendarCheck, Clock, MessageCircle } from "lucide-react";
import { Instagram } from "@/components/brand/social";
import { ServiceIcon } from "@/components/brand/icons";
import { ButtonLink } from "@/components/ui/Button";
import { media } from "@/config/media";
import type { PublicBusinessInfo, ServiceWithPrices, VehicleCategory } from "@/domain/types";
import { fmtDuration, weekdayOf } from "@/lib/datetime";
import { priceDisplay } from "./pricing";

const EASE = [0.16, 1, 0.3, 1] as const;

function todayStatus(info: PublicBusinessInfo) {
  const h = info.hours.find((x) => x.weekday === weekdayOf(info.today));
  if (!h?.is_open) return "Fechado hoje";
  return `Hoje das ${h.opens_at} às ${h.closes_at}`;
}

export function Hero({ info, featured, categories }: { info: PublicBusinessInfo; featured: ServiceWithPrices[]; categories: VehicleCategory[] }) {
  const reduce = useReducedMotion();
  const t = (delay: number, duration = 0.9): Transition => ({ delay: reduce ? 0 : delay, duration: reduce ? 0 : duration, ease: EASE });

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-carbon">
      <GarageScene />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col px-4 pt-28 sm:px-6 md:pt-28">
        {/* Coluna lateral esquerda: redes (desktop) */}
        {info.instagram_url ? (
          <div className="absolute top-1/2 left-6 hidden -translate-y-1/2 flex-col items-center gap-5 lg:flex">
            <a href={info.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-steel-400 hover:text-pearl">
              <Instagram className="size-4" />
            </a>
            <span className="h-16 w-px bg-white/15" aria-hidden />
            <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-medium tracking-[0.3em] text-steel-500">SIGA</span>
          </div>
        ) : null}

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <m.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={t(0.15, 0.7)}
            className="mb-5 text-xs font-semibold tracking-[0.2em] text-steel-300 sm:text-sm sm:tracking-[0.32em]"
          >
            <span className="hidden text-racing-400 sm:inline">ESTÉTICA AUTOMOTIVA EM </span>{info.city.toUpperCase()}
          </m.p>
          <h1 id="hero-title" className="text-hero font-black italic">
            <m.span className="block text-pearl sm:whitespace-nowrap" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={t(0.25)}>
              CUIDADO EM
            </m.span>
            <m.span
              className="block bg-[linear-gradient(180deg,#ffffff_0%,#c3c8cf_45%,#6b7280_100%)] bg-clip-text pr-[0.08em] pb-[0.06em] text-transparent sm:whitespace-nowrap"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={t(0.38)}
            >
              CADA DETALHE.
            </m.span>
          </h1>
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={t(0.6, 0.8)}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed font-light text-steel-300 sm:text-lg"
          >
            Lavagem, higienização, polimento e proteção de pintura. Veja os valores de referência e reserve seu horário online.
          </m.p>
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={t(0.7, 0.7)}
            className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <ButtonLink to="/agendar" size="lg" className="w-full sm:w-auto">
              <CalendarCheck className="size-5" aria-hidden /> Agendar serviço
            </ButtonLink>
            <ButtonLink to="/servicos" variant="outline" size="lg" className="w-full sm:w-auto">
              Ver serviços e preços <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </m.div>
        </div>

        {/* Carro: foto (quando houver) ou silhueta desenhada em luz */}
        <div className="relative z-0 mx-auto mt-4 w-full max-w-5xl flex-1 sm:-mt-2">
          {media.heroImage ? (
            <img
              src={media.heroImage}
              alt="Carro esportivo preto no estúdio da Tassionero"
              className="mx-auto w-full max-w-5xl object-contain"
              fetchPriority="high"
            />
          ) : (
            <CarLight reduce={!!reduce} />
          )}
        </div>

        {/* Coluna lateral direita: informações reais (desktop) */}
        <m.ul
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={t(1.4, 0.8)}
          className="absolute top-[34%] right-6 hidden w-40 space-y-6 2xl:block"
        >
          <li>
            <Clock className="mb-2 size-5 text-racing-400" aria-hidden />
            <p className="text-sm font-semibold text-pearl">{todayStatus(info)}</p>
            <p className="mt-0.5 text-xs text-steel-500">Horário de Brasília</p>
          </li>
          <li>
            <CalendarCheck className="mb-2 size-5 text-racing-400" aria-hidden />
            <p className="text-sm font-semibold text-pearl">Agenda online</p>
            <p className="mt-0.5 text-xs text-steel-500">Escolha o horário livre</p>
          </li>
          <li>
            <MessageCircle className="mb-2 size-5 text-racing-400" aria-hidden />
            <p className="text-sm font-semibold text-pearl">Confirmação no WhatsApp</p>
            <p className="mt-0.5 text-xs text-steel-500">Valor combinado antes</p>
          </li>
        </m.ul>

        {/* Faixa de serviços em destaque */}
        {featured.length ? (
          <m.nav
            aria-label="Serviços em destaque"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={t(1.1, 0.8)}
            className="relative z-10 -mx-4 mt-6 mb-0 overflow-x-auto px-4 pb-6 sm:mx-0 sm:px-0"
          >
            <ul className="grid min-w-[44rem] grid-cols-4 overflow-hidden rounded-t-panel border border-b-0 border-white/10 bg-graphite-900/80 backdrop-blur-md md:min-w-0">
              {featured.slice(0, 4).map((s) => {
                const price = priceDisplay(s, categories);
                return (
                  <li key={s.id} className="border-white/10 not-first:border-l">
                    <Link
                      to="/servicos/$slug"
                      params={{ slug: s.slug }}
                      className="group flex h-full gap-3 px-5 py-5 transition hover:bg-white/[0.04]"
                    >
                      <ServiceIcon category={s.category} className="mt-0.5 size-6 shrink-0 text-steel-300 transition group-hover:text-racing-400" strokeWidth={1.5} aria-hidden />
                      <span>
                        <span className="block text-sm font-bold text-pearl">{s.name}</span>
                        <span className="mt-1 block text-xs text-steel-400">
                          {fmtDuration(s.duration_minutes)} · {price.headline}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </m.nav>
        ) : null}
      </div>
    </section>
  );
}

/** Garagem escura com tubos de LED (CSS puro, sem imagem). */
function GarageScene() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* fundo: parede escura com leve luz central */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,#26282d_0%,#141518_45%,#0b0b0b_80%)]" />
      {/* painéis verticais da parede */}
      <div className="absolute inset-x-0 top-0 h-[68%] bg-[repeating-linear-gradient(90deg,transparent_0,transparent_119px,rgb(255_255_255/0.025)_119px,rgb(255_255_255/0.025)_120px)]" />

      {/* tubos do teto em diagonal */}
      <span className="light-tube absolute top-[8%] left-[-4%] h-[3px] w-[30%] sm:top-[13%] origin-left rotate-[14deg] opacity-0 animate-[tube-on_1.4s_0.1s_forwards]" />
      <span className="light-tube absolute top-[8%] right-[-4%] h-[3px] w-[30%] sm:top-[13%] origin-right -rotate-[14deg] opacity-0 animate-[tube-on_1.4s_0.25s_forwards]" />

      {/* tubos verticais na parede esquerda */}
      <div className="absolute top-[30%] left-[6%] hidden h-[34%] gap-[2.2vw] md:flex">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="light-tube block w-[3px] bg-[linear-gradient(180deg,transparent,#fff_10%,#fff_90%,transparent)] opacity-0"
            style={{ height: `${100 - i * 9}%`, marginTop: `${i * 4.5}%`, animation: `tube-on 1.2s ${0.35 + i * 0.12}s forwards` }}
          />
        ))}
      </div>
      {/* tubo vertical direito */}
      <span
        className="light-tube absolute top-[30%] right-[2.5%] hidden h-[32%] w-[3px] bg-[linear-gradient(180deg,transparent,#fff_10%,#fff_90%,transparent)] opacity-0 md:block"
        style={{ animation: "tube-on 1.2s 0.6s forwards" }}
      />

      {/* piso: concreto polido com reflexo */}
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(180deg,#0e0f11_0%,#16171a_30%,#0b0b0b_100%)]" />
      <div className="absolute inset-x-[15%] bottom-[16%] h-24 rounded-[50%] bg-white/[0.06] blur-3xl" />
      <div className="absolute inset-x-0 bottom-[37.8%] h-px bg-white/[0.06]" />
      {/* reflexos dos tubos no piso */}
      <div className="absolute bottom-[10%] left-[6%] hidden h-[22%] gap-[2.2vw] opacity-30 blur-[2px] md:flex">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="block w-[3px] bg-[linear-gradient(0deg,transparent,rgb(255_255_255/0.6))]" style={{ height: `${70 - i * 10}%` }} />
        ))}
      </div>
      <style>{`@keyframes tube-on{0%{opacity:0}18%{opacity:.9}24%{opacity:.25}34%{opacity:1}100%{opacity:1}}`}</style>
    </div>
  );
}

/** Silhueta do carro desenhada em luz (traço da identidade visual). */
function CarLight({ reduce }: { reduce: boolean }) {
  const draw = (delay: number, duration = 1.8) => ({
    initial: { pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { delay: reduce ? 0 : delay, duration: reduce ? 0 : duration, ease: EASE },
  });
  return (
    <svg viewBox="40 80 1120 300" className="mx-auto h-auto w-full max-w-5xl overflow-visible" role="img" aria-label="Silhueta de carro esportivo desenhada em luz">
      <defs>
        <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2c31" />
          <stop offset="0.55" stopColor="#141518" />
          <stop offset="1" stopColor="#0b0b0b" />
        </linearGradient>
        <linearGradient id="roofline" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.45" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="floorglow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id="glow" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="redglow" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* sombra no piso */}
      <ellipse cx="610" cy="352" rx="560" ry="26" fill="url(#floorglow)" />
      <ellipse cx="610" cy="350" rx="500" ry="12" fill="#000" opacity="0.75" />

      {/* carroceria */}
      <m.path
        d="M120 300 C110 270 112 240 130 222 C180 205 260 196 330 190 C400 150 470 112 560 102 C640 94 720 98 780 118 C830 140 870 168 905 182 C980 192 1060 202 1095 222 C1110 232 1112 258 1100 282 L1040 292 A70 70 0 0 0 900 292 L400 296 A70 70 0 0 0 260 298 Z"
        fill="url(#body)"
        initial={{ opacity: reduce ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 1.3, duration: reduce ? 0 : 1.2 }}
      />
      {/* vidros */}
      <m.path
        d="M440 184 C490 142 548 120 612 116 C676 112 728 120 768 142 L796 178 Z"
        fill="#07080a"
        stroke="#3b3e45"
        strokeWidth="1.5"
        initial={{ opacity: reduce ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 1.5, duration: reduce ? 0 : 1 }}
      />
      {/* rodas */}
      {[330, 970].map((cx, i) => (
        <m.g key={cx} initial={{ opacity: reduce ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 1.4 + i * 0.1, duration: reduce ? 0 : 0.9 }}>
          <circle cx={cx} cy="300" r="58" fill="#0b0b0b" stroke="#2e3036" strokeWidth="6" />
          <circle cx={cx} cy="300" r="38" fill="none" stroke="#6b7280" strokeWidth="2" />
          {[0, 72, 144, 216, 288].map((a) => (
            <line
              key={a}
              x1={cx}
              y1="300"
              x2={cx + 34 * Math.cos((a * Math.PI) / 180)}
              y2={300 + 34 * Math.sin((a * Math.PI) / 180)}
              stroke="#9ca3af"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
          <circle cx={cx} cy="300" r="7" fill="#e10600" />
        </m.g>
      ))}

      {/* linha de luz do teto (assinatura) */}
      <m.path
        d="M70 232 C150 210 250 196 330 190 C400 150 470 112 560 102 C640 94 720 98 780 118 C830 140 870 168 905 182 C980 192 1060 202 1130 226"
        fill="none"
        stroke="url(#roofline)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#glow)"
        {...draw(0.55, 2)}
      />
      {/* vinco lateral */}
      <m.path d="M170 238 C400 218 800 210 1080 230" fill="none" stroke="#c3c8cf" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" {...draw(1.2, 1.6)} />
      {/* lanterna traseira */}
      <m.path
        d="M126 232 L196 222"
        stroke="#e10600"
        strokeWidth="5"
        strokeLinecap="round"
        initial={{ opacity: reduce ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 1.9, duration: reduce ? 0 : 0.6 }}
      />
      <m.path
        d="M126 232 L196 222"
        stroke="#ff2b1c"
        strokeWidth="14"
        strokeLinecap="round"
        filter="url(#redglow)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ delay: reduce ? 0 : 2, duration: reduce ? 0 : 0.8 }}
      />
      {/* farol com brilho */}
      <m.g
        initial={{ opacity: 0, scale: reduce ? 1 : 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduce ? 0 : 2.3, duration: reduce ? 0 : 0.6, ease: EASE }}
        style={{ transformOrigin: "1092px 214px" }}
      >
        <path d="M1092 190 L1096 210 L1116 214 L1096 218 L1092 238 L1088 218 L1068 214 L1088 210 Z" fill="#fff" />
        <circle cx="1092" cy="214" r="10" fill="#fff" opacity="0.5" filter="url(#glow)" />
      </m.g>
    </svg>
  );
}
