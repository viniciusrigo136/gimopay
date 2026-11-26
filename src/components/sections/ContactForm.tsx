"use client";

import { AnimatePresence, m } from "motion/react";
import { useActionState, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, LoaderCircle } from "lucide-react";
import { submitLead, type LeadState } from "@/app/actions";
import { copy, ui } from "@/content/copy";
import { onPrefill } from "@/lib/prefill";
import {
  maskCurrency,
  maskDocument,
  maskPhone,
  segmentOptions,
  solutionOptions,
  validateLead,
  type Lead,
  type LeadErrors,
  type LeadField,
} from "@/lib/validation";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";

const fieldLabels = copy.contact.fields;

const emptyLead: Lead = {
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

/** Aviso oficial de privacidade, com o trecho "Política de Privacidade" virando link. */
function PrivacyNotice() {
  const [before, after] = copy.contact.privacy.split(ui.form.privacyLinkText);
  return (
    <p className="text-[0.8125rem] text-ardosia-500">
      {before}
      <a href="/privacidade" className="font-medium text-ciano-700 underline underline-offset-2">
        {ui.form.privacyLinkText}
      </a>
      {after}
    </p>
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState<LeadState, FormData>(submitLead, { status: "idle" });
  const [values, setValues] = useState<Lead>(emptyLead);
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
          ...(segment ? { segment } : {}),
          ...(solution ? { solution } : {}),
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

  const fieldProps = (name: LeadField) => ({
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
        transition={{ duration: 0.6, ease: EASE_OUT }}
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
        <p className="mt-8 text-h3 font-semibold text-marinho-800">{ui.form.success.title}</p>
        <p className="mt-2 max-w-[22rem] text-ardosia-700">{ui.form.success.text}</p>
      </m.div>
    );
  }

  const notice =
    state.status === "unavailable" ? ui.form.unavailable : state.status === "error" ? ui.form.error : null;

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {/* Armadilha para bots */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Site
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label={fieldLabels.name} error={errors.name} name="name" className="sm:col-span-2">
        <input {...fieldProps("name")} type="text" autoComplete="name" onChange={(e) => set("name", e.target.value)} className={inputCls(errors.name)} />
      </Field>
      <Field label={fieldLabels.company} error={errors.company} name="company">
        <input {...fieldProps("company")} type="text" autoComplete="organization" onChange={(e) => set("company", e.target.value)} className={inputCls(errors.company)} />
      </Field>
      <Field label={fieldLabels.document} error={errors.document} name="document">
        <input
          {...fieldProps("document")}
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          placeholder={ui.form.documentPlaceholder}
          onChange={(e) => set("document", e.target.value)}
          className={inputCls(errors.document)}
        />
      </Field>
      <Field label={fieldLabels.email} error={errors.email} name="email">
        <input {...fieldProps("email")} type="email" autoComplete="email" onChange={(e) => set("email", e.target.value)} className={inputCls(errors.email)} />
      </Field>
      <Field label={fieldLabels.whatsapp} error={errors.whatsapp} name="whatsapp">
        <input {...fieldProps("whatsapp")} type="tel" inputMode="tel" autoComplete="tel-national" placeholder={ui.form.phonePlaceholder} onChange={(e) => set("whatsapp", e.target.value)} className={inputCls(errors.whatsapp)} />
      </Field>
      <Field label={fieldLabels.segment} error={errors.segment} name="segment">
        <Select {...fieldProps("segment")} onChange={(e) => set("segment", e.target.value)} options={segmentOptions} invalid={!!errors.segment} />
      </Field>
      <Field label={fieldLabels.revenue} error={errors.revenue} name="revenue">
        <input {...fieldProps("revenue")} type="text" inputMode="numeric" placeholder={ui.form.revenuePlaceholder} onChange={(e) => set("revenue", e.target.value)} className={inputCls(errors.revenue)} />
      </Field>
      <Field label={fieldLabels.solution} error={errors.solution} name="solution" className="sm:col-span-2">
        <Select {...fieldProps("solution")} onChange={(e) => set("solution", e.target.value)} options={solutionOptions} invalid={!!errors.solution} />
      </Field>

      <div className="mt-2 flex flex-col gap-4 sm:col-span-2">
        <m.button
          type="submit"
          disabled={pending}
          whileTap={{ scale: 0.98 }}
          className="relative inline-flex min-h-14 items-center justify-center gap-2.5 rounded-[var(--radius-control)] bg-ciano-500 px-7 text-base font-semibold text-marinho-950 shadow-cta transition-colors hover:bg-ciano-400 disabled:cursor-progress disabled:opacity-80"
        >
          {pending && <LoaderCircle className="size-5 animate-spin" aria-hidden />}
          {pending ? ui.form.sending : copy.contact.submit}
        </m.button>
        <AnimatePresence>
          {notice && (
            <m.p
              key={state.status}
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-red-50 px-4 py-3 text-[0.875rem] text-erro"
            >
              {notice}
            </m.p>
          )}
        </AnimatePresence>
        <PrivacyNotice />
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
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{ value: string; label: string }>;
  invalid: boolean;
}) {
  return (
    <div className="relative">
      <select {...props} className={cn(inputCls(invalid ? "invalid" : undefined), "appearance-none pr-10", !props.value && "text-ardosia-500")}>
        <option value="" disabled>
          {ui.form.select}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-ardosia-500" aria-hidden />
    </div>
  );
}
