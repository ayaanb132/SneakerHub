# 🏠 SneakerHub

A web app where users can browse and purchase sneakers.  
Built collaboratively by our group using Git and GitHub for version control.

---

## ⚙️ Setup Instructions (EVERY MEMBER MUST FOLLOW)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ayaanb132/SneakerHub.git
   cd SneakerHub
   ```

2. **Create your personal branch (use your name or feature):**
   ```bash
   git checkout -b yourname-feature
   ```

3. **Before starting work, pull the latest updates from `main`:**
   ```bash
   git checkout main
   git pull origin main
   git checkout yourname-feature
   git merge main
   ```

4. **After finishing work, push your branch:**
   ```bash
   git add .
   git commit -m "Describe your changes briefly"
   git push origin yourname-feature
   ```

5. **Create a Pull Request (PR):**
   - Go to GitHub → open your branch → click **“Compare & pull request.”**
   - I’ll review and merge into `main` after approval.

---

## 🧩 Branch Workflow Summary

- Each member works on their **own branch**.
- Never push directly to `main`.
- Pull latest changes before starting work to avoid conflicts.
- Only the project lead merges PRs into `main`.

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

## ✅ Example Commands

```bash
git checkout -b ayaan-ui
# (do some coding)
git add .
git commit -m "Added homepage UI"
git push origin ayaan-ui
```

Then open a Pull Request on GitHub.

---

## 🧠 Tips

- Always **sync with `main`** before working:
  ```bash
  git checkout main
  git pull origin main
  git checkout yourname-feature
  git merge main
  ```
- Write **clear commit messages.**
- Check **GitHub PR comments** regularly.

---

**Repository:** [SneakerHub](https://github.com/ayaanb132/SneakerHub)
