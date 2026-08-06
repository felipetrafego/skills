import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Badge } from "@motora/ui";
import { getVehicle } from "@/lib/api";
import { brl, km, fuelLabel, transmissionLabel } from "@/lib/format";

function CarPlaceholder() {
  return (
    <svg className="w-1/3 h-1/3 opacity-20 text-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" />
      <path d="M5 13h14v4H5z" />
      <circle cx="7.5" cy="17" r="1.3" />
      <circle cx="16.5" cy="17" r="1.3" />
    </svg>
  );
}

export default async function VehicleDetailPage({ params }: { params: { id: string } }) {
  const v = await getVehicle(params.id);
  if (!v) notFound();

  const photos = v.media.filter((m) => m.type === "PHOTO");
  const fipe = v.fipePrice ? Number(v.fipePrice) : null;
  const price = Number(v.price);
  const fipeDelta = fipe ? ((price - fipe) / fipe) * 100 : null;

  const specs: [string, string][] = [
    ["Ano", `${v.yearFab}/${v.yearModel}`],
    ["Quilometragem", km(v.mileageKm)],
    ["Câmbio", transmissionLabel(v.transmission)],
    ["Combustível", fuelLabel(v.fuel)],
    ...(v.color ? ([["Cor", v.color]] as [string, string][]) : []),
    ...(v.doors ? ([["Portas", `${v.doors} portas`]] as [string, string][]) : []),
    ...(v.fipeCode ? ([["Código FIPE", v.fipeCode]] as [string, string][]) : []),
  ];

  return (
    <main className="max-w-[1180px] mx-auto px-6 py-6">
      <div className="text-[12.5px] text-muted mb-4">
        <Link href="/" className="hover:text-text">Marketplace</Link> › <span className="text-text">{v.title}</span>
      </div>

      <div className="grid lg:grid-cols-[1.55fr_1fr] gap-7">
        <div>
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-4 aspect-video rounded-lg grid place-items-center bg-surface-2 overflow-hidden">
              {photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos[0].url} alt={v.title} className="w-full h-full object-cover" />
              ) : (
                <CarPlaceholder />
              )}
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-[10px] grid place-items-center bg-surface-2 border border-border overflow-hidden">
                {photos[i + 1] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photos[i + 1]!.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <CarPlaceholder />
                )}
              </div>
            ))}
          </div>

          <h2 className="text-[17px] font-semibold mt-7 mb-3.5">Ficha técnica</h2>
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(130px,1fr))] gap-px bg-border border border-border rounded-md overflow-hidden">
            {specs.map(([k, val]) => (
              <div key={k} className="bg-surface p-3.5">
                <div className="text-[11.5px] text-muted">{k}</div>
                <div className="text-[14.5px] font-semibold mt-1">{val}</div>
              </div>
            ))}
          </div>

          {v.options.length > 0 && (
            <>
              <h2 className="text-[17px] font-semibold mt-7 mb-3.5">Opcionais</h2>
              <div className="flex flex-wrap gap-2">
                {v.options.map((o) => (
                  <span key={o.option.id} className="text-[12.5px] px-2.5 py-1.5 border border-border rounded-full text-muted">
                    {o.option.name}
                  </span>
                ))}
              </div>
            </>
          )}

          {v.description && (
            <>
              <h2 className="text-[17px] font-semibold mt-7 mb-2">Descrição</h2>
              <p className="text-[14px] text-muted leading-relaxed">{v.description}</p>
            </>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <Card className="p-[18px]">
            {fipeDelta != null && fipeDelta < 0 && (
              <Badge tone="green" className="mb-3">Preço abaixo da FIPE</Badge>
            )}
            <h1 className="text-[30px] font-bold tracking-tight tabular-nums">{brl(price)}</h1>
            {fipe && (
              <div className="text-muted text-[13px] mt-0.5">
                FIPE: {brl(fipe)}{" "}
                {fipeDelta != null && (
                  <span className={fipeDelta <= 0 ? "text-success font-semibold" : "text-danger font-semibold"}>
                    {fipeDelta > 0 ? "+" : ""}{fipeDelta.toFixed(1)}%
                  </span>
                )}
              </div>
            )}
            <a
              href="#"
              className="mt-4 flex items-center justify-center gap-2 rounded-[10px] py-2.5 font-medium text-[#08361a] bg-[#25d366] hover:brightness-105 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2z" /></svg>
              Falar no WhatsApp
            </a>
          </Card>

          <Card className="p-[18px]">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full grid place-items-center text-white text-[13px] font-bold" style={{ background: "linear-gradient(135deg,#0d1017,#33405c)" }}>
                {(v.tenant?.name ?? "PF").slice(0, 2).toUpperCase()}
              </span>
              <div>
                <b className="text-[14px]">{v.tenant?.name ?? "Vendedor particular"}</b>
                <div className="text-muted text-[12px]">
                  {v.tenant ? "Loja verificada" : "Anúncio de pessoa física"}
                  {v.city ? ` · ${v.city}, ${v.state}` : ""}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-[18px]" style={{ background: "var(--brand-tint)", borderColor: "transparent" }}>
            <div className="flex items-center gap-2 mb-2 text-brand font-semibold text-[13px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 14.6 7 18.2l1.9-5.8L4 8.8h6.1z" /></svg>
              Análise da IA Motora
            </div>
            <p className="text-[13px]">
              {fipeDelta != null && fipeDelta < 0
                ? `Bom negócio: preço ${Math.abs(fipeDelta).toFixed(1)}% abaixo da FIPE.`
                : "Anúncio com dados completos e preço alinhado ao mercado."}
            </p>
          </Card>
        </aside>
      </div>
    </main>
  );
}
