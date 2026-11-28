import { forwardRef, type ButtonHTMLAttributes } from "react";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition duration-200 disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<Variant, string> = {
  primary: "bg-racing-500 text-white shadow-cta hover:bg-racing-400 active:bg-racing-600",
  secondary: "bg-graphite-700 text-pearl ring-1 ring-graphite-600 hover:bg-graphite-600",
  outline: "text-pearl ring-1 ring-pearl/30 hover:ring-pearl/70 hover:bg-white/5 backdrop-blur",
  ghost: "text-steel-300 hover:text-pearl hover:bg-white/5",
  danger: "bg-transparent text-danger ring-1 ring-danger/40 hover:bg-danger/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-control",
  md: "h-11 px-5 text-sm rounded-control",
  lg: "h-13 px-7 text-base rounded-full",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
});

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; size?: Size };

const StyledAnchor = forwardRef<HTMLAnchorElement, AnchorProps>(function StyledAnchor(
  { variant = "primary", size = "md", className, ...props },
  ref,
) {
  return <a ref={ref} className={buttonClass(variant, size, className)} {...props} />;
});

const CreatedLink = createLink(StyledAnchor);

/** Link interno com aparência de botão (rotas tipadas). */
export const ButtonLink: LinkComponent<typeof StyledAnchor> = (props) => <CreatedLink preload="intent" {...props} />;

/** Link externo (WhatsApp, mapas) com aparência de botão. */
export function ExternalButton({ variant = "primary", size = "md", className, ...props }: AnchorProps) {
  return <a target="_blank" rel="noopener noreferrer" className={buttonClass(variant, size, className)} {...props} />;
}
