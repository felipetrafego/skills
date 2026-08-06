# Motora — Plataforma SaaS de Marketplace Automotivo

> **Motora** (codinome de trabalho — marca substituível) é uma plataforma SaaS multi-tenant
> para o mercado automotivo brasileiro: une lojistas, concessionárias, revendas, vendedores
> particulares e compradores em um único ecossistema. Lojistas pagam assinatura; pessoas
> físicas anunciam de graça.

Este diretório contém a **fundação do projeto**: documentação mestre e um protótipo visual
navegável. O código de aplicação (web/api) será scaffoldado nas próximas fases — ver roadmap.

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

**Fase 0 — Fundação.** Próximo passo sugerido: scaffold do monorepo (`apps/web`, `apps/api`,
`packages/ui`) e `prisma/schema.prisma` inicial. Ver [roadmap](./docs/04-roadmap.md).
