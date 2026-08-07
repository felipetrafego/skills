# Guia de Desenvolvimento — Motora

Monorepo com **pnpm workspaces + Turborepo**. Requer Node ≥ 20, pnpm ≥ 10 e Docker
(para Postgres/Redis locais).

## Estrutura

```
platform/
  apps/
    web/        Next.js 14 (App Router) — marketplace público + painéis
    api/        NestJS 10 — API modular multi-tenant
  packages/
    ui/         Design system (React) + tokens.css
    config/     Preset Tailwind com os tokens
  prisma/       schema.prisma + seed
  docker-compose.yml
```

## Primeiros passos

```bash
cd platform

# 1. Variáveis de ambiente
cp .env.example .env

# 2. Subir Postgres + Redis
docker compose up -d

# 3. Instalar dependências (todo o workspace)
pnpm install

# 4. Banco: gerar client, aplicar schema e popular dados de demonstração
pnpm db:generate
pnpm db:push
pnpm db:seed

# 5. Rodar tudo (web em :3000, api em :3333)
pnpm dev
```

> O front (`apps/web`) tem **fallback offline**: sem a API no ar, o marketplace
> renderiza uma amostra de veículos, então dá para desenvolver a UI isoladamente.

## Scripts (raiz)

| Script | Ação |
|---|---|
| `pnpm dev` | Sobe web + api em watch (Turborepo) |
| `pnpm build` | Build de todos os apps/packages |
| `pnpm typecheck` | Checagem de tipos |
| `pnpm lint` | Lint |
| `pnpm db:migrate` | Cria/aplica migração de desenvolvimento |
| `pnpm db:push` | Aplica o schema sem migração (protótipo) |
| `pnpm db:seed` | Popula dados de demonstração |
| `pnpm db:studio` | Abre o Prisma Studio |

## Credenciais de seed

- **Lojista:** `ricardo@autoprime.com.br` / `motora123`
- **Pessoa física:** `comprador@exemplo.com` / `motora123`
- **Admin da plataforma:** `admin@motora.com.br` / `motora123`

## API — endpoints já implementados (slice inicial)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Cadastro de pessoa física |
| `POST` | `/api/auth/login` | Login (retorna access + refresh token) |
| `GET` | `/api/auth/me` | Usuário do token (guarded) |
| `GET` | `/api/vehicles` | Busca do marketplace (filtros, paginação) |
| `GET` | `/api/vehicles/:id` | Detalhe do veículo |
| `POST` | `/api/vehicles` | Cria anúncio (guarded) |
| `GET` | `/api/vehicles/mine` | Estoque do próprio usuário (guarded) |
| `PATCH` | `/api/vehicles/:id` | Edita anúncio / muda status (dono) |
| `DELETE` | `/api/vehicles/:id` | Remove anúncio (dono) |
| `GET` | `/api/featured/tiers` | Planos de destaque (Bronze→Platinum) |
| `POST` | `/api/vehicles/:id/feature` | Contrata destaque (dono) — sobe no ranking |
| `GET` | `/api/vehicles/:id/ai/price` | Sugestão de preço (comparáveis reais) — dono |
| `GET` | `/api/vehicles/:id/ai/score` | Pontuação de qualidade + sugestões — dono |
| `POST` | `/api/vehicles/:id/ai/description` | Gera descrição (LLM se `AI_API_KEY`, senão template) — dono |
| `GET` | `/api/tenants/current` | Vitrine do tenant (por subdomínio/header) |
| `GET` | `/api/catalog/makes` | Marcas do catálogo (com contagem) |
| `GET` | `/api/catalog/models` | Modelos do catálogo (`make`, `segment`, `fuel`, `q`) — base de prefill |
| `GET` | `/api/crm/leads` · `POST` | Listar / criar leads (tenant) |
| `GET` | `/api/crm/pipeline` | Board do funil por estágio (tenant) |
| `POST` | `/api/crm/deals` · `PATCH /:id/move` | Criar / mover negociação (tenant) |
| `GET` | `/api/dashboard/summary` | KPIs, origem dos leads e funil (tenant) |
| `POST` | `/api/vehicles/:id/events` | Registra evento do anúncio (view/click/contact/share) — público |
| `POST` | `/api/vehicles/:id/favorite` | Favoritar/desfavoritar (toggle) — auth |
| `GET` | `/api/vehicles/:id/stats` | Analytics do anúncio p/ o dono (dashboard grátis) |
| `GET` | `/api/me/favorites` | Meus favoritos — auth |
| `GET` | `/api/postsale/partners` | Parceiros da jornada de pós-venda |
| `POST` | `/api/postsale/vehicles/:id/sold` | Marca vendido e abre a jornada — dono |
| `POST` | `/api/postsale/offers` | Contrata serviço (calcula comissão) — dono |
| `GET` | `/api/postsale/offers?vehicleId=` | Ofertas contratadas do veículo — dono |
| `GET` | `/api/vehicles/:id/media` · `POST` | Listar / anexar mídia do anúncio |
| `POST` | `/api/vehicles/:id/media/presign` | Gera URL de upload (dono) |
| `DELETE` | `/api/vehicles/:id/media/:mediaId` | Remove mídia (dono) |
| `PUT`/`GET` | `/api/storage/:key` | Upload/serve de objetos (provider local de dev) |
| `GET` | `/api/admin/overview` | Métricas consolidadas (MRR/ARR/churn/receita) — só PLATFORM_ADMIN |
| `GET` | `/api/admin/tenants` | Lista de lojistas — só PLATFORM_ADMIN |
| `GET` | `/api/health` | Healthcheck (inclui status do banco) |

### Upload de mídia (fotos/vídeos)

Fluxo em 3 passos (mesmo contrato de um bucket S3 com URL pré-assinada):

1. `POST /vehicles/:id/media/presign` → `{ uploadUrl, publicUrl }`
2. `PUT {uploadUrl}` com os bytes do arquivo (o cliente sobe direto ao storage)
3. `POST /vehicles/:id/media` com `{ url: publicUrl, type }` → cria o `VehicleMedia`

Em dev, um **provider local** (`StorageService`) grava em `STORAGE_DIR` e serve por
`/api/storage/:key`. Em produção, troca-se por um bucket S3-compatível — o restante do
fluxo permanece idêntico. É por aqui que fotos licenciadas ou do lojista entram (inclusive
para os modelos do catálogo).

### Catálogo de modelos

Base reutilizável (`CatalogModel`) para *prefill* ao criar anúncios — **não** são anúncios
(sem preço/vendedor). A linha BMW já vem populada:

```bash
pnpm db:seed:catalog   # popula/atualiza 7 marcas (~120 modelos)
```

Marcas cobertas: **BMW, Toyota, Volkswagen, Chevrolet, Fiat, Honda, Hyundai**. Cada marca é
um arquivo em `prisma/catalog/` (fácil adicionar novas), agregadas em `prisma/catalog/index.ts`.

> **Imagens:** o catálogo não embute fotos oficiais das montadoras (direitos autorais).
> `imageUrl` fica como placeholder; fotos licenciadas ou do lojista entram depois via
> upload de mídia.

### Multi-tenancy

O `TenantMiddleware` resolve o tenant por **header `x-tenant`** ou **subdomínio**
(`loja.motora.com.br`) e o expõe via `AsyncLocalStorage` (`TenantContext`). Serviços
scoped filtram por `tenantId` (enforcement primário hoje).

**RLS (defesa em profundidade).** As policies em `prisma/policies/rls.sql` restringem, no
banco, as tabelas do tenant a `app.tenant_id`. Aplicar com:

```bash
pnpm db:rls
```

O **dono** das tabelas ignora RLS (por isso o app atual, que conecta como dono, não muda).
Para *enforcement* real em produção: conectar com um papel **não-dono** (ex.: `motora_app`,
sem BYPASSRLS) e fixar o tenant por transação via `PrismaService.withTenant(tenantId, fn)`,
que roda `set_config('app.tenant_id', …)` antes das queries. Verificado: com o papel
não-dono, cada tenant só enxerga as próprias linhas; sem contexto, nenhuma.

## O que já existe × próximos passos

**Pronto (Fase 0 → início da Fase 1):** monorepo, schema completo, design system em
código, auth (register/login/JWT), busca de veículos, criação de anúncio, vitrine de
tenant, seed e Docker.

**Próximo:** RLS/policies, upload de mídia (URLs pré-assinadas), CRM (leads/deals),
dashboards com dados reais, faturamento de assinatura. Ver [`docs/04-roadmap.md`](./docs/04-roadmap.md).
