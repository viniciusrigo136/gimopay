import { ErrorComponent, Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { buttonClass } from "@/components/ui/Button";
import { errorMessage } from "@/domain/errors";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  if (import.meta.env.DEV) console.error(error);
  return (
    <main className="grid min-h-[60dvh] place-items-center px-6 py-20 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-title font-bold">Não foi possível carregar esta página</h1>
        <p className="text-steel-400">{errorMessage(error)}</p>
        <div className="flex justify-center gap-3">
          <button type="button" className={buttonClass("primary")} onClick={() => router.invalidate()}>
            Tentar de novo
          </button>
          <Link to="/" className={buttonClass("secondary")}>
            Ir para o início
          </Link>
        </div>
        {import.meta.env.DEV ? <ErrorComponent error={error} /> : null}
      </div>
    </main>
  );
}

export function NotFound() {
  return (
    <main className="grid min-h-[60dvh] place-items-center px-6 py-20 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-sm font-semibold text-racing-300">Erro 404</p>
        <h1 className="text-title font-bold">Página não encontrada</h1>
        <p className="text-steel-400">O endereço pode ter mudado. Veja nossos serviços ou volte ao início.</p>
        <div className="flex justify-center gap-3">
          <Link to="/servicos" className={buttonClass("primary")}>
            Ver serviços
          </Link>
          <Link to="/" className={buttonClass("secondary")}>
            Início
          </Link>
        </div>
      </div>
    </main>
  );
}
