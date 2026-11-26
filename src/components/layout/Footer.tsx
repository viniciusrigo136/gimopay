import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { copy } from "@/content/copy";
import { site, isPlaceholderHref } from "@/config/site";

const linkCls = "text-[0.9375rem] text-ardosia-300 transition-colors hover:text-white";

export function Footer() {
  const { footer } = copy;
  const { email, phone, whatsapp } = site.contact;
  const contacts: Array<{ label: string; href: string }> = [];
  if (email) contacts.push({ label: email, href: `mailto:${email}` });
  if (phone) contacts.push({ label: phone, href: `tel:${phone.replace(/\D/g, "")}` });
  if (whatsapp) contacts.push({ label: "WhatsApp", href: `https://wa.me/${whatsapp}` });
  const social = site.social.filter((s) => s.url);
  const legalLine = [site.contact.legalName, site.contact.cnpj && `CNPJ ${site.contact.cnpj}`, site.contact.address]
    .filter(Boolean)
    .join(", ");

  return (
    <footer className="on-dark bg-marinho-950 pb-10 pt-20 text-ardosia-300 lg:pt-28">
      <div className="container-page">
        <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <Logo tone="white" className="w-[150px] md:w-[170px]" />
            <p className="mt-5 max-w-[18rem] text-[0.9375rem]">{footer.tagline}</p>
            {social.length > 0 && (
              <ul className="mt-6 flex gap-4">
                {social.map((s) => (
                  <li key={s.name}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className={linkCls}>
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-8">
            {footer.columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="text-[0.9375rem] font-semibold text-white">{col.title}</p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className={linkCls}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <nav aria-label={footer.support.title}>
              <p className="text-[0.9375rem] font-semibold text-white">{footer.support.title}</p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link href="/#contato" className={linkCls}>
                    {footer.support.contact}
                  </Link>
                </li>
                <li>
                  <a href={site.links.helpCenter} className={linkCls}>
                    {footer.support.helpCenter}
                  </a>
                </li>
                <li>
                  <a
                    href={site.links.account}
                    className={linkCls}
                    {...(isPlaceholderHref(site.links.account) ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    {footer.support.account}
                  </a>
                </li>
                {contacts.map((c) => (
                  <li key={c.href}>
                    <a href={c.href} className={linkCls}>
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label={footer.legal.title}>
              <p className="text-[0.9375rem] font-semibold text-white">{footer.legal.title}</p>
              <ul className="mt-4 space-y-3">
                {footer.legal.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkCls}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-8 text-[0.8125rem] sm:flex-row sm:items-center sm:justify-between">
          <p>{footer.copyright}</p>
          {legalLine && <p>{legalLine}</p>}
        </div>
      </div>
    </footer>
  );
}
