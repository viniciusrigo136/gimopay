import { useState } from "react";
import { fmtMoney, fmtMoneyShort } from "@/lib/money";
import { cn } from "@/lib/cn";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export const monthLabel = (ym: string) => `${MONTHS[Number(ym.slice(5, 7)) - 1]}/${ym.slice(2, 4)}`;

/**
 * Receitas x despesas por mês: barras agrupadas, um eixo (R$), legenda + tooltip e tabela acessível.
 * Cores: tokens chart-income / chart-expense (validados para daltonismo no tema escuro).
 */
export function IncomeExpenseChart({ data }: { data: { month: string; income: number; expense: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.flatMap((d) => [Number(d.income), Number(d.expense)]));
  const nice = niceMax(max);
  const ticks = [0, nice / 2, nice];
  const h = 200;

  return (
    <figure>
      <div className="mb-3 flex gap-4 text-xs text-steel-300">
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-chart-income" /> Receitas recebidas</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-chart-expense" /> Despesas pagas</span>
      </div>
      <div className="relative flex gap-2">
        <div className="relative w-12 shrink-0 text-right text-[11px] text-steel-500" style={{ height: h }} aria-hidden>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: h - (t / nice) * h }}>
              {fmtMoneyShort(t)}
            </span>
          ))}
        </div>
        <div className="relative flex-1" style={{ height: h }}>
          {ticks.map((t) => (
            <span key={t} className="absolute inset-x-0 h-px bg-white/[0.06]" style={{ top: h - (t / nice) * h }} aria-hidden />
          ))}
          <div className="absolute inset-0 flex items-end gap-1 sm:gap-2">
            {data.map((d, i) => (
              <div
                key={d.month}
                className={cn("relative flex h-full flex-1 items-end justify-center gap-[2px] rounded-md", hover === i && "bg-white/[0.04]")}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${monthLabel(d.month)}: receitas ${fmtMoney(d.income)}, despesas ${fmtMoney(d.expense)}`}
              >
                <span className="w-[38%] max-w-4 rounded-t-[4px] bg-chart-income" style={{ height: `${(Number(d.income) / nice) * 100}%` }} />
                <span className="w-[38%] max-w-4 rounded-t-[4px] bg-chart-expense" style={{ height: `${(Number(d.expense) / nice) * 100}%` }} />
                {hover === i ? (
                  <div role="tooltip" className="pointer-events-none absolute bottom-full z-10 mb-2 w-44 rounded-control bg-graphite-700 p-3 text-xs shadow-panel">
                    <p className="mb-1 font-bold">{monthLabel(d.month)}</p>
                    <p className="flex justify-between"><span className="text-steel-400">Receitas</span> {fmtMoney(d.income)}</p>
                    <p className="flex justify-between"><span className="text-steel-400">Despesas</span> {fmtMoney(d.expense)}</p>
                    <p className="mt-1 flex justify-between border-t border-white/10 pt-1 font-semibold"><span className="text-steel-400">Resultado</span> {fmtMoney(Number(d.income) - Number(d.expense))}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 ml-14 flex gap-1 text-center text-[11px] text-steel-500 sm:gap-2" aria-hidden>
        {data.map((d) => (
          <span key={d.month} className="flex-1 truncate">{monthLabel(d.month)}</span>
        ))}
      </div>
      <details className="mt-3 text-xs text-steel-400">
        <summary className="cursor-pointer hover:text-pearl">Ver como tabela</summary>
        <table className="mt-2 w-full">
          <thead><tr className="text-left text-steel-500"><th className="py-1">Mês</th><th className="text-right">Receitas</th><th className="text-right">Despesas</th></tr></thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.month} className="border-t border-white/5"><td className="py-1">{monthLabel(d.month)}</td><td className="text-right">{fmtMoney(d.income)}</td><td className="text-right">{fmtMoney(d.expense)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** Barras horizontais de uma série (ranking). Valor em texto ao lado de cada barra. */
export function HBarList({ rows, format = (n: number) => String(n), empty = "Sem dados no período." }: { rows: { label: string; value: number }[]; format?: (n: number) => string; empty?: string }) {
  if (!rows.length) return <p className="py-6 text-center text-sm text-steel-500">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="truncate text-steel-200">{r.label}</span>
            <span className="font-semibold tabular-nums">{format(r.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.05]">
            <div className="h-2 rounded-full bg-chart-income" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Colunas de uma série (contagem por semana). */
export function ColumnSeries({ rows }: { rows: { label: string; value: number }[] }) {
  if (!rows.length) return <p className="py-6 text-center text-sm text-steel-500">Sem agendamentos no período.</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="flex h-36 items-end gap-2">
      {rows.map((r) => (
        <div key={r.label} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${r.label}: ${r.value}`}>
          <span className="text-[11px] font-semibold text-steel-300">{r.value}</span>
          <span className="w-full max-w-8 rounded-t-[4px] bg-chart-income" style={{ height: `${(r.value / max) * 80}%` }} />
          <span className="text-[10px] text-steel-500">{r.label}</span>
        </div>
      ))}
    </div>
  );
}

function niceMax(v: number) {
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}
