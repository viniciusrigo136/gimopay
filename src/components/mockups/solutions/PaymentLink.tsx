"use client";

import { m } from "motion/react";
import { CheckCheck, Copy, Mail, MessageCircle, Share2 } from "lucide-react";
import { WavesGlyph } from "@/components/brand/Waves";
import { formatBRL } from "@/lib/format";
import { item, list } from "./shared";
import { EASE_OUT as ease } from "@/lib/motion";

/* Mockup demonstrativo: nomes, valores e datas são fictícios. */

/* 2. Link de pagamento */
export function LinkMock() {
  return (
    <div className="relative h-full">
      <div className="absolute inset-y-0 left-6 w-[330px] overflow-hidden rounded-[var(--radius-panel)] bg-ardosia-100 shadow-painel">
        <div className="flex items-center gap-2.5 bg-white px-4 py-3 text-[0.75rem] shadow-borda">
          <span className="grid size-8 place-items-center rounded-full bg-ardosia-200 font-semibold text-marinho-800">
            C
          </span>
          <span>
            <span className="block font-semibold text-marinho-950">Cliente</span>
            <span className="text-[0.625rem] text-ardosia-500">Conversa</span>
          </span>
        </div>
        <m.div className="space-y-2.5 p-4 text-[0.75rem]" variants={list} initial="hidden" animate="show">
          <m.p variants={item} className="ml-auto max-w-[78%] rounded-2xl rounded-br-md bg-ciano-100 px-3 py-2 text-marinho-950">
            Olá! Segue o link para pagamento do seu pedido.
          </m.p>
          <m.div variants={item} className="ml-auto w-[78%] overflow-hidden rounded-2xl rounded-br-md bg-white ring-1 ring-ardosia-200">
            <div className="flex items-center gap-2 bg-marinho-950 px-3 py-2.5 text-white">
              <WavesGlyph className="h-4 w-3 text-ciano-500" strokeWidth={6} />
              <span className="text-[0.6875rem] font-semibold">Link de pagamento</span>
            </div>
            <div className="p-3">
              <p className="text-[0.625rem] text-ardosia-500">Pedido 0482</p>
              <p className="text-[1.125rem] font-bold text-marinho-950">{formatBRL(180)}</p>
              <p className="mt-2 rounded-lg bg-ciano-500 py-1.5 text-center text-[0.6875rem] font-semibold text-marinho-950">
                Pagar agora
              </p>
            </div>
          </m.div>
          <m.p variants={item} className="flex items-center justify-end gap-1 text-[0.625rem] text-ardosia-500">
            Enviado <CheckCheck className="size-3.5 text-ciano-600" aria-hidden />
          </m.p>
          <m.p variants={item} className="max-w-[70%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-marinho-950">
            Pagamento feito!
          </m.p>
        </m.div>
      </div>

      <m.div
        className="absolute right-0 top-10 w-[200px] rounded-[var(--radius-panel)] bg-white p-4 shadow-flutuante"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.3 }}
      >
        <p className="flex items-center gap-2 text-[0.75rem] font-semibold text-marinho-950">
          <Share2 className="size-4 text-ciano-600" aria-hidden /> Compartilhar
        </p>
        <ul className="mt-3 space-y-1.5 text-[0.6875rem] text-ardosia-700">
          {[
            { icon: MessageCircle, label: "WhatsApp" },
            { icon: Mail, label: "E-mail" },
            { icon: Copy, label: "Outros canais" },
          ].map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 rounded-lg px-2 py-1.5 ring-1 ring-ardosia-200">
              <Icon className="size-3.5 text-ardosia-500" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </m.div>
    </div>
  );
}
