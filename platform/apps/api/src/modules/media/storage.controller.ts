import { Controller, Get, NotFoundException, Param, Put, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { StorageService } from "./storage.service";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
};

/**
 * Endpoint de armazenamento do provider local (dev). Em produção o cliente faz
 * PUT/GET direto no bucket via URL pré-assinada e estes endpoints não existem.
 */
@Controller("storage")
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Put(":key")
  async upload(@Param("key") key: string, @Req() req: Request) {
    await this.storage.saveStream(key, req);
    return { ok: true, key };
  }

  @Get(":key")
  serve(@Param("key") key: string, @Res() res: Response) {
    if (!this.storage.exists(key)) throw new NotFoundException("Objeto não encontrado");
    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    res.setHeader("Content-Type", CONTENT_TYPES[ext] ?? "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    this.storage.readStream(key).pipe(res);
  }
}
