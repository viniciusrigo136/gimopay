import Image from "next/image";
import logo from "../../../public/brand/gimopay-logo.png";
import logoWhite from "../../../public/brand/gimopay-logo-white.png";
import { cn } from "@/lib/cn";

/** Assinatura oficial GIMO Pay (arquivo enviado pelo cliente, sem alterações de cor). */
export function Logo({
  tone = "color",
  className,
  priority,
}: {
  tone?: "color" | "white";
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={tone === "white" ? logoWhite : logo}
      alt="GIMO Pay"
      priority={priority}
      sizes="180px"
      className={cn("h-auto w-[132px] md:w-[148px]", className)}
    />
  );
}
