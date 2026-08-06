# Motora — Plataforma SaaS de Marketplace Automotivo

> **Motora** (codinome de trabalho — marca substituível) é uma plataforma SaaS multi-tenant
> para o mercado automotivo brasileiro: une lojistas, concessionárias, revendas, vendedores
> particulares e compradores em um único ecossistema. Lojistas pagam assinatura; pessoas
> físicas anunciam de graça.

Este diretório contém a **fundação do projeto**: documentação mestre, um protótipo visual
navegável e o **scaffold do monorepo** (web + api + design system + Prisma). Para rodar
localmente, veja [`DEVELOPMENT.md`](./DEVELOPMENT.md).

## Código (monorepo)

```
apps/web        Next.js 14 (App Router) — marketplace + painéis
apps/api        NestJS 10 — API modular multi-tenant (auth, tenants, vehicles, health)
packages/ui     Design system em React + tokens.css
packages/config Preset Tailwind com os tokens
prisma/         schema.prisma (multi-tenant) + seed
```

## Documentação

| Documento | Conteúdo |
|---|---|
| [`docs/00-documento-mestre.md`](./docs/00-documento-mestre.md) | Visão, públicos, escopo, objetivo final |
| [`docs/01-arquitetura.md`](./docs/01-arquitetura.md) | Arquitetura técnica e multi-tenancy |
| [`docs/02-modelo-de-dados.md`](./docs/02-modelo-de-dados.md) | Entidades e relações |
| [`docs/03-monetizacao.md`](./docs/03-monetizacao.md) | Assinatura, comissões, destaques, publicidade |
| [`docs/04-roadmap.md`](./docs/04-roadmap.md) | Entrega por fases |
| [`docs/05-design-system.md`](./docs/05-design-system.md) | Tokens e componentes |

## Protótipo visual

[`prototype/index.html`](./prototype/index.html) — protótipo navegável, autocontido (um único
arquivo HTML, sem dependências externas). Demonstra a experiência premium (modo claro/escuro)
com as telas principais:

- Marketplace público (busca + vitrine)
- Página de veículo
- Dashboard do lojista (KPIs, funil, ranking)
- CRM (pipeline kanban)
- Dashboard do usuário gratuito (performance do anúncio + IA)
- Jornada de pós-venda ("Como foi a venda?")
- Painel administrativo da plataforma (MRR/ARR/churn)

**Abrir:** basta abrir o arquivo no navegador (ou servir a pasta).

## Modelo de negócio (resumo)

- **Lojistas:** R$ 997/mês — ambiente completo (estoque, CRM, marketing, IA, relatórios, API).
- **Pessoa física:** grátis para anunciar — motor de volume e liquidez.
- **Receita:** assinatura (MRR) + comissões de pós-venda + destaques (Bronze→Platinum) + publicidade.

## Stack alvo

Next.js · React · TypeScript · Tailwind — NestJS · PostgreSQL · Prisma · Redis —
Docker · Kubernetes · CDN. Auth JWT/OAuth/2FA. Ver arquitetura.

## Status

**Fase 0 concluída · Fase 1 iniciada.** Monorepo scaffoldado, schema de dados completo e
validado, design system em código, e uma fatia vertical da API no ar (auth + busca/criação
de veículos + vitrine de tenant). Próximo: RLS/policies, upload de mídia, CRM e dashboards
com dados reais. Ver [roadmap](./docs/04-roadmap.md) e [guia de dev](./DEVELOPMENT.md).
