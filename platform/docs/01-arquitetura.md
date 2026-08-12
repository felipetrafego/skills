# Arquitetura Técnica — Motora

## 1. Visão geral

Plataforma SaaS multi-tenant composta por três superfícies e um núcleo de serviços:

```
                         ┌───────────────────────────────────────────┐
                         │                 CLIENTES                    │
   Marketplace público   │   Painel Lojista   │   Painel Admin        │
   (SEO, Next.js SSR)    │   (SPA autenticado)│   (interno)           │
                         └───────────────┬─────────────────────────────┘
                                         │ HTTPS / JSON (REST + WS)
                                ┌────────▼─────────┐
                                │   API Gateway     │  Nginx / Ingress
                                │   (rate limit,    │
                                │    auth, WAF)     │
                                └────────┬──────────┘
                                         │
              ┌──────────────────────────┼───────────────────────────┐
              │            NestJS (modular monolith → serviços)        │
              │  Auth │ Tenants │ Inventory │ Marketplace │ CRM │ AI   │
              │  Billing │ Marketing │ Messaging │ Reporting │ Admin   │
              └───┬───────────┬──────────────┬───────────────┬────────┘
                  │           │              │               │
           ┌──────▼───┐  ┌────▼────┐   ┌─────▼──────┐  ┌─────▼──────┐
           │PostgreSQL│  │  Redis  │   │Cloud Storage│  │  Fila/Jobs │
           │ (Prisma) │  │(cache,  │   │ (fotos,     │  │ (BullMQ)   │
           │          │  │ sessão) │   │  vídeos)    │  │            │
           └──────────┘  └─────────┘   └─────────────┘  └────────────┘
```

**Estratégia:** começar como **monólito modular** em NestJS (um deploy, módulos com
fronteiras claras) e extrair serviços (IA, mensageria, faturamento) para processos
independentes conforme a carga exigir. Isso evita a complexidade de microsserviços cedo
demais, sem impedir a evolução.

## 2. Multi-tenancy

**Modelo escolhido: banco único, schema compartilhado, isolamento por `tenant_id`** (row-level).

- Toda tabela de dados de negócio carrega `tenant_id` (FK para `tenants`).
- **Row-Level Security (RLS)** no PostgreSQL como rede de segurança: políticas que só
  liberam linhas do tenant do contexto da sessão (`SET app.tenant_id`).
- Camada de aplicação injeta `tenant_id` em todo query via um `PrismaTenantClient`
  (middleware/extension do Prisma) — nunca confiando apenas no código de app.
- Pessoas físicas (B2C) vivem em um **tenant público compartilhado** (`tenant_id = PUBLIC`),
  com dados de anúncio marcados por `owner_user_id`.

**Por que schema compartilhado e não schema-por-tenant / DB-por-tenant?**
- Milhares de tenants tornam schema-por-tenant custoso de migrar e operar.
- RLS + `tenant_id` escala melhor para o volume previsto e simplifica agregações
  administrativas (MRR, ranking) sem cross-DB queries.
- Tenants enterprise que exigirem isolamento físico podem, no futuro, ser promovidos a um
  cluster dedicado — a fronteira já está no `tenant_id`.

**Resolução de tenant por request:** subdomínio (`loja.motora.com.br`), domínio custom, ou
header/JWT claim. Um `TenantMiddleware` resolve e valida antes de qualquer handler.

## 3. Autenticação & Autorização

- **Auth:** JWT de acesso curto (15 min) + refresh token rotativo (httpOnly cookie).
- **OAuth:** Google, Apple, Microsoft (login social).
- **2FA:** TOTP (app autenticador) para papéis administrativos e lojistas.
- **RBAC:** papéis por tenant (`admin`, `gerente`, `vendedor`, `marketing`, `financeiro`,
  `atendente`) + permissões granulares (`permission` por recurso/ação). Guardas do NestJS
  (`@Roles`, `@RequirePermission`) aplicam a política.
- **Escopo de plataforma:** super-admin da Motora opera fora do escopo de tenant (painel admin).

## 4. Camada de dados

- **PostgreSQL** como store primário; **Prisma ORM** para schema e migrações versionadas.
- **Redis** para cache (sessões, FIPE, resultados de busca), rate limiting e locks.
- **Busca:** iniciar com Postgres (`tsvector` + índices GIN, `pg_trgm` para fuzzy); migrar
  a busca do marketplace para **OpenSearch/Elasticsearch** quando filtros facetados e
  ranking por relevância/geo exigirem.
- **Filas/Jobs:** BullMQ (sobre Redis) para tarefas assíncronas — processamento de imagem,
  geração de IA, disparos de WhatsApp/e-mail, sincronização de FIPE.

## 5. Mídia (fotos, vídeos, 360°)

- Upload direto do cliente para **Cloud Storage** via URLs pré-assinadas (evita passar o
  binário pela API).
- Pipeline assíncrono: validação → variações responsivas (thumb/médio/grande) → WebP/AVIF →
  análise de qualidade por IA → publicação. Servido via **CDN**.

## 6. Inteligência Artificial

Serviço `AI` isolado, chamado via fila para tarefas pesadas e síncrono para respostas curtas.
Casos: geração/melhoria de anúncios e títulos, análise de fotos, precificação (vs. FIPE +
comparáveis), sugestões, respostas de atendimento, previsão de vendas. Provedor de LLM
abstraído atrás de uma interface para permitir troca/roteamento por custo.

## 7. Integrações externas

WhatsApp (Cloud API), Meta Ads, Google Ads, gateways de pagamento (PIX/cartão/boleto),
APIs de financiamento, seguro e despachantes. Cada integração é um **adapter** com
credenciais por tenant (cofre criptografado), retry e circuit breaker.

## 8. Infraestrutura & Deploy

- **Contêineres** Docker; orquestração **Kubernetes**; **Nginx/Ingress** como entrada.
- **Escalabilidade horizontal:** API e workers stateless → HPA por CPU/fila.
- **CDN** para assets e mídia; **Cloud Storage** para binários.
- **Observabilidade:** logs estruturados, métricas (Prometheus), tracing (OpenTelemetry),
  alertas. Monitoramento em tempo real.
- **CI/CD:** lint + testes + migração + build de imagem + deploy por ambiente
  (dev → staging → prod).

## 9. Segurança

Criptografia em trânsito (TLS) e repouso; segredos em cofre; WAF/rate limit no gateway;
RLS por tenant; auditoria imutável (append-only) de ações sensíveis; backups automáticos com
teste de restauração; conformidade LGPD (consentimento, exportação e exclusão de dados,
minimização, DPO). Ver [`00-documento-mestre.md`](./00-documento-mestre.md) §9.

## 10. Estrutura de repositório (monorepo)

```
platform/
  apps/
    web/          Next.js — marketplace público + painéis (App Router, RSC)
    api/          NestJS — API modular
    mobile/       App (React Native / Expo) — fase posterior
  packages/
    ui/           Design system (componentes React + tokens)
    config/       ESLint, TS, Tailwind preset compartilhados
    types/        Tipos/DTOs compartilhados (gerados do Prisma/OpenAPI)
  prisma/         schema.prisma + migrações
  docs/           esta documentação
  prototype/      protótipo visual navegável (HTML)
```

> Ferramenta de monorepo sugerida: **pnpm workspaces + Turborepo** para cache de build.
