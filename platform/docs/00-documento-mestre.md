# Documento Mestre — Motora

> **Motora** (codinome de trabalho) é uma plataforma SaaS de tecnologia para o mercado
> automotivo brasileiro. Este documento é a fonte única de verdade da visão, do modelo
> de negócio e do escopo. Todo o desenvolvimento deve derivar daqui.

---

## 1. Missão

Construir o **maior ecossistema digital para compra, venda e gestão de veículos do Brasil**,
unindo em um único ambiente inteligente:

- Lojistas e concessionárias
- Revendas independentes
- Vendedores particulares (pessoa física)
- Compradores

Não é "mais um site de anúncios". É um **ecossistema SaaS multi-tenant** onde cada lojista
opera seu próprio ambiente isolado, enquanto pessoas físicas anunciam gratuitamente para
gerar volume e liquidez no marketplace.

**Requisito não-funcional central:** escalar para **milhões de usuários** e **milhares de
empresas**, com performance premium e isolamento de dados por tenant.

---

## 2. Públicos

### Público 1 — Lojistas (B2B, pago)

Assinatura **R$ 997/mês**. Cada lojista recebe um ambiente completo:

| Recurso | Descrição |
|---|---|
| Painel exclusivo | Ambiente isolado por tenant |
| Página personalizada | Vitrine própria (subdomínio / domínio custom) |
| Estoque ilimitado | Sem limite de veículos |
| CRM | Clientes, pipeline, negociações |
| Dashboard | KPIs, funil, receita, metas |
| Gestão de equipe | Papéis e permissões |
| Marketing | Landing pages, Ads, SEO, automações |
| Inteligência Artificial | Geração de anúncios, precificação, atendimento |
| Relatórios | Leads, vendas, conversões, exportação |
| API | Integração externa |
| Landing Pages | Construtor de páginas |
| Automação | Fluxos e gatilhos |
| Funil de vendas | Pipeline visual |
| Atendimento | WhatsApp, chat, central de mensagens |
| Aplicativo Mobile | App para gestão em campo |

### Público 2 — Pessoa Física (B2C, gratuito)

Cadastro **100% gratuito, sem taxa para anunciar**. O usuário pode:

- Criar conta, anunciar veículos, publicar fotos e vídeos
- Informar quilometragem, opcionais, preço
- Atualizar informações, conversar com compradores
- Compartilhar e remover o anúncio quando quiser

**Objetivo estratégico:** volume de veículos → liquidez → efeito de rede → base para
monetização transacional e publicitária.

---

## 3. Modelo de Monetização

Quatro fontes de receita combinadas:

### 3.1 Receita Recorrente (MRR)
Assinatura dos lojistas (R$ 997/mês). Base previsível do negócio.

### 3.2 Receita Transacional (comissão)
Após o usuário marcar um veículo como **vendido**, abre-se a **jornada de pós-venda**
oferecendo serviços — cada contratação gera comissão:

`Transferência · Seguro · Financiamento · Garantia estendida · Vistoria · Despachante ·
Rastreador · Revisão · Lavação · Polimento · Marketplace de parceiros`

### 3.3 Receita por Destaque (impulsionamento)
Planos de destaque para anúncios: **Bronze · Prata · Ouro · Platinum**.
Anúncios destacados aparecem nas primeiras posições.

### 3.4 Receita por Publicidade
Espaços patrocinados: bancos, seguradoras, oficinas, autopeças, empresas de vistoria,
concessionárias, serviços automotivos.

---

## 4. Experiência do Usuário

Padrão de qualidade: **os melhores produtos SaaS do mundo**.

**Referências:** Stripe · Linear · Apple · Tesla · Notion.

**Princípios:** minimalista · premium · rápido · responsivo · intuitivo · elegante · alta
performance. Modo claro e escuro, animações suaves, microinterações.

Ver [`05-design-system.md`](./05-design-system.md).

---

## 5. Módulos do Sistema

Visão de alto nível (detalhamento e prioridade no [roadmap](./04-roadmap.md)):

- **Dashboard** — resumo, leads, visualizações, veículos, conversões, receita, funil,
  origem dos leads, ranking, metas.
- **Gestão de Estoque** — cadastro completo (fotos, vídeos, 360°, documentos), FIPE,
  placa, chassi, combustível, transmissão, opcionais, status (reservado/vendido/negociação).
- **Marketplace** — pesquisa inteligente, filtros avançados, comparador, favoritos,
  recomendação por IA, veículos similares, busca por localização/mapa.
- **CRM** — clientes, negociações, pipeline, histórico, tarefas, agenda, chat, WhatsApp,
  e-mail, observações.
- **Marketing** — landing pages, Meta/Google/TikTok Ads, SEO, blog, campanhas, pixel,
  UTM, remarketing, automações.
- **Inteligência Artificial** — criar/melhorar anúncios, analisar fotos, gerar títulos,
  criar campanhas, responder clientes, analisar preço, comparar concorrência, prever vendas.
- **Financeiro** — assinaturas, PIX, cartão, boletos, comissões, fluxo de caixa, NFs.
- **Usuários & Permissões** — admin, gerente, vendedor, marketing, financeiro, atendente,
  permissões personalizadas.
- **Agenda** — test drive, entrega, documentação, reuniões, calendário, notificações.
- **Atendimento** — WhatsApp, chat, ligação, central de mensagens, templates, automações.
- **Relatórios** — leads, vendas, conversões, equipe, marketing, financeiro, exportação
  PDF/Excel.

---

## 6. Jornada do Usuário Gratuito

```
Cadastro → Publica veículo → Recebe contatos → Negocia → Marca como vendido
        → Sistema: "Como foi a venda?"
        → Jornada de pós-venda (receita por comissão):
             Transferência · Seguro · Financiamento · Despachante · Garantia
             · Marketplace de serviços · Avaliação do comprador · Indicação
             · Compra do próximo veículo
```

**Dashboard do usuário gratuito:** visualizações, interessados, cliques, favoritos,
mensagens, compartilhamentos, comparação com anúncios semelhantes, tempo médio para venda,
sugestões da IA, pontuação do anúncio, qualidade das fotos, preço vs. mercado.

---

## 7. Painel Administrativo da Plataforma

Clientes ativos · lojistas · usuários · **MRR** · **ARR** · **churn** · **LTV** · **CAC** ·
leads gerados · veículos cadastrados · veículos vendidos · comissões · parceiros · suporte ·
financeiro · logs · auditoria.

---

## 8. Stack Tecnológica

**Frontend:** Next.js · React · TypeScript · Tailwind CSS
**Backend:** NestJS · Node.js · PostgreSQL · Prisma ORM · Redis
**Infra:** Docker · Kubernetes · Nginx · CDN · Cloud Storage
**Auth:** JWT · OAuth (Google, Apple, Microsoft) · 2FA
**Integrações:** WhatsApp · Meta Ads · Google Ads · pagamentos · financiamento · seguro ·
despachantes

Detalhes em [`01-arquitetura.md`](./01-arquitetura.md).

---

## 9. Segurança & Conformidade

Arquitetura multi-tenant com isolamento · LGPD · criptografia (repouso e trânsito) · 2FA ·
controle de permissões (RBAC) · logs completos · backups automáticos · firewall (WAF) ·
monitoramento em tempo real · auditoria · escalabilidade horizontal.

---

## 10. Objetivo Final

Uma plataforma automotiva de nova geração, conectando **milhares de lojistas** e **milhões
de usuários** em um único ambiente digital, com experiência premium e escalável. Empresas
gerenciam operações ponta a ponta; pessoas físicas anunciam de graça. Monetização combinando
assinaturas, comissões, destaques e publicidade — tornando a Motora referência nacional em
tecnologia para o mercado automotivo.

---

### Documentos relacionados
- [`01-arquitetura.md`](./01-arquitetura.md) — arquitetura técnica e multi-tenancy
- [`02-modelo-de-dados.md`](./02-modelo-de-dados.md) — entidades e schema
- [`03-monetizacao.md`](./03-monetizacao.md) — receita, planos e comissões
- [`04-roadmap.md`](./04-roadmap.md) — fases de entrega
- [`05-design-system.md`](./05-design-system.md) — tokens e componentes
