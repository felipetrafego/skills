# Design System — Motora

Sistema de design premium, minimalista e de alta performance. Referências: Stripe, Linear,
Apple, Tesla, Notion. Suporta **modo claro e escuro**, com animações suaves e microinterações.

Os tokens abaixo são a fonte de verdade; o protótipo em `platform/prototype/index.html` os
implementa. Em código, expor como CSS variables + preset do Tailwind em `packages/ui`.

## 1. Cor

### Marca
| Token | Valor | Uso |
|---|---|---|
| `--brand-600` | `#4f46e5` | Ação primária (indigo) |
| `--brand-500` | `#6366f1` | Hover/realce |
| `--brand-400` | `#818cf8` | Acento em dark |
| `--accent` | `#06b6d4` | Destaques, dados (ciano) |

### Semânticas
`success #16a34a · warning #d97706 · danger #dc2626 · info #0284c7`.
Tiers de destaque: `bronze #b45309 · prata #64748b · ouro #d4af37 · platinum #8b95a5`.

### Superfícies (light / dark)
| Papel | Light | Dark |
|---|---|---|
| `--bg` | `#f8fafc` | `#0a0a0f` |
| `--surface` | `#ffffff` | `#14141c` |
| `--surface-2` | `#f1f5f9` | `#1c1c26` |
| `--border` | `#e2e8f0` | `#26263a` |
| `--text` | `#0f172a` | `#f1f5f9` |
| `--text-muted` | `#64748b` | `#9ca3af` |

Contraste mínimo AA (4.5:1 texto normal, 3:1 texto grande/ícones).

## 2. Tipografia

- **Fonte:** Inter (UI) / system-ui fallback; números tabulares em dados (`font-variant-numeric: tabular-nums`).
- **Escala:** 12 · 13 · 14 · 16 · 18 · 20 · 24 · 30 · 36 · 48 (px).
- **Pesos:** 400 (corpo), 500 (labels), 600 (títulos), 700 (display).
- **Line-height:** 1.5 corpo, 1.2 títulos. **Tracking:** -0.01em a -0.02em em títulos grandes.

## 3. Espaçamento, raio, elevação

- **Espaço (4px base):** 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64.
- **Raio:** `sm 8 · md 12 · lg 16 · xl 20 · full 9999`.
- **Sombra (leve, premium):** `sm`, `md`, `lg` com baixa opacidade; em dark, elevação por
  superfície + borda, não por sombra forte.

## 4. Movimento

- **Duração:** 120ms (micro), 200ms (padrão), 320ms (entrada de superfícies).
- **Easing:** `cubic-bezier(0.2, 0.8, 0.2, 1)` (saída suave).
- Respeitar `prefers-reduced-motion`. Microinterações: hover elevando cards, transições de
  cor, skeletons, toasts deslizando, foco visível.

## 5. Biblioteca de componentes

Componentes reutilizáveis (a implementar em `packages/ui`):

- **Ações:** Button (primary/secondary/ghost/danger, tamanhos, loading), IconButton
- **Formulário:** Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, Slider,
  Upload (imagens/vídeos, drag-and-drop), DatePicker/Calendar
- **Dados:** Table (ordenação, paginação, seleção), Card, Stat/KPI tile, Badge, Tag, Avatar,
  Progress, Meter, Sparkline, Chart (linha/barra/donut/funil — ver skill `dataviz`)
- **Navegação:** Sidebar, Topbar, Tabs, Breadcrumb, Pagination, Stepper, Timeline
- **Feedback:** Modal/Dialog, Drawer, Toast, Alert, Tooltip, Popover, Skeleton, EmptyState,
  Spinner
- **Layout:** Container, Grid, Divider, Section

### Padrões de estado
Todo componente de dados define: **loading (skeleton)**, **empty state**, **erro** e
**sucesso**. Nada de tela em branco.

## 6. Acessibilidade

Navegação por teclado, foco visível, `aria-*` corretos, alvos ≥ 44px, contraste AA, textos
alternativos em mídia, e suporte a leitor de tela nos fluxos críticos (busca, publicação,
checkout de assinatura).

## 7. Densidade & responsividade

- **Breakpoints:** `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.
- Mobile-first. Tabelas viram cards/rolam em telas estreitas. Sidebar colapsa em drawer.

## 8. Iconografia

Conjunto de ícones de linha (stroke ~1.5px), estilo consistente (ex.: Lucide). Ícones nunca
transmitem informação sozinhos sem rótulo/`aria-label`.
