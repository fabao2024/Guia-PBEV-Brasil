# 🚀 Deployment Options / Opções de Deploy

**[🇺🇸 English](#-english-instructions) | [🇧🇷 Português](#-instruções-em-português)**

---

## 🇺🇸 English Instructions

### 1. Disable AI Feature (Static Mode Only)
To deploy the site *without* the AI Chat Widget, set this environment variable:
```env
VITE_ENABLE_AI=false
```



### 2. GitHub Pages (Easiest & Automated)
For a public site **without AI** and **zero configuration**, we have set up an automated workflow.
1. Push your changes to GitHub.
2. Go to your Repository Settings > **Pages**.
3. Under "Build and deployment", select **Source**: `Deploy from a branch`.
4. Select Branch: `gh-pages` and folder `/ (root)`.
5. Click **Save**.
   
Your site will be live at: `https://YOUR_USERNAME.github.io/Guia-PBEV-Brasil/`

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



### 2. GitHub Pages (Mais Fácil e Automatizado)
Para um site público **sem IA** e **zero configuração**, configuramos um fluxo automatizado.
1. Envie suas alterações para o GitHub.
2. Vá nas Configurações do Repositório (Settings) > **Pages**.
3. Em "Build and deployment", selecione **Source**: `Deploy from a branch`.
4. Selecione a Branch: `gh-pages` e a pasta `/ (root)`.
5. Clique em **Save**.
   
Seu site estará online em: `https://SEU_USUARIO.github.io/Guia-PBEV-Brasil/`

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
