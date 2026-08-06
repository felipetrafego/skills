import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

type Tone = "brand" | "green" | "amber" | "red" | "muted";

const tones: Record<Tone, string> = {
  brand: "bg-brand-tint text-brand",
  green: "bg-success-tint text-success",
  amber: "bg-accent-tint text-accent",
  red: "bg-danger-tint text-danger",
  muted: "bg-surface-2 text-muted",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "muted", className, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-[5px] text-[11.5px] font-semibold px-[9px] py-[3px] rounded-full",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}

const tiers = {
  BRONZE: "bg-bronze text-white",
  SILVER: "bg-prata text-white",
  GOLD: "bg-ouro text-[#3a2c00]",
  PLATINUM: "bg-platinum text-white",
} as const;

export function TierBadge({ tier }: { tier: keyof typeof tiers }) {
  const label = { BRONZE: "Bronze", SILVER: "Prata", GOLD: "Ouro", PLATINUM: "Platinum" }[tier];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider px-2 py-[3px] rounded-md",
        tiers[tier],
      )}
    >
      {label}
    </span>
  );
}
