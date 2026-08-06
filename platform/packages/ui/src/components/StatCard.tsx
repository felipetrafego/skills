import type { ReactNode } from "react";
import { clsx } from "clsx";
import { Card } from "./Card";

export interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon?: ReactNode;
}

export function StatCard({ label, value, delta, trend = "flat", icon }: StatCardProps) {
  return (
    <Card className="p-[17px]">
      <div className="flex items-center gap-[7px] text-[12.5px] font-medium text-muted">
        {icon && (
          <span className="w-[26px] h-[26px] rounded-md grid place-items-center bg-brand-tint text-brand shrink-0">
            {icon}
          </span>
        )}
        {label}
      </div>
      <div className="text-[27px] font-bold tracking-tight mt-[9px] mb-[3px] tabular-nums">
        {value}
      </div>
      {delta && (
        <div
          className={clsx(
            "text-[12px] font-semibold",
            trend === "up" && "text-success",
            trend === "down" && "text-danger",
            trend === "flat" && "text-muted",
          )}
        >
          {delta}
        </div>
      )}
    </Card>
  );
}
