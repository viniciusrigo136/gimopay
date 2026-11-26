"use client";

import { AnimatePresence, m } from "motion/react";
import { useActionState, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, LoaderCircle } from "lucide-react";
import { submitLead, type LeadState } from "@/app/actions";
import { copy, segments, solutions } from "@/content/copy";
import { onPrefill } from "@/lib/prefill";
import {
  maskCurrency,
  maskDocument,
  maskPhone,
  validateLead,
  type Lead,
  type LeadErrors,
  type LeadField,
} from "@/lib/validation";
import { cn } from "@/lib/cn";

const f = copy.contact.fields;
const segmentOptions = [...segments.map((s) => s.replace(/\.$/, "")), "Outro"];
const solutionOptions = [...solutions.map((s) => s.name), "Ainda não sei"];

const empty: Lead = {
  name: "",
  company: "",
  document: "",
  email: "",
  whatsapp: "",
  segment: "",
  revenue: "",
  solution: "",
};

const masks: Partial<Record<LeadField, (v: string) => string>> = {
  document: maskDocument,
  whatsapp: maskPhone,
  revenue: maskCurrency,
};

export function ContactForm() {
  const [state, formAction, pending] = useActionState<LeadState, FormData>(submitLead, { status: "idle" });
  const [values, setValues] = useState<Lead>(empty);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [touched, setTouched] = useState<Partial<Record<LeadField, boolean>>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Erros vindos do servidor (ajuste de estado durante a renderização)
  const [handled, setHandled] = useState(state);
  if (handled !== state) {
    setHandled(state);
    if (state.status === "invalid") setErrors(state.errors);
  }

  // Pré-preenchimento disparado pelos CTAs da página
  useEffect(
    () =>
      onPrefill(({ segment, solution }) =>
        setValues((v) => ({
          ...v,
          ...(segment && segmentOptions.includes(segment) ? { segment } : {}),
          ...(solution && solutionOptions.includes(solution) ? { solution } : {}),
        })),
      ),
    [],
  );

  const set = (field: LeadField, raw: string) => {
    const value = masks[field]?.(raw) ?? raw;
    setValues((v) => {
      const next = { ...v, [field]: value };
      if (touched[field]) setErrors((e) => ({ ...e, [field]: validateLead(next)[field] }));
      return next;
    });
  };

  const blur = (field: LeadField) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validateLead(values)[field] }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const found = validateLead(values);
    if (Object.keys(found).length) {
      e.preventDefault();
      setErrors(found);
      setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
      const first = formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`);
      first?.focus();
    }
  };

  const field = (name: LeadField) => ({
    id: `lead-${name}`,
    name,
    value: values[name],
    onBlur: () => blur(name),
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `lead-${name}-erro` : undefined,
  });

  if (state.status === "success") {
    return (
      <m.div
        className="flex min-h-[28rem] flex-col items-center justify-center text-center"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        role="status"
      >
        <span className="relative grid size-20 place-items-center">
          {[0, 1].map((i) => (
            <m.span
              key={i}
              className="absolute inset-0 rounded-full border-2 border-ciano-500"
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{ duration: 1.6, delay: 0.2 + i * 0.3, ease: "easeOut" }}
            />
          ))}
          <m.span
            className="grid size-20 place-items-center rounded-full bg-ciano-500 text-marinho-950"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 16 }}
          >
            <Check className="size-9" strokeWidth={2.6} aria-hidden />
          </m.span>
        </span>
        <p className="mt-8 text-h3 font-semibold text-marinho-800">Dados enviados</p>
        <p className="mt-2 max-w-[22rem] text-ardosia-700">Nossa equipe comercial vai entrar em contato pelos dados informados.</p>
      </m.div>
    );
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {/* Armadilha para bots */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Site
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label={f.name} error={errors.name} name="name" className="sm:col-span-2">
        <input {...field("name")} type="text" autoComplete="name" onChange={(e) => set("name", e.target.value)} className={inputCls(errors.name)} />
      </Field>
      <Field label={f.company} error={errors.company} name="company">
        <input {...field("company")} type="text" autoComplete="organization" onChange={(e) => set("company", e.target.value)} className={inputCls(errors.company)} />
      </Field>
      <Field label={f.document} error={errors.document} name="document">
        <input {...field("document")} type="text" inputMode="numeric" autoComplete="off" placeholder="Somente números" onChange={(e) => set("document", e.target.value)} className={inputCls(errors.document)} />
      </Field>
      <Field label={f.email} error={errors.email} name="email">
        <input {...field("email")} type="email" autoComplete="email" onChange={(e) => set("email", e.target.value)} className={inputCls(errors.email)} />
      </Field>
      <Field label={f.whatsapp} error={errors.whatsapp} name="whatsapp">
        <input {...field("whatsapp")} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(00) 00000-0000" onChange={(e) => set("whatsapp", e.target.value)} className={inputCls(errors.whatsapp)} />
      </Field>
      <Field label={f.segment} error={errors.segment} name="segment">
        <Select {...field("segment")} onChange={(e) => set("segment", e.target.value)} options={segmentOptions} invalid={!!errors.segment} />
      </Field>
      <Field label={f.revenue} error={errors.revenue} name="revenue">
        <input {...field("revenue")} type="text" inputMode="numeric" placeholder="R$ 0,00" onChange={(e) => set("revenue", e.target.value)} className={inputCls(errors.revenue)} />
      </Field>
      <Field label={f.solution} error={errors.solution} name="solution" className="sm:col-span-2">
        <Select {...field("solution")} onChange={(e) => set("solution", e.target.value)} options={solutionOptions} invalid={!!errors.solution} />
      </Field>

      <div className="mt-2 flex flex-col gap-4 sm:col-span-2">
        <m.button
          type="submit"
          disabled={pending}
          whileTap={{ scale: 0.98 }}
          className="relative inline-flex min-h-14 items-center justify-center gap-2.5 rounded-[var(--radius-control)] bg-ciano-500 px-7 text-base font-semibold text-marinho-950 shadow-[0_10px_24px_-12px_rgba(2,170,215,.9)] transition-colors hover:bg-[#13b6e2] disabled:cursor-progress disabled:opacity-80"
        >
          {pending && <LoaderCircle className="size-5 animate-spin" aria-hidden />}
          {pending ? "Enviando" : copy.contact.submit}
        </m.button>
        <AnimatePresence>
          {state.status === "error" && (
            <m.p
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-red-50 px-4 py-3 text-[0.875rem] text-erro"
            >
              Não foi possível enviar agora. Tente novamente em alguns instantes.
            </m.p>
          )}
        </AnimatePresence>
        <p className="text-[0.8125rem] text-ardosia-500">
          Ao enviar este formulário, você declara estar ciente da nossa{" "}
          <a href="/privacidade" className="font-medium text-ciano-700 underline underline-offset-2">
            Política de Privacidade
          </a>
          .
        </p>
      </div>
    </form>
  );
}

const inputCls = (error?: string) =>
  cn(
    "h-12 w-full rounded-[var(--radius-control)] bg-white px-4 text-[0.9375rem] text-marinho-950 outline-none ring-1 ring-inset transition-shadow placeholder:text-ardosia-300",
    "focus:ring-2 focus:ring-ciano-500",
    error ? "ring-erro" : "ring-ardosia-200 hover:ring-ardosia-300",
  );

function Field({
  label,
  name,
  error,
  className,
  children,
}: {
  label: string;
  name: LeadField;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={`lead-${name}`} className="text-[0.875rem] font-medium text-marinho-800">
        {label}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <m.p
            id={`lead-${name}-erro`}
            className="text-[0.8125rem] text-erro"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </m.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Select({
  options,
  invalid,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: string[]; invalid: boolean }) {
  return (
    <div className="relative">
      <select {...props} className={cn(inputCls(invalid ? "x" : undefined), "appearance-none pr-10", !props.value && "text-ardosia-500")}>
        <option value="" disabled>
          Selecione
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-ardosia-500" aria-hidden />
    </div>
  );
}
