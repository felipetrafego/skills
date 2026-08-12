# Monetização — Motora

Quatro motores de receita que se reforçam: a base gratuita gera **volume e liquidez**, que
alimenta o marketplace, que sustenta assinaturas, comissões, destaques e publicidade.

## 1. Receita Recorrente (assinatura de lojistas) — MRR/ARR

- **Plano Lojista:** R$ 997/mês. Trial inicial configurável.
- Cobrança via PIX, cartão (recorrente) ou boleto.
- Métricas-chave: **MRR** = assinantes ativos × ticket; **ARR** = MRR × 12; **churn**,
  **LTV** = ticket ÷ churn mensal, **CAC**, LTV/CAC.

> Exemplo de projeção (ilustrativo): 500 lojistas ativos → MRR R$ 498.500 → ARR ~R$ 6,0 mi.

## 2. Receita Transacional (comissão de pós-venda)

Disparada quando o vendedor marca o veículo como **vendido** e entra na jornada. Cada oferta
contratada gera comissão registrada em `ServiceOffer.commission_amount`.

| Serviço | Parceiro típico | Base de comissão |
|---|---|---|
| Transferência de propriedade | Despachante | % do serviço |
| Seguro | Seguradora | % do prêmio (1ª parcela/anual) |
| Financiamento | Banco/fintech | % do valor financiado |
| Garantia estendida | Provedor de garantia | % do plano |
| Vistoria | Empresa de vistoria | valor fixo/% |
| Despachante | Despachante | % do serviço |
| Rastreador | Provedor de rastreamento | % da adesão/mensal |
| Revisão / Lavação / Polimento | Oficina/estética | % do serviço |
| Marketplace de parceiros | Diversos | % da transação |

**Fluxo:** oferta apresentada → usuário aceita → parceiro atende → confirmação →
comissão contabilizada → repasse conciliado no financeiro.

## 3. Receita por Destaque (impulsionamento de anúncios)

Planos aplicados a um `Vehicle` (`featured_tier`, `featured_until`):

| Plano | Posição | Selo | Alcance | Duração sugerida |
|---|---|---|---|---|
| **Bronze** | Acima dos orgânicos | Bronze | Local | 7 dias |
| **Prata** | Topo por categoria | Prata | Regional | 15 dias |
| **Ouro** | Destaque na home | Ouro | Estadual | 30 dias |
| **Platinum** | 1ª posição + push | Platinum | Nacional | 30 dias |

> Preços a definir por experimentação (ver skill de pricing/A-B). Registrar em
> `FeaturePurchase` e faturar em `Invoice`.

## 4. Receita por Publicidade

Espaços patrocinados (`AdSlot`/`Sponsorship`) para bancos, seguradoras, oficinas, autopeças,
vistoria, concessionárias e serviços automotivos.

- **Placements:** home, resultados de busca, página de veículo, jornada de pós-venda,
  e-mails/alertas.
- **Modelos:** CPM, CPC, período fixo (patrocínio) e performance (CPA via parceiro).
- Segmentação por marca/modelo/faixa de preço/localização/estágio do funil.

## 5. Consolidação no painel administrativo

O painel admin da plataforma consolida todas as fontes:
`MRR · ARR · churn · LTV · CAC · comissões · receita de destaque · receita de publicidade ·
receita total` — com séries históricas em `PlatformMetricSnapshot`.

## 6. Princípios

- **Gratuito para pessoa física é inegociável** — é o motor de volume.
- Monetização transacional aparece **no momento certo** (pós-venda), sem atrito na publicação.
- Destaque e publicidade não podem degradar a qualidade/relevância da busca — separar
  claramente conteúdo patrocinado de orgânico.
