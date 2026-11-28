import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  CalendarDays,
  Car,
  ChartColumn,
  ClipboardList,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { requireOwner, signOut, useSession } from "@/features/admin/auth";
import { adminKeys, pendingQuery } from "@/features/admin/api";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/_panel")({
  // Painel roda só no navegador: a sessão fica no cliente e a RLS protege os dados.
  ssr: false,
  beforeLoad: ({ location }) => requireOwner(location),
  head: () => ({ meta: [{ title: "Painel | Tassionero" }, { name: "robots", content: "noindex" }] }),
  component: PanelLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/admin/agendamentos", label: "Agendamentos", icon: ClipboardList },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/veiculos", label: "Veículos", icon: Car },
  { to: "/admin/servicos", label: "Serviços", icon: Wrench },
  { to: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/admin/relatorios", label: "Relatórios", icon: ChartColumn },
  { to: "/admin/galeria", label: "Galeria", icon: Images },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
] as const;

function useRealtimeAppointments() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("appointments-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, (payload) => {
        void qc.invalidateQueries({ queryKey: adminKeys.all });
        if (payload.eventType === "INSERT") {
          const row = payload.new as { customer_name_snapshot?: string; source?: string };
          if (row.source === "site") {
            toast.info(`Nova solicitação de ${row.customer_name_snapshot ?? "cliente"}`);
            if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
              new Notification("Tassionero: nova solicitação", { body: `${row.customer_name_snapshot ?? "Cliente"} pediu um horário.`, icon: "/favicon.svg" });
            }
          }
        }
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);
}

function PanelLayout() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const session = useSession();
  const navigate = useNavigate();
  const pending = useQuery(pendingQuery);
  useRealtimeAppointments();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const pendingCount = pending.data?.length ?? 0;
  const canNotify = typeof Notification !== "undefined" && Notification.permission === "default";

  const nav = (
    <nav aria-label="Painel" className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: "exact" in item ? item.exact : false }}
          className="group flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium text-steel-400 transition hover:bg-white/[0.04] hover:text-pearl data-[status=active]:bg-racing-500/12 data-[status=active]:text-pearl data-[status=active]:ring-1 data-[status=active]:ring-racing-500/40"
        >
          <item.icon className="size-[18px] shrink-0 group-data-[status=active]:text-racing-400" strokeWidth={1.8} aria-hidden />
          <span className="flex-1">{item.label}</span>
          {item.to === "/admin/agendamentos" && pendingCount > 0 ? (
            <span className="rounded-full bg-st-pending px-1.5 text-[11px] font-bold text-carbon">{pendingCount}</span>
          ) : null}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="relative min-h-dvh bg-carbon">
      {/* brilho de fundo, como na referência */}
      <div aria-hidden className="pointer-events-none fixed -top-40 -right-40 size-[38rem] rounded-full bg-racing-500/[0.07] blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed -bottom-60 left-40 size-[30rem] rounded-full bg-white/[0.025] blur-3xl" />

      <div className="relative mx-auto flex max-w-[1600px] gap-6 p-3 md:p-5">
        {/* Sidebar desktop */}
        <aside className="sticky top-5 hidden h-[calc(100dvh-2.5rem)] w-60 shrink-0 flex-col rounded-panel bg-graphite-900/80 p-4 ring-1 ring-white/[0.06] backdrop-blur lg:flex">
          <Link to="/admin" className="mb-8 px-2 pt-2 text-[24px]">
            <Logo />
          </Link>
          {nav}
          <button
            type="button"
            onClick={async () => {
              await signOut();
              await navigate({ to: "/admin/login" });
            }}
            className="mt-4 flex items-center gap-3 rounded-control px-3 py-2.5 text-sm text-steel-500 hover:text-pearl"
          >
            <LogOut className="size-[18px]" aria-hidden /> Sair
          </button>
        </aside>

        {/* Drawer mobile */}
        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" aria-label="Fechar menu" className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-graphite-900 p-4">
              <div className="mb-6 flex items-center justify-between px-2 pt-2">
                <span className="text-[22px]">
                  <Logo />
                </span>
                <button type="button" onClick={() => setOpen(false)} aria-label="Fechar menu" className="p-2 text-steel-400">
                  <X className="size-5" />
                </button>
              </div>
              {nav}
              <button type="button" onClick={() => void signOut().then(() => navigate({ to: "/admin/login" }))} className="mt-4 flex items-center gap-3 px-3 py-2.5 text-sm text-steel-500">
                <LogOut className="size-[18px]" aria-hidden /> Sair
              </button>
            </aside>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <header className="mb-5 flex items-center gap-3">
            <button type="button" className="grid size-10 place-items-center rounded-full bg-graphite-800 ring-1 ring-white/10 lg:hidden" aria-label="Abrir menu" onClick={() => setOpen(true)}>
              <Menu className="size-5" />
            </button>
            <div className="flex-1" />
            {canNotify ? (
              <button type="button" onClick={() => void Notification.requestPermission()} className="hidden text-xs font-medium text-steel-400 underline-offset-4 hover:text-pearl hover:underline sm:block">
                Ativar avisos do navegador
              </button>
            ) : null}
            <Link
              to="/admin/agendamentos"
              search={{ status: "pending" }}
              className="relative grid size-10 place-items-center rounded-full bg-graphite-800 ring-1 ring-white/10 hover:ring-white/25"
              aria-label={`${pendingCount} solicitações pendentes`}
            >
              <Bell className="size-[18px]" aria-hidden />
              {pendingCount > 0 ? (
                <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-racing-500 px-1 text-[11px] font-bold text-white">{pendingCount}</span>
              ) : null}
            </Link>
            <div className="flex items-center gap-3 rounded-full bg-graphite-800 py-1 pr-4 pl-1 ring-1 ring-white/10">
              <span className="grid size-8 place-items-center rounded-full bg-racing-500 text-sm font-bold text-white" aria-hidden>
                {(session?.user.email ?? "T").slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block max-w-40 truncate text-sm font-semibold">{session?.user.email ?? "Proprietário"}</span>
                <span className="block text-xs text-steel-500">Proprietário</span>
              </span>
            </div>
          </header>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
