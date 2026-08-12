"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@motora/ui";
import {
  authPost,
  fetchMakes,
  fetchModels,
  uploadVehiclePhoto,
  AuthError,
  type CatalogModelItem,
  type CreatedVehicle,
} from "@/lib/client-api";

const FUELS = [
  ["FLEX", "Flex"], ["GASOLINE", "Gasolina"], ["ETHANOL", "Etanol"],
  ["DIESEL", "Diesel"], ["HYBRID", "Híbrido"], ["ELECTRIC", "Elétrico"], ["GNV", "GNV"],
] as const;
const TRANSMISSIONS = [
  ["MANUAL", "Manual"], ["AUTOMATIC", "Automático"], ["CVT", "CVT"], ["AUTOMATED", "Automatizado"],
] as const;

const inputCls =
  "w-full bg-surface-2 border border-border rounded-[10px] px-3.5 py-2.5 text-[14px] outline-none focus:border-brand transition-colors";
const labelCls = "flex flex-col gap-1.5";
const capCls = "text-[12.5px] font-medium text-muted";

export default function AnunciarPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [makes, setMakes] = useState<{ make: string; models: number }[]>([]);
  const [models, setModels] = useState<CatalogModelItem[]>([]);
  const [make, setMake] = useState("");
  const [modelId, setModelId] = useState("");

  const [form, setForm] = useState({
    title: "", model: "", version: "", yearFab: currentYear, yearModel: currentYear,
    price: "", mileageKm: "", fuel: "FLEX", transmission: "AUTOMATIC",
    color: "", city: "", state: "", description: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMakes().then(setMakes).catch(() => setMakes([]));
  }, []);
  useEffect(() => {
    if (make) fetchModels(make).then(setModels).catch(() => setModels([]));
    else setModels([]);
    setModelId("");
  }, [make]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onPickModel(id: string) {
    setModelId(id);
    const m = models.find((x) => x.id === id);
    if (!m) return;
    setForm((f) => ({
      ...f,
      model: m.model,
      version: m.version ?? "",
      fuel: m.fuel,
      transmission: m.transmission ?? f.transmission,
      title: `${m.make} ${m.model}${m.version ? " " + m.version : ""}`,
    }));
  }

  const previews = useMemo(() => files.map((f) => ({ f, url: URL.createObjectURL(f) })), [files]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!make || !form.model || !form.title || !form.price) {
      setError("Preencha marca, modelo, título e preço.");
      return;
    }
    setBusy(true);
    try {
      setStatus("Publicando anúncio…");
      const created = await authPost<CreatedVehicle>("/vehicles", {
        title: form.title,
        description: form.description || undefined,
        make,
        model: form.model,
        version: form.version || undefined,
        yearFab: Number(form.yearFab),
        yearModel: Number(form.yearModel),
        price: Number(form.price),
        mileageKm: Number(form.mileageKm || 0),
        fuel: form.fuel,
        transmission: form.transmission,
        color: form.color || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
      });

      for (let i = 0; i < files.length; i++) {
        setStatus(`Enviando foto ${i + 1} de ${files.length}…`);
        await uploadVehiclePhoto(created.id, files[i]!);
      }

      router.push(`/veiculo/${created.id}`);
    } catch (err) {
      if (err instanceof AuthError) return router.replace("/entrar");
      setError(err instanceof Error ? err.message : "Falha ao publicar");
      setBusy(false);
      setStatus(null);
    }
  }

  return (
    <div className="max-w-[760px]">
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-faint">Estoque</p>
        <h1 className="text-[21px] font-semibold">Novo anúncio</h1>
        <p className="text-muted text-[13px] mt-0.5">Escolha o modelo no catálogo e complete os dados.</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Card className="p-[18px] grid sm:grid-cols-2 gap-4">
          <label className={labelCls}>
            <span className={capCls}>Marca</span>
            <select className={inputCls} value={make} onChange={(e) => setMake(e.target.value)}>
              <option value="">Selecione…</option>
              {makes.map((m) => (
                <option key={m.make} value={m.make}>{m.make} ({m.models})</option>
              ))}
            </select>
          </label>
          <label className={labelCls}>
            <span className={capCls}>Modelo (catálogo)</span>
            <select className={inputCls} value={modelId} onChange={(e) => onPickModel(e.target.value)} disabled={!make}>
              <option value="">{make ? "Selecione…" : "Escolha a marca"}</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.model} · {m.version}</option>
              ))}
            </select>
          </label>
          <label className={`${labelCls} sm:col-span-2`}>
            <span className={capCls}>Título do anúncio</span>
            <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex.: Toyota Corolla XEi 2.0 Flex" />
          </label>
        </Card>

        <Card className="p-[18px] grid sm:grid-cols-3 gap-4">
          <label className={labelCls}>
            <span className={capCls}>Ano fabricação</span>
            <input className={inputCls} type="number" value={form.yearFab} onChange={(e) => set("yearFab", Number(e.target.value))} />
          </label>
          <label className={labelCls}>
            <span className={capCls}>Ano modelo</span>
            <input className={inputCls} type="number" value={form.yearModel} onChange={(e) => set("yearModel", Number(e.target.value))} />
          </label>
          <label className={labelCls}>
            <span className={capCls}>Quilometragem</span>
            <input className={inputCls} type="number" min={0} value={form.mileageKm} onChange={(e) => set("mileageKm", e.target.value)} placeholder="0" />
          </label>
          <label className={labelCls}>
            <span className={capCls}>Preço (R$)</span>
            <input className={inputCls} type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0" />
          </label>
          <label className={labelCls}>
            <span className={capCls}>Combustível</span>
            <select className={inputCls} value={form.fuel} onChange={(e) => set("fuel", e.target.value)}>
              {FUELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className={labelCls}>
            <span className={capCls}>Câmbio</span>
            <select className={inputCls} value={form.transmission} onChange={(e) => set("transmission", e.target.value)}>
              {TRANSMISSIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className={labelCls}>
            <span className={capCls}>Cor</span>
            <input className={inputCls} value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="Ex.: Prata" />
          </label>
          <label className={labelCls}>
            <span className={capCls}>Cidade</span>
            <input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="São Paulo" />
          </label>
          <label className={labelCls}>
            <span className={capCls}>UF</span>
            <input className={inputCls} maxLength={2} value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase())} placeholder="SP" />
          </label>
          <label className={`${labelCls} sm:col-span-3`}>
            <span className={capCls}>Descrição</span>
            <textarea className={`${inputCls} min-h-[90px] resize-y`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Único dono, revisões em dia, aceita troca…" />
          </label>
        </Card>

        <Card className="p-[18px]">
          <div className="flex items-center justify-between mb-3">
            <span className={capCls}>Fotos</span>
            <span className="text-[12px] text-faint">{files.length} selecionada(s)</span>
          </div>
          <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-border-strong rounded-[12px] py-7 cursor-pointer hover:border-brand transition-colors text-muted">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
            <span className="text-[13px]">Clique para adicionar fotos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
          </label>
          {previews.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
              {previews.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={p.url} alt="" className="aspect-square object-cover rounded-[8px] border border-border" />
              ))}
            </div>
          )}
        </Card>

        {error && <p className="text-danger text-[13px]">{error}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" loading={busy}>Publicar anúncio</Button>
          {status && <span className="text-[13px] text-muted">{status}</span>}
        </div>
      </form>
    </div>
  );
}
