# 🚀 Deployment Options / Opções de Deploy

**[🇺🇸 English](#-english-instructions) | [🇧🇷 Português](#-instruções-em-português)**

---

## 🇺🇸 English Instructions

### 1. Disable AI Feature (Static Mode Only)
To deploy the site *without* the AI Chat Widget, set this environment variable:
```env
VITE_ENABLE_AI=false
```

### 2. Google Cloud Run (Verified Method)
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

---

## 🇧🇷 Instruções em Português

### 1. Desativar Recurso de IA (Modo Estático)
Para fazer deploy sem o Chatbot de IA, defina esta variável de ambiente:
```env
VITE_ENABLE_AI=false
```

### 2. Google Cloud Run (Método Verificado)
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

5. **Sucesso**:
   O terminal exibirá sua URL pública:
   `Service URL: https://guia-pbev-xyz.us-central1.run.app`
