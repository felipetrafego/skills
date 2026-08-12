"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { VehicleCard } from "@/components/VehicleCard";
import { CompareBar } from "@/components/market/CompareBar";
import { FAV_KEY, useBuyerList } from "@/lib/buyer-store";
import { getVehicle } from "@/lib/api";
import type { VehicleDetail } from "@/lib/types";

export default function FavoritosPage() {
  const ids = useBuyerList(FAV_KEY);
  const [vehicles, setVehicles] = useState<VehicleDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all(ids.map((id) => getVehicle(id)))
      .then((list) => {
        if (alive) setVehicles(list.filter((v): v is VehicleDetail => !!v));
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [ids]);

  return (
    <main className="max-w-[1100px] mx-auto px-6 py-8">
      <div className="text-[12.5px] text-muted mb-3">
        <Link href="/" className="hover:text-text">Marketplace</Link> › Favoritos
      </div>
      <h1 className="text-[24px] font-semibold mb-1">Meus favoritos</h1>
      <p className="text-muted text-[13px] mb-6">
        {ids.length} {ids.length === 1 ? "veículo salvo" : "veículos salvos"}
      </p>

      {loading ? (
        <p className="text-muted text-sm">Carregando…</p>
      ) : vehicles.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-16 text-center">
          <p className="text-[15px] font-medium">Você ainda não favoritou nenhum veículo</p>
          <p className="text-muted text-[13px] mt-1">Toque no coração (♥) nos cards para salvar aqui.</p>
          <Link href="/" className="inline-block mt-4 text-brand text-[13.5px] font-medium hover:underline">Explorar veículos</Link>
        </div>
      ) : (
        <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(232px,1fr))]">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} v={v} />
          ))}
        </div>
      )}
      <CompareBar />
    </main>
  );
}
