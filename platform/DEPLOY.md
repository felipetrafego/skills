# Deploy da Motora — site + API + banco

Arquitetura de produção:

| Peça | Onde | Observação |
|---|---|---|
| **Banco (Postgres)** | Supabase | ✅ **já criado e populado** (projeto `motora`, região São Paulo) |
| **API (NestJS)** | Render (Node) | serviço web que conecta no Supabase |
| **Site (Next.js)** | Vercel | consome a API pela variável `NEXT_PUBLIC_API_URL` |

Ordem: **1) API no Render → 2) Site na Vercel** (o site precisa da URL da API).

---

## 0. Pegar a connection string do banco (Supabase)

1. Acesse o painel do Supabase → projeto **motora** → **Project Settings → Database**.
2. Em **Connection string**, copie a **URI** (modo *Session*, porta 5432). Formato:
   ```
   postgresql://postgres.dsllzowmijowgsfucocr:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
   ```
   - A `[SUA-SENHA]` é a senha do banco (definida na criação; dá pra resetar em *Database → Reset database password*).
   - Acrescente no final: `?sslmode=require`
3. Guarde essa string — é o `DATABASE_URL`.

> O schema e os dados de demonstração **já foram aplicados** nesse banco (8 veículos, 7 parceiros, logins de teste). Não precisa rodar migração nem seed.

---

## 1. API no Render

1. Crie conta em [render.com](https://render.com) e clique **New → Web Service**, conectando o repositório GitHub `felipetrafego/skills`.
2. Configure:
   - **Root Directory:** `platform`
   - **Runtime:** `Node`
   - **Build Command:**
     ```
     corepack enable && pnpm install --frozen-lockfile && pnpm db:generate && pnpm --filter @motora/api build
     ```
   - **Start Command:**
     ```
     node apps/api/dist/main.js
     ```
   - **Health Check Path:** `/api/health`
3. **Environment Variables:**
   | Chave | Valor |
   |---|---|
   | `DATABASE_URL` | *(a connection string do passo 0)* |
   | `JWT_ACCESS_SECRET` | *(uma frase secreta longa)* |
   | `JWT_REFRESH_SECRET` | *(outra frase secreta longa)* |
   | `CORS_ORIGIN` | *(preencher depois com a URL da Vercel — passo 2)* |
   | `NODE_VERSION` | `20` |
4. Deploy. Ao terminar, a API fica em algo como `https://motora-api.onrender.com`.
   Teste: abrir `https://SUA-API.onrender.com/api/health` deve responder `{"status":"ok"}`.

> Free tier do Render "dorme" após inatividade (primeira chamada demora ~30s). Normal para demo.

---

## 2. Site na Vercel

1. Em [vercel.com](https://vercel.com) → **Add New → Project**, importe `felipetrafego/skills`.
2. Configure:
   - **Root Directory:** `platform/apps/web`
   - **Framework Preset:** Next.js (detecta sozinho)
   - **Install/Build:** deixe o padrão (a Vercel resolve o pnpm workspace automaticamente).
3. **Environment Variables:**
   | Chave | Valor |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | a URL da API do Render (ex.: `https://motora-api.onrender.com`) |
   | `NEXT_TELEMETRY_DISABLED` | `1` |
4. Deploy. O site fica em algo como `https://motora.vercel.app`.

---

## 3. Fechar o ciclo (CORS)

1. Volte no **Render → seu serviço → Environment** e ajuste `CORS_ORIGIN` para a URL da Vercel
   (ex.: `https://motora.vercel.app`). Pode listar várias separadas por vírgula.
2. Salve — o Render reinicia a API.

Pronto. Acesse o site da Vercel e entre com:
- **Lojista:** `ricardo@autoprime.com.br` / `motora123`
- **Admin da plataforma:** `admin@motora.com.br` / `motora123`

---

## Observações

- **Uploads de foto:** em produção use um bucket S3-compatível (o provider local grava em disco
  efêmero). Configure `STORAGE_*` quando for para produção de verdade; para a demo, o *anexar por URL*
  e os placeholders já funcionam.
- **Domínio próprio / subdomínios de loja:** apontar o DNS para a Vercel e configurar os domínios lá.
