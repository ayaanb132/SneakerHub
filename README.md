# 🧩 CP317 Project Collaboration Guide

Welcome to the project! This guide explains **exactly how our team will work together** using GitHub.

---

## 🚀 Overview
We’re building a web app using **HTML, TailwindCSS, and JavaScript**.  
We’ll follow a **sprint-based workflow** with **feature branches**, **code reviews**, and **GitHub Projects** for task tracking.

---

## 🧱 Branching Structure
- `main` → stable, production-ready code only  
- `dev` → testing and integration branch  
- `feature/<name>` → each member’s feature branch (example: `feature/navbar`)

---

## ⚙️ Setup Instructions
1. Clone the repo:
   ```bash
   git clone https://github.com/ayaanb132/SneakerHub
   cd <SneakerHub>
   ```
2. Pull the latest code before starting work:
   ```bash
   git checkout dev
   git pull origin dev
   ```

---

## 🧩 How to Work on a Feature

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

## 🧠 Sprint Workflow

Each sprint = 1–2 weeks.

### Sprint Steps
1. **Planning**: pick user stories (features) from backlog.  
2. **Development**: each member completes their assigned issue.  
3. **Review**: team reviews PRs and merges to `dev`.  
4. **Release**: after testing, merge `dev` → `main`.  
5. **Retrospective**: discuss what went well and what to improve.

---

## 🗂️ GitHub Issues and Projects

### Creating a User Story
Example:
```
As a user, I want to log in so I can access my dashboard.
```

### Issue Example
- [ ] Create login form
- [ ] Add validation in JS
- [ ] Connect backend (optional)

Label issues as:
- `feature`
- `bug`
- `UI`
- `enhancement`
- `documentation`

Use **GitHub Projects (Board view)** to track progress:
- To Do
- In Progress
- Done

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

## 🧰 Roles
| Role | Description |
|------|--------------|
| Product Owner | Defines user stories, prioritizes tasks |
| Scrum Master | Runs meetings, manages sprint flow |
| Developers | Build, test, and review code |

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
