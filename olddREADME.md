#  CP317 Project Guide

This guide explains **how to work together** using GitHub.

---

## 🚀 Overview
building a web app using **HTML, TailwindCSS, and JavaScript**.  
Follow a **sprint-based workflow** with **feature branches**, and **GitHub Pull Requests** for implementation.

---

## 🧱 Branching Structure
- `main` → stable, production-ready code only  
- `dev` → testing and integration branch  
- `feature/<name>` → each member’s feature branch (example: `feature/navbar`)

---

## ⚙️ Setup Instructions (MAKE SURE EVERY MEMBER FOLLOW THESE)
1. Clone the repo:
   ```bash
   git clone https://github.com/ayaanb132/SneakerHub.git
   cd SneakerHub
   ```
2. Pull the latest code before starting work:
   ```bash
   git checkout dev
   git pull origin dev
   ```

---

## 🧩 How to Work on a Feature (DO THIS IF U WANNA EDIT SUMN)

### 1. Create a Branch

```bash
git checkout dev
git pull origin dev
git checkout -b feature/<feature-name>
```

Example:
```bash
git checkout -b feature/login-page
```

### 2. Make Your Changes
Edit HTML, CSS, or JS files in the `/src` folder.

### 3. Commit and Push
```bash
git add .
git commit -m "added login form markup"
git push origin feature/<feature-name>
```

### 4. Open a Pull Request (PR)
- Go to GitHub → **Pull Requests → New Pull Request**
- Base branch: `dev`
- Compare branch: `feature/<feature-name>`
- Add a short description of what you did
- Assign a teammate for review

### 5. Merge After Review
Once approved, merge the PR into `dev`.  
Then delete your feature branch from GitHub.

---



---

## 🧾 Folder Structure
```
/src
  /css
  /js
  /assets
index.html
README.md
```

---

## 🌐 Deployment
- Hosted via GitHub Pages or Vercel.
- After each sprint, merge `dev` → `main` and tag a release:
  ```bash
  git tag v1.0-sprint1
  git push origin v1.0-sprint1
  ```

---


## ✅ Definition of Done
- Code merged into `dev`
- Reviewed and approved by a teammate
- Passes testing and looks correct in browser
- Updated documentation if needed

---

## 🧾 Notes
- Never work directly on `main`
- Always pull latest `dev` before starting new work
- Communicate via GitHub Issues and PR comments

---

**End of Guide**
