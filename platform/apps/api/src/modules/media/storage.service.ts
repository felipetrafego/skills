import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";
import type { Readable } from "node:stream";

/**
 * Abstração de armazenamento de mídia.
 * Em produção: bucket S3-compatível com URL pré-assinada (o cliente faz PUT direto).
 * Em dev: provider local em disco, servido pela própria API — mesmo contrato
 * (`presign` → PUT na uploadUrl → arquivo acessível na publicUrl).
 */
@Injectable()
export class StorageService {
  private readonly dir = process.env.STORAGE_DIR ?? join(tmpdir(), "motora-storage");
  private readonly publicBase = process.env.STORAGE_PUBLIC_URL ?? "http://localhost:3333";

  constructor() {
    mkdirSync(this.dir, { recursive: true });
  }

  /** Gera uma chave única e segura para o objeto. */
  buildKey(vehicleId: string, filename: string): string {
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    return `${vehicleId}__${randomUUID()}__${safe}`;
  }

  presign(key: string): { uploadUrl: string; publicUrl: string; key: string } {
    const url = `${this.publicBase}/api/storage/${key}`;
    return { uploadUrl: url, publicUrl: url, key };
  }

  /** Caminho local seguro (basename evita path traversal). */
  private pathFor(key: string): string {
    return join(this.dir, basename(key));
  }

  exists(key: string): boolean {
    return existsSync(this.pathFor(key));
  }

  absolutePath(key: string): string {
    return this.pathFor(key);
  }

  saveStream(key: string, source: Readable): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = createWriteStream(this.pathFor(key));
      source.on("error", reject);
      ws.on("error", reject);
      ws.on("finish", () => resolve());
      source.pipe(ws);
    });
  }

  readStream(key: string): Readable {
    return createReadStream(this.pathFor(key));
  }
}
