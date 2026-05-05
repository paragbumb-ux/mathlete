# ◆ Mathlete — Mental Math Trainer

A web app that trains mental math across three dimensions: **speed**, **accuracy**, and **stamina**. Detects patterns in your weak areas and surfaces targeted mental math techniques to help you improve.

## Features

- **3 Training Modes**
  - **Speed Blitz** — 60-second rapid fire, maximize correct answers
  - **Precision** — 20 problems with no time pressure, pure accuracy
  - **Endurance** — 100 problems to track how performance degrades over time

- **6 Problem Categories** — Addition, Subtraction, Multiplication, Division, Percentages, Squares & Roots (plus a Mixed mode)

- **3 Difficulty Levels** — Easy / Medium / Hard with scaled number ranges

- **Intelligent Tips Engine** — After each session, the app analyzes your results by problem type. If your accuracy drops below 60% or you're 40%+ slower on a category, it surfaces a relevant mental math technique (e.g. "Round & Compensate" for addition, "Flip the Percent" for percentages). All-time stats are also checked for persistent weaknesses.

- **Stamina Analysis** — In Endurance mode, results are split into quartiles with visual bars showing accuracy/speed degradation, with specific warnings about fatigue patterns.

- **Persistent Stats** — All-time statistics stored in localStorage, tracked per problem type.

- **Mobile-First** — Fully responsive, numeric keyboard on mobile, works great on phone browsers.

## Tech Stack

- React 18 + Vite
- Pure CSS (no UI library)
- No backend — everything runs client-side

---

## Deploy to GitHub Pages (Free)

### 1. Create a GitHub Repository

Go to [github.com/new](https://github.com/new), create a **public** repo (e.g. `mathlete`).

### 2. Push This Code

```bash
cd mathlete
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mathlete.git
git push -u origin main
```

### 3. Enable GitHub Pages

In your repo on GitHub:
1. Go to **Settings → Pages**
2. Under **Source**, select **GitHub Actions**

That's it. The included workflow file (`.github/workflows/deploy.yml`) handles building and deploying automatically on every push to `main`.

### 4. Access Your Site

After ~2 minutes (check the **Actions** tab for build status), your site will be live at:

```
https://YOUR_USERNAME.github.io/mathlete/
```

Open this URL on your phone browser — it's fully mobile-optimized.

---

## Alternative: Deploy to Vercel (Free)

1. Push code to GitHub (steps 1–2 above)
2. Go to [vercel.com](https://vercel.com), sign in with GitHub
3. Click **Add New → Project**, import your repo
4. Framework Preset: **Vite** (auto-detected)
5. Click **Deploy**

Your site will be live at `https://mathlete-YOUR_USERNAME.vercel.app` within a minute.

---

## Alternative: Deploy to Netlify (Free)

1. Push code to GitHub (steps 1–2 above)
2. Go to [netlify.com](https://netlify.com), sign in with GitHub
3. Click **Add new site → Import an existing project**
4. Select your repo
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Click **Deploy site**

---

## Local Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Updating

After any code changes, just push to `main`:

```bash
git add .
git commit -m "your changes"
git push
```

GitHub Pages / Vercel / Netlify will auto-redeploy.
