# Project Deployment Guide for GitHub

This repository contains:
- **`frontend/`**: Vite + React single page app
- **`backend/`**: Express / Node.js API server

---

## 1. Push Code to GitHub

Open terminal in the project root directory (`Project Abhi`) and run:

```bash
git init
git add .
git commit -m "Production release"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```

---

## 2. Deploy Frontend to GitHub Pages

### Option A: Automatic via GitHub Actions (Recommended)
1. Go to your repository on **GitHub.com**.
2. Click **Settings** -> **Pages** (on the left sidebar).
3. Under **Build and deployment** -> **Source**, select **GitHub Actions**.
4. Push your code to the `main` branch. The included workflow (`.github/workflows/deploy.yml`) will automatically build and deploy `frontend/dist` to GitHub Pages!

### Option B: Manual Deploy using `gh-pages`
If you prefer deploying built files directly:
1. In `frontend/`:
   ```bash
   npm install -D gh-pages
   ```
2. Add to `frontend/package.json` scripts:
   ```json
   "deploy": "vite build && gh-pages -d dist"
   ```
3. Run `npm run deploy` inside `frontend/`.

---

## 3. Deploy Backend (Express API)

GitHub Pages hosts static frontends only (it cannot run Node.js backend servers). You can host the Express backend for free on **Render**, **Railway**, or **Koyeb**:

### Deploying on Render (Free Tier):
1. Create a free account on [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Environment Variables on Render:
   - `PORT`: `5000`
   - `JWT_SECRET`: `<your-secret-key>`
   - `FRONTEND_URL`: `https://<YOUR-USERNAME>.github.io`
6. Click **Deploy Web Service**. Render will give you a backend URL like `https://project-backend.onrender.com`.

---

## 4. Connect Frontend to Production Backend

Once your backend is live on Render:
1. In your GitHub Repository, go to **Settings** -> **Secrets and variables** -> **Actions**.
2. Click **New repository secret**.
3. Name: `VITE_API_URL`
4. Value: `https://project-backend.onrender.com` (your live backend URL).
5. Trigger a new deployment on GitHub Actions.
