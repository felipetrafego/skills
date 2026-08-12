import Link from "next/link";
import { Card, TierBadge } from "@motora/ui";
import type { VehicleListItem } from "@/lib/types";
import { brl, km, fuelLabel, transmissionLabel } from "@/lib/format";
import { CardActions } from "@/components/market/CardActions";

export function VehicleCard({ v }: { v: VehicleListItem }) {
  return (
    <Link href={`/veiculo/${v.id}`} className="block">
      <Card className="overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
        <div className="relative aspect-[4/3] grid place-items-center bg-surface-2 overflow-hidden">
          {v.media?.[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.media[0].url} alt={v.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <svg className="w-2/5 h-2/5 opacity-20 text-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" />
              <path d="M5 13h14v4H5z" />
              <circle cx="7.5" cy="17" r="1.3" />
              <circle cx="16.5" cy="17" r="1.3" />
            </svg>
          )}
          {v.featuredTier && v.featuredTier !== "NONE" && (
            <span className="absolute top-2.5 left-2.5">
              <TierBadge tier={v.featuredTier} />
            </span>
          )}
          <CardActions id={v.id} />
        </div>
        <div className="p-3.5">
          <h4 className="text-[14.5px] font-semibold">{v.title}</h4>
          <div className="text-muted text-[12.5px] mt-0.5">
            {v.yearFab}/{v.yearModel} · {km(v.mileageKm)}
          </div>
          <div className="text-[18px] font-bold tracking-tight mt-2.5 tabular-nums">{brl(v.price)}</div>
          <div className="flex gap-2.5 flex-wrap text-muted text-[12px] mt-2 pt-2.5 border-t border-border">
            <span>{transmissionLabel(v.transmission)}</span>
            <span>·</span>
            <span>{fuelLabel(v.fuel)}</span>
            {v.city && (
              <>
                <span>·</span>
                <span>
                  {v.city}, {v.state}
                </span>
              </>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
