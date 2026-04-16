# 🎓 Hosny AI — Kiddycare Paradise School

Your personal AI tutor for students at Kiddycare Paradise School.

---

## 🚀 How to Deploy on Vercel (Step by Step)

### Step 1 — Get your Anthropic API Key
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Click **API Keys** in the left menu
4. Click **Create Key**, name it "Hosny AI", and copy it

---

### Step 2 — Upload to GitHub
1. Go to https://github.com and create a free account
2. Click **New Repository**, name it `hosny-ai`, click **Create**
3. Upload all these project files into the repository

---

### Step 3 — Deploy on Vercel
1. Go to https://vercel.com and sign up with your GitHub account
2. Click **Add New Project**
3. Select your `hosny-ai` repository
4. Before clicking Deploy, click **Environment Variables**
5. Add this variable:
   - **Name:** `VITE_ANTHROPIC_API_KEY`
   - **Value:** paste your Anthropic API key here
6. Click **Deploy** 🎉

---

### Step 4 — Share with students
Vercel will give you a free link like:
`https://hosny-ai.vercel.app`

Share this link with students — it works on any phone, tablet, or computer!

---

## 📁 Project Files

```
hosny-ai/
├── index.html          ← App entry point
├── package.json        ← Project config
├── vite.config.js      ← Build config
├── .env.example        ← API key template
└── src/
    ├── main.jsx        ← App loader
    ├── App.jsx         ← Main app code
    └── index.css       ← Global styles
```

---

## 🆘 Need Help?
Contact your IT support or go back to Claude and ask for help!
