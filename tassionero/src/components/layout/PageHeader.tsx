import type { ReactNode } from "react";

/** Cabeçalho das páginas internas, com os tubos de luz da identidade. */
export function PageHeader({ title, children, aside }: { title: string; children?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_80%_100%_at_50%_0%,#1f2024,#0b0b0b_70%)] pt-32 pb-14">
      <span className="light-tube absolute top-20 left-[-5%] h-[2px] w-[35%] rotate-[8deg] opacity-70" aria-hidden />
      <span className="light-tube absolute top-20 right-[-5%] h-[2px] w-[35%] -rotate-[8deg] opacity-70" aria-hidden />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="mb-4 block h-1 w-10 -skew-x-[20deg] bg-racing-500" aria-hidden />
          <h1 className="text-display font-extrabold italic">{title}</h1>
          {children ? <div className="mt-4 text-base leading-relaxed font-light text-steel-300">{children}</div> : null}
        </div>
        {aside}
      </div>
    </div>
  );
}
