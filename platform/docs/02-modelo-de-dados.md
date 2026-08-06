# Modelo de Dados — Motora

Modelo conceitual multi-tenant. A implementação de referência (Prisma) vive em
`platform/prisma/schema.prisma`. Convenções:

- Toda entidade de negócio tem `id` (uuid), `created_at`, `updated_at`.
- Entidades de tenant carregam `tenant_id` (RLS aplicada). Dados B2C usam o tenant público
  e `owner_user_id`.
- Enums em MAIÚSCULAS.

## 1. Núcleo multi-tenant & identidade

### Tenant
`id · name · slug · custom_domain? · plan_id · status(ACTIVE|SUSPENDED|CANCELED) ·
trial_ends_at? · settings(jsonb) · created_at`

### User
`id · email(unique) · password_hash? · name · phone? · avatar_url? · type(SHOPKEEPER|INDIVIDUAL|PLATFORM_ADMIN) ·
two_factor_enabled · email_verified_at? · created_at`

### Membership  *(usuário ↔ tenant, com papel)*
`id · user_id · tenant_id · role(ADMIN|MANAGER|SELLER|MARKETING|FINANCE|SUPPORT) ·
status · invited_at · joined_at?`

### Permission / RolePermission
Permissões granulares por recurso+ação, agrupadas em papéis; overrides por membership.

### OAuthAccount
`id · user_id · provider(GOOGLE|APPLE|MICROSOFT) · provider_account_id · created_at`

## 2. Catálogo de veículos

### Vehicle
```
id · tenant_id? · owner_user_id?           -- lojista (tenant) OU pessoa física
title · description
make · model · version · year_model · year_fab
price · fipe_code? · fipe_price?
mileage_km · plate? · chassis(vin)?
fuel(FLEX|GASOLINE|ETHANOL|DIESEL|ELECTRIC|HYBRID|GNV)
transmission(MANUAL|AUTOMATIC|CVT|AUTOMATED)
color · doors · body_type
city · state · lat? · lng?
status(DRAFT|ACTIVE|RESERVED|NEGOTIATING|SOLD|REMOVED)
featured_tier(NONE|BRONZE|SILVER|GOLD|PLATINUM) · featured_until?
ai_score?           -- pontuação de qualidade do anúncio (0-100)
views · leads_count · favorites_count
published_at? · sold_at? · created_at
```

### VehicleMedia
`id · vehicle_id · type(PHOTO|VIDEO|VIEW_360|DOCUMENT) · url · thumb_url? · position ·
ai_quality_score? · created_at`

### VehicleOption  *(opcionais)*
`id · vehicle_id · option_id`  ·  **Option:** `id · name · category`

### FipeReference *(cache de tabela FIPE)*
`id · make · model · year · fuel · code · price · reference_month`

## 3. Marketplace & engajamento

### Favorite
`id · user_id · vehicle_id · created_at`

### SavedSearch
`id · user_id · filters(jsonb) · alert_enabled · created_at`

### ListingEvent  *(analytics do anúncio)*
`id · vehicle_id · type(VIEW|CLICK|CONTACT|SHARE|FAVORITE) · source? · utm(jsonb)? ·
visitor_hash? · created_at`

### Comparison
`id · user_id? · vehicle_ids(uuid[]) · created_at`

## 4. CRM

### Lead
`id · tenant_id · vehicle_id? · name · phone? · email? · source(MARKETPLACE|WHATSAPP|ADS|LANDING|MANUAL) ·
utm(jsonb)? · owner_user_id? · created_at`

### Deal  *(negociação no pipeline)*
`id · tenant_id · lead_id · vehicle_id? · stage(NEW|CONTACTED|VISIT|PROPOSAL|NEGOTIATION|WON|LOST) ·
value? · probability? · assigned_to? · lost_reason? · created_at · closed_at?`

### Activity  *(histórico / tarefas / agenda)*
`id · tenant_id · deal_id? · lead_id? · type(NOTE|TASK|CALL|MEETING|TEST_DRIVE|DELIVERY|MESSAGE) ·
title · due_at? · done · assigned_to? · created_at`

### Message  *(central de mensagens)*
`id · tenant_id · lead_id? · channel(WHATSAPP|EMAIL|CHAT) · direction(IN|OUT) · body ·
template_id? · status · created_at`

### MessageTemplate
`id · tenant_id · name · channel · body · variables(jsonb)`

## 5. Marketing

### LandingPage
`id · tenant_id · slug · title · content(jsonb) · published · pixel(jsonb)? · created_at`

### Campaign
`id · tenant_id · name · channel(META|GOOGLE|TIKTOK|SEO|EMAIL) · budget? · status ·
utm(jsonb) · metrics(jsonb) · created_at`

### Automation
`id · tenant_id · name · trigger(jsonb) · actions(jsonb) · active · created_at`

## 6. Financeiro & monetização

### Plan
`id · name(LOJISTA) · price_monthly(997) · features(jsonb) · active`

### Subscription
`id · tenant_id · plan_id · status(TRIALING|ACTIVE|PAST_DUE|CANCELED) ·
current_period_start · current_period_end · payment_method(PIX|CARD|BOLETO) · created_at`

### Invoice
`id · tenant_id? · subscription_id? · amount · status(OPEN|PAID|VOID|UNCOLLECTIBLE) ·
method · due_at · paid_at? · nf_url? · created_at`

### FeaturePurchase  *(destaque de anúncio)*
`id · vehicle_id · buyer_user_id · tier(BRONZE|SILVER|GOLD|PLATINUM) · amount · duration_days ·
invoice_id · created_at`

### Partner  *(marketplace de serviços de pós-venda / publicidade)*
`id · name · category(INSURANCE|FINANCING|TRANSFER|INSPECTION|WARRANTY|TRACKER|
DISPATCHER|CLEANING|ADVERTISING) · commission_rate · active · created_at`

### ServiceOffer  *(jornada de pós-venda)*
`id · vehicle_id · seller_user_id · partner_id · type · status(OFFERED|CONTRACTED|PAID|DECLINED) ·
amount? · commission_amount? · created_at`

### AdSlot / Sponsorship  *(publicidade)*
`id · partner_id · placement · start_at · end_at · amount · metrics(jsonb)`

## 7. Plataforma / Admin & auditoria

### AuditLog  *(append-only)*
`id · tenant_id? · actor_user_id? · action · entity · entity_id? · metadata(jsonb) ·
ip? · created_at`

### PlatformMetricSnapshot  *(MRR/ARR/churn/LTV/CAC ao longo do tempo)*
`id · date · mrr · arr · active_tenants · churn_rate · ltv · cac · leads · vehicles ·
vehicles_sold · commissions`

## 8. Relações principais (resumo)

```
Tenant 1─┬─* Membership *─1 User
         ├─* Vehicle *─┬─* VehicleMedia
         │             └─* VehicleOption
         ├─* Lead 1─* Deal 1─* Activity
         ├─* Message
         ├─* Campaign / LandingPage / Automation
         └─1 Subscription *─* Invoice

User (INDIVIDUAL) 1─* Vehicle (tenant público)
Vehicle 1─* ServiceOffer *─1 Partner        (jornada de pós-venda)
Vehicle 1─* FeaturePurchase                 (destaque)
```

## 9. Índices & performance (destaques)

- `Vehicle`: índices em `(tenant_id, status)`, `(make, model, year_model)`, `(price)`,
  `(city, state)`, GIN em `tsvector(title, description)`, `featured_tier + featured_until`.
- `ListingEvent`: particionamento por mês (volume alto); índice `(vehicle_id, type, created_at)`.
- `Lead`/`Deal`: `(tenant_id, stage)`, `(assigned_to)`.
- Todas as tabelas de tenant: primeiro campo do índice composto é `tenant_id`.
