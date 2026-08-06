import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("bg-surface border border-border rounded-lg shadow-sm", className)}
      {...rest}
    />
  );
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("p-[18px]", className)} {...rest} />;
}
