import Link from "next/link";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ui } from "@/content/copy";

/** Estrutura das páginas legais. O texto oficial será inserido quando enviado. */
export function LegalPage({ title }: { title: string }) {
  return (
    <>
      <Header onHome={false} />
      <main className="pb-24 pt-36 md:pt-44">
        <div className="container-page max-w-[52rem]">
          <Link href="/" className="text-[0.9375rem] font-medium text-ciano-700 hover:underline">
            {ui.legal.back}
          </Link>
          <h1 className="mt-6 text-h2 font-bold">{title}</h1>
          <div className="mt-10 rounded-[var(--radius-panel)] bg-nevoa p-6 ring-1 ring-ardosia-200 sm:p-8">
            <p className="font-semibold text-marinho-800">{ui.legal.pendingTitle}</p>
            <p className="mt-2 max-w-[38rem]">
              {ui.legal.pendingText}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
