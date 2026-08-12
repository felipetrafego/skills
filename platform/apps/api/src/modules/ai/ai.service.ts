import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { JwtPayload } from "../../common/auth/jwt-payload";
import { AiTextProvider } from "./text-provider";

const FUEL_LABEL: Record<string, string> = {
  FLEX: "flex", GASOLINE: "gasolina", ETHANOL: "etanol", DIESEL: "diesel",
  ELECTRIC: "elétrico", HYBRID: "híbrido", GNV: "GNV",
};
const TRANS_LABEL: Record<string, string> = {
  MANUAL: "manual", AUTOMATIC: "automático", CVT: "CVT", AUTOMATED: "automatizado",
};

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly text: AiTextProvider,
  ) {}

  /** Sugestão de preço com base em anúncios comparáveis do marketplace. */
  async priceSuggestion(user: JwtPayload, vehicleId: string) {
    const v = await this.assertOwnership(vehicleId, user);
    const comps = await this.comparables(v.make, v.model, v.yearModel, v.id);
    const prices = comps.map((c) => Number(c.price));
    const current = Number(v.price);

    if (prices.length === 0) {
      return { sampleSize: 0, current, suggested: current, verdict: "NO_DATA" as const };
    }

    const mkt = median(prices);
    const suggested = Math.round(mkt / 500) * 500; // arredonda p/ múltiplo de 500
    const diff = mkt > 0 ? (current - mkt) / mkt : 0;
    const verdict = diff < -0.05 ? "BELOW" : diff > 0.05 ? "ABOVE" : "AT";

    return {
      sampleSize: prices.length,
      current,
      market: { median: Math.round(mkt), min: Math.min(...prices), max: Math.max(...prices) },
      suggested,
      diffPct: Number((diff * 100).toFixed(1)),
      verdict,
    };
  }

  /** Pontuação de qualidade do anúncio (0-100) + sugestões de melhoria. */
  async score(user: JwtPayload, vehicleId: string) {
    const v = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { _count: { select: { media: true, options: true } } },
    });
    if (!v) throw new NotFoundException("Veículo não encontrado");
    this.ensureOwner(v, user);

    const photos = v._count.media;
    const suggestions: string[] = [];

    // Fotos (0-30)
    let photoScore = 0;
    if (photos >= 5) photoScore = 30;
    else if (photos >= 3) photoScore = 22;
    else if (photos >= 1) photoScore = 15;
    if (photos < 5) suggestions.push(`Adicione mais fotos (tem ${photos}; anúncios com 5+ recebem mais contatos).`);

    // Descrição (0-20)
    const desc = v.description?.trim() ?? "";
    const descScore = desc.length >= 120 ? 20 : desc.length >= 40 ? 12 : 0;
    if (descScore < 20) suggestions.push("Escreva uma descrição mais completa (revisões, opcionais, estado).");

    // Preço vs mercado (0-25)
    const comps = await this.comparables(v.make, v.model, v.yearModel, v.id);
    const prices = comps.map((c) => Number(c.price));
    let priceScore = 15;
    if (prices.length > 0) {
      const mkt = median(prices);
      const diff = mkt > 0 ? (Number(v.price) - mkt) / mkt : 0;
      priceScore = diff <= 0.02 ? 25 : diff <= 0.1 ? 16 : 6;
      if (diff > 0.1) suggestions.push("Seu preço está acima do mercado; considere ajustar para vender mais rápido.");
    }

    // Completude (0-25)
    let completeness = 0;
    if (v.color) completeness += 6; else suggestions.push("Informe a cor do veículo.");
    if (v.city && v.state) completeness += 6; else suggestions.push("Informe cidade e UF.");
    if (v.mileageKm > 0) completeness += 7; else suggestions.push("Informe a quilometragem.");
    if (v.version) completeness += 6;

    const total = photoScore + descScore + priceScore + completeness;

    await this.prisma.vehicle.update({ where: { id: v.id }, data: { aiScore: total } }).catch(() => undefined);

    return {
      score: total,
      breakdown: { fotos: photoScore, descricao: descScore, preco: priceScore, completude: completeness },
      suggestions,
    };
  }

  /** Gera uma descrição (LLM se configurado; senão, template determinístico). */
  async description(user: JwtPayload, vehicleId: string) {
    const v = await this.assertOwnership(vehicleId, user);
    const prompt = this.buildPrompt(v);
    const llm = await this.text.generate(prompt);
    const text = llm ?? this.template(v);
    return { text, source: llm ? "llm" : "template", llmConfigured: this.text.isConfigured() };
  }

  // ---- helpers ----
  private comparables(make: string, model: string, year: number, excludeId: string) {
    const base = { status: "ACTIVE" as const, id: { not: excludeId } };
    return this.prisma.vehicle
      .findMany({
        where: { ...base, make, model, yearModel: { gte: year - 2, lte: year + 2 } },
        select: { price: true },
      })
      .then(async (rows) => {
        if (rows.length >= 3) return rows;
        const byModel = await this.prisma.vehicle.findMany({ where: { ...base, make, model }, select: { price: true } });
        if (byModel.length >= 3) return byModel;
        return this.prisma.vehicle.findMany({ where: { ...base, make }, select: { price: true } });
      });
  }

  private template(v: { make: string; model: string; version: string | null; yearFab: number; yearModel: number; mileageKm: number; transmission: string; fuel: string; color: string | null; city: string | null; state: string | null }): string {
    const parts = [
      `${v.make} ${v.model}${v.version ? " " + v.version : ""} ${v.yearFab}/${v.yearModel}`,
      `${v.mileageKm.toLocaleString("pt-BR")} km`,
      `câmbio ${TRANS_LABEL[v.transmission] ?? v.transmission}`,
      `${FUEL_LABEL[v.fuel] ?? v.fuel}`,
    ];
    let t = parts.join(" · ") + ".";
    if (v.color) t += ` Cor ${v.color}.`;
    if (v.city) t += ` Veículo em ${v.city}${v.state ? "/" + v.state : ""}.`;
    t += " Revisões em dia e documentação ok. Agende sua visita ou faça uma proposta!";
    return t;
  }

  private buildPrompt(v: { make: string; model: string; version: string | null; yearFab: number; yearModel: number; mileageKm: number; transmission: string; fuel: string; color: string | null }): string {
    return [
      "Escreva uma descrição atraente e honesta (máx. 60 palavras, português do Brasil) para um anúncio de carro usado, sem inventar informações. Dados:",
      `- Modelo: ${v.make} ${v.model} ${v.version ?? ""}`.trim(),
      `- Ano: ${v.yearFab}/${v.yearModel}`,
      `- KM: ${v.mileageKm}`,
      `- Câmbio: ${TRANS_LABEL[v.transmission] ?? v.transmission}`,
      `- Combustível: ${FUEL_LABEL[v.fuel] ?? v.fuel}`,
      v.color ? `- Cor: ${v.color}` : "",
    ].filter(Boolean).join("\n");
  }

  private async assertOwnership(vehicleId: string, user: JwtPayload) {
    const v = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!v) throw new NotFoundException("Veículo não encontrado");
    this.ensureOwner(v, user);
    return v;
  }

  private ensureOwner(v: { ownerUserId: string | null; tenantId: string | null }, user: JwtPayload) {
    const owns =
      (v.ownerUserId && v.ownerUserId === user.sub) || (v.tenantId && v.tenantId === user.tenantId);
    if (!owns) throw new ForbiddenException("Este veículo não pertence a você");
  }
}
