import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { buttonClasses } from "@motora/ui";

type Variant = "primary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

/**
 * Link com aparência de botão. Renderiza um <a> de verdade (Next Link) — evita o
 * anti-padrão <button> dentro de <a>, que quebra a navegação em alguns navegadores.
 */
export function ButtonLink({ variant = "primary", size = "md", className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
