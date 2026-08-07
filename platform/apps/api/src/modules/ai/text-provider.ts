import { Injectable, Logger } from "@nestjs/common";

/**
 * Ponto de integração com um LLM para geração de texto (ex.: descrições de anúncio).
 * Se `AI_API_KEY` estiver configurada, chama um provedor compatível com a Messages
 * API da Anthropic; caso contrário, retorna null e o chamador usa o fallback
 * determinístico (template). Assim o produto funciona sem chave e "liga" a IA
 * generativa apenas configurando o ambiente.
 */
@Injectable()
export class AiTextProvider {
  private readonly logger = new Logger(AiTextProvider.name);
  private readonly apiKey = process.env.AI_API_KEY;
  private readonly baseUrl = process.env.AI_BASE_URL ?? "https://api.anthropic.com";
  private readonly model = process.env.AI_MODEL ?? "claude-sonnet-5";

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async generate(prompt: string): Promise<string | null> {
    if (!this.apiKey) return null;
    try {
      const res = await fetch(`${this.baseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 400,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        this.logger.warn(`LLM respondeu ${res.status}; usando fallback`);
        return null;
      }
      const data = (await res.json()) as { content?: { text?: string }[] };
      return data.content?.[0]?.text?.trim() ?? null;
    } catch (err) {
      this.logger.warn(`Falha ao chamar o LLM: ${(err as Error).message}; usando fallback`);
      return null;
    }
  }
}
