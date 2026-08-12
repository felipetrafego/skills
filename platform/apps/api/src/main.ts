import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  // CORS_ORIGIN aceita múltiplas origens separadas por vírgula (ex.: prod + preview).
  const origins = config
    .get<string>("CORS_ORIGIN", "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins, credentials: true });

  // Em produção (Render/containers) a porta vem de PORT; local usa API_PORT.
  const port = Number(process.env.PORT) || config.get<number>("API_PORT", 3333);
  await app.listen(port, "0.0.0.0");
  Logger.log(`Motora API rodando na porta ${port} (prefixo /api)`, "Bootstrap");
}

void bootstrap();
