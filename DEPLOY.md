# 🚀 Deployment Options / Opções de Deploy

**[🇺🇸 English](#-english-instructions) | [🇧🇷 Português](#-instruções-em-português)**

---

## 🇺🇸 English Instructions

### 1. Disable AI Feature (Static Mode Only)
To deploy the site *without* the AI Chat Widget, set this environment variable:
```env
VITE_ENABLE_AI=false
```

### Piloto de leads solar/wallbox

O build público usa a variável do repositório GitHub `VITE_ENABLE_LEAD_CAPTURE`:

```text
false → esconde CTAs e não abre /interesse
true  → ativa o formulário público
```

Só mudar para `true` depois de validar o backend com `ENABLE_PUBLIC_LEAD_API=true`, matching regional, termos comerciais vigentes, CRM protegido e teste sintético ponta a ponta. O deploy workflow injeta a variável apenas no job de build.

Com a flag `false`, `/interesse` também fica fora do sitemap e das páginas estáticas. O formulário usa o consentimento genérico `pilot-v3-2026-07-15`, sem revelar parceiro no contrato público, e aponta para `/privacy.html`. Para preview isolado, `VITE_LEADS_API_URL` pode apontar para um backend de teste; não definir essa variável em produção sem revisão do destino.



### 2. GitHub Pages (Official Actions workflow)
The production site is delivered by `.github/workflows/deploy.yml` through the official GitHub Pages artifact flow.

1. Pull requests run tests and a production build, but never deploy.
2. Pushes to `main` and manual runs from `main` upload `dist` and deploy through the `github-pages` environment.
3. Repository Settings > **Pages** must use **Source: GitHub Actions**.
4. `public/CNAME` must contain `guiapbev.cloud`; CI verifies that `dist/CNAME` preserves it.

Production: `https://guiapbev.cloud/`

The legacy `gh-pages` branch is kept temporarily as rollback evidence. If the Actions deployment fails during migration, restore **Deploy from a branch**, branch `gh-pages`, folder `/ (root)` without rewriting that branch.

### 3. Google Cloud Run (Containerized)
Since local Docker builds can be tricky on Windows/OneDrive, we use **Cloud Build** to build the container remotely on Google's servers.

**Prerequisites:**
- Google Cloud SDK (`gcloud`) installed.
- An active Google Cloud Project with Billing configured.

**Step-by-Step Guide:**

1. **Login and Select Project**:
   ```powershell
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
   *(Example ID: `gen-lang-client-xxxxxxxx`)*

2. **Enable Required APIs** (One time only):
   ```powershell
   gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com
   ```
   *Note: If you get a Billing error, go to the Console and link a billing account.*

3. **Build & Submit to Cloud**:
   This uploads your code and builds the Docker container on Google Cloud.
   ```powershell
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/guia-pbev .
   ```

4. **Deploy to Public URL**:
   ```powershell
   gcloud run deploy guia-pbev --image gcr.io/YOUR_PROJECT_ID/guia-pbev --region us-central1 --allow-unauthenticated
   ```

5. **Success**:
   The terminal will output your public URL:
   `Service URL: https://guia-pbev-xyz.us-central1.run.app`

   `Service URL: https://guia-pbev-xyz.us-central1.run.app`

### 3. Cloud Costs & Maintenance 💰
**Is it free?**
Yes, for most use cases! Google Cloud Run has a generous **Free Tier**:
- **Compute**: First 2 million requests/month are free.
- **Storage**: 500MB of Artifact Registry storage is free.

**Monitoring & Maintenance:**
1. **Check Costs**: Visit [Google Cloud Billing](https://console.cloud.google.com/billing) to monitor usage.
2. **Clean Up Storage**: Every deploy creates a new image version. To save space (and stay free), delete old images occasionally:
   ```powershell
   # List images
   gcloud container images list-tags gcr.io/YOUR_PROJECT_ID/guia-pbev
   # Delete old version
   gcloud container images delete gcr.io/YOUR_PROJECT_ID/guia-pbev@sha256:OLD_DIGEST
   ```

---

## 🇧🇷 Instruções em Português

### 1. Desativar Recurso de IA (Modo Estático)
Para fazer deploy sem o Chatbot de IA, defina esta variável de ambiente:
```env
VITE_ENABLE_AI=false
```



### 2. GitHub Pages (workflow oficial)
O site de produção é entregue por `.github/workflows/deploy.yml` usando o fluxo oficial de artifacts do GitHub Pages.

1. Pull requests executam testes e build de produção, mas nunca fazem deploy.
2. Pushes em `main` e execuções manuais a partir de `main` enviam `dist` e publicam pelo environment `github-pages`.
3. Em Settings > **Pages**, a origem deve ser **Source: GitHub Actions**.
4. `public/CNAME` deve conter `guiapbev.cloud`; o CI confirma sua presença em `dist/CNAME`.

Produção: `https://guiapbev.cloud/`

A branch legada `gh-pages` é mantida temporariamente como evidência de rollback. Se a migração falhar, restaure **Deploy from a branch**, branch `gh-pages`, pasta `/ (root)`, sem reescrever essa branch.

#### Segurança do build estático

- Nunca configure `VITE_GEMINI_API_KEY`, `VITE_OCM_API_KEY`, `VITE_ORS_API_KEY` ou `VITE_LANGSMITH_API_KEY` no environment de produção. Elas são aceitas apenas para desenvolvimento local.
- Usuários fornecem suas próprias chaves no navegador; Gemini, OCM e ORS ficam somente em `sessionStorage` e expiram ao encerrar a sessão da aba.
- `npm run build` termina com `tools/check-dist-secrets.mjs`. Qualquer credencial conhecida, private key, arquivo `.env` ou valor `VITE_*_API_KEY` encontrado em `dist/` bloqueia o deploy.
- `index.html` entrega CSP por `<meta http-equiv>`. Ao alterar blocos `<script>` inline, recalcule seus hashes SHA-256 e atualize o teste `clientSecurityContract.test.ts`.
- No domínio customizado, manifesto PWA e recursos públicos usam caminhos absolutos na raiz (`/manifest.json`, `/icon.svg`, `/repo-banner.png`); não use o prefixo legado `/Guia-PBEV-Brasil/`.
- Automações versionadas em `.github/scripts/` executam `git` e `gh` com `execFileSync`, argumentos separados, `shell: false` e allowlist explícita; conteúdo externo ou multilinha deve entrar por `stdin` (`gh --body-file -`), nunca por argumento de linha de comando.
- No GitHub, mantenha Dependabot e CodeQL ativos. A política de Actions aceita apenas Actions oficiais do GitHub e exige referência por SHA completo.
- GitHub Pages não permite headers HTTP arbitrários no origin. HSTS, `X-Frame-Options` e headers adicionais exigem CDN/edge na frente do Pages.

### 3. Google Cloud Run (Método Verificado)
Como builds locais do Docker podem falhar no Windows/OneDrive, usamos o **Cloud Build** para construir o container remotamente nos servidores do Google.

**Pré-requisitos:**
- Google Cloud SDK (`gcloud`) instalado.
- Um Projeto Google Cloud ativo com Faturamento (Billing) configurado.

**Guia Passo a Passo:**

1. **Login e Seleção do Projeto**:
   ```powershell
   gcloud auth login
   gcloud config set project SEU_ID_DO_PROJETO
   ```
   *(Exemplo de ID: `gen-lang-client-xxxxxxxx`)*

2. **Habilitar APIs Necessárias** (Apenas primeira vez):
   ```powershell
   gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com
   ```
   *Nota: Se der erro de Billing, acesse o Console e ative o faturamento.*

3. **Compilar e Enviar para Nuvem**:
   Isso envia seu código e constrói o container Docker no Google Cloud.
   ```powershell
   gcloud builds submit --tag gcr.io/SEU_ID_DO_PROJETO/guia-pbev .
   ```

4. **Deploy para URL Pública**:
   ```powershell
   gcloud run deploy guia-pbev --image gcr.io/SEU_ID_DO_PROJETO/guia-pbev --region us-central1 --allow-unauthenticated
   ```

   `Service URL: https://guia-pbev-xyz.us-central1.run.app`

### 3. Custos e Manutenção 💰
**É gratuito?**
Sim, para a maioria dos casos! O Google Cloud Run tem um **Nível Gratuito** generoso:
- **Computação**: Primeiros 2 milhões de requisições/mês são grátis.
- **Armazenamento**: 500MB de armazenamento no Artifact Registry são grátis.

**Monitoramento e Limpeza:**
1. **Verificar Custos**: Acesse o [Google Cloud Billing](https://console.cloud.google.com/billing) para monitorar.
2. **Limpar Armazenamento**: Cada deploy cria uma nova versão da imagem. Para economizar espaço (e manter-se grátis), apague versões antigas ocasionalmente:
   ```powershell
   # Listar imagens
   gcloud container images list-tags gcr.io/SEU_ID_DO_PROJETO/guia-pbev
   # Deletar versão antiga
   gcloud container images delete gcr.io/SEU_ID_DO_PROJETO/guia-pbev@sha256:DIGEST_ANTIGO
   ```
