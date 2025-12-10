# 🚀 Deployment Options / Opções de Deploy

This guide covers how to host the "Guia PBEV" application, with or without the AI feature.

## 1. Disable AI Feature (Static Mode Only)
To deploy the site *without* the AI Chat Widget, simply set the following environment variable in your build or deployment configuration:

```env
VITE_ENABLE_AI=false
```
When this variable is set to `false`, the chat button and widget will not be rendered.

---

## 2. Recommended: Static Hosting (Free & Fast)
For a static site (SPA), services like **Vercel**, **Netlify**, or **GitHub Pages** are better suited than Cloud Run. They are often free, have global CDNs, and require zero configuration.

### Vercel / Netlify
1. Connect your GitHub repository.
2. Import the project.
3. Set Build Command: `npm run build`
4. Set Output Directory: `dist`
5. (Optional) Add Environment Variables:
   - `VITE_GEMINI_API_KEY`: [Your Key] (if you want AI)
   - `VITE_ENABLE_AI`: `false` (if you want to disable AI)

---

## 3. Google Cloud Run (Containerized)
If you specifically need to use Google Cloud Run (as requested), we have added a `Dockerfile` and `nginx.conf` to the project.

### Prerequisites
- Google Cloud CLI (`gcloud`) installed.
- Docker installed.

### Steps
1. **Build the Container**:
   ```bash
   docker build -t guia-pbev .
   ```

2. **Run Locally (Test)**:
   ```bash
   docker run -p 8080:8080 guia-pbev
   ```
   Access at `http://localhost:8080`.

3. **Deploy to Cloud Run**:
   ```bash
   # 1. Tag for GCR (Replace PROJECT_ID)
   docker tag guia-pbev gcr.io/YOUR_PROJECT_ID/guia-pbev
   
   # 2. Push to Registry
   docker push gcr.io/YOUR_PROJECT_ID/guia-pbev
   
   # 3. Deploy
   gcloud run deploy guia-pbev \
     --image gcr.io/YOUR_PROJECT_ID/guia-pbev \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Disabling AI on Cloud Run
To disable AI in Cloud Run, pass the variable during deploy:
```bash
gcloud run deploy ... --set-env-vars VITE_ENABLE_AI=false
```
