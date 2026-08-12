# Roadmap por Fases — Motora

Entrega incremental. Cada fase é utilizável e adiciona valor. Prioriza o **loop de liquidez**
(anúncios grátis → tráfego → leads → assinaturas) antes de recursos avançados.

## Fase 0 — Fundação (atual)
- [x] Documento mestre, arquitetura, modelo de dados, monetização, design system
- [x] Protótipo visual navegável (marketplace + dashboards)
- [x] Scaffold do monorepo (web + api + packages) e `schema.prisma` completo/validado
- [x] Design system em código (tokens + componentes base)
- [x] Autenticação base (JWT: register/login/me) + slice de veículos e vitrine de tenant
- [ ] OAuth (Google/Apple/Microsoft), CI/CD e ambientes

**Meta:** base técnica e visão validada.

## Fase 1 — MVP Marketplace + Anúncio Grátis (B2C)
- Cadastro/login (e-mail + Google), perfil de pessoa física
- Publicar veículo: fotos, vídeo, quilometragem, opcionais, preço, FIPE
- Marketplace público: busca, filtros avançados, página de veículo, favoritos
- Contato comprador↔vendedor (chat/WhatsApp)
- Dashboard do usuário gratuito: views, interessados, mensagens, pontuação do anúncio
- SEO (SSR, sitemap, dados estruturados)

**Meta:** volume de veículos e tráfego orgânico. **Loop de liquidez ligado.**

## Fase 2 — SaaS Lojista (B2B) + Faturamento
- Onboarding de tenant, página/vitrine personalizada, multi-tenancy completo (RLS)
- Gestão de estoque (CRUD completo, mídia, status, importação)
- Dashboard do lojista (KPIs, funil, metas, ranking)
- Usuários & permissões (RBAC por papel)
- Assinatura R$ 997/mês (PIX/cartão/boleto), faturas, NF
- Painel administrativo da plataforma (MRR, ARR, churn, clientes)

**Meta:** primeira receita recorrente.

## Fase 3 — CRM + Atendimento
- Leads, pipeline (kanban), negociações, atividades, agenda
- Central de mensagens: WhatsApp, e-mail, chat, templates
- Automações básicas (gatilho → ação)
- Relatórios (leads, vendas, conversões) + exportação PDF/Excel

**Meta:** lojista opera ponta a ponta dentro da plataforma.

## Fase 4 — Monetização Transacional (pós-venda)
- Jornada "Como foi a venda?" → ofertas de serviços
- Parceiros e comissões (transferência, seguro, financiamento, garantia, vistoria…)
- Marketplace de parceiros e conciliação financeira de comissões

**Meta:** receita transacional escalando com o volume.

## Fase 5 — Impulsionamento & Publicidade
- Destaques Bronze/Prata/Ouro/Platinum (compra + ranking)
- Espaços patrocinados (CPM/CPC/patrocínio), segmentação e relatórios de campanha
- Separação clara orgânico × patrocinado

**Meta:** receita de destaque + publicidade.

## Fase 6 — Inteligência Artificial
- Geração/melhoria de anúncios, títulos, análise de fotos
- Precificação inteligente (FIPE + comparáveis), sugestões, pontuação
- Respostas de atendimento, previsão de vendas, análise de concorrência
- Recomendação e "veículos similares" no marketplace

**Meta:** diferencial competitivo e produtividade.

## Fase 7 — Marketing avançado & Mobile
- Construtor de landing pages, Meta/Google/TikTok Ads, pixel, UTM, remarketing, blog/SEO
- Aplicativo mobile (lojista em campo + comprador)

## Fase 8 — Escala & Enterprise
- Busca em OpenSearch (facetas, geo, relevância), particionamento de eventos
- Extração de serviços (IA, mensageria, billing) conforme carga
- Hardening de segurança/LGPD, auditoria, tenants dedicados, SLA

---

### Trilhas transversais (contínuas)
Segurança & LGPD · Observabilidade · Testes & QA · Performance · Acessibilidade ·
Documentação · Design system.

> **Nota sobre prazos:** este roadmap é ordenado por dependência e valor, não por datas.
> Estimativas de tempo devem ser definidas com o time de execução por fase.
