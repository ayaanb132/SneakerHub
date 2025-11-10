# 👟 SneakerHub

A web application for browsing and purchasing sneakers with complete **order tracking** functionality. Built collaboratively using Git and GitHub.

---

## ✨ Features

* **Order Tracking:** Follow your order status in real-time (Processing → Shipped → Delivered).
* **User Accounts:** Secure login/registration using JWT.
* **Order History:** View all your past and current orders.
* **Responsive UI:** Works well on both mobile and desktop.

**📚 Full Details**: See [ORDER_TRACKING_IMPLEMENTATION.md](ORDER_TRACKING_IMPLEMENTATION.md)

---

## 🚀 Quick Start (Full Stack Development)

This is the fastest way to get the **Order Tracking** feature running.

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Seed the database with sample data:**
    ```bash
    npm run seed
    ```

3.  **Start the backend server:**
    ```bash
    npm start
    ```

4.  **Open the front-end:**
    * Open `src/order-tracking.HTML` in your browser or use the Live Server extension.

> **Test Login Credentials:**
> * **Email:** `john.doe@example.com`
> * **Password:** `password123`

---

## 💻 Tech Stack

| Category | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, **Tailwind CSS**, Vanilla JavaScript, Fetch API |
| **Backend** | **Node.js**, **Express.js** |
| **Database** | **SQLite** (`sneakerhub.db`), JWT for Authentication |

---

## ⚙️ Development Workflow

*All team members must follow this process for contributing.*

1.  **Clone the project:**
    ```bash
    git clone [https://github.com/ayaanb132/SneakerHub.git](https://github.com/ayaanb132/SneakerHub.git)
    cd SneakerHub
    ```

2.  **Create and switch to your branch:**
    ```bash
    git checkout -b yourname-feature
    ```

3.  **Sync with `main` before starting work:**
    ```bash
    git checkout main
    git pull origin main
    git checkout yourname-feature
    git merge main
    ```

4.  **After your work is done:**
    ```bash
    git add .
    git commit -m "Briefly describe your changes"
    git push origin yourname-feature
    ```

5.  **Create a Pull Request (PR) on GitHub** for review and merging.

---

## 📚 Resources & Next Steps

* **API Testing Guide**: [API_TESTING_EXAMPLES.md](API_TESTING_EXAMPLES.md)
* **Full Order Tracking Documentation**: [ORDER_TRACKING_IMPLEMENTATION.md](ORDER_TRACKING_IMPLEMENTATION.md)

---

## 🐛 Troubleshooting

* **Server issues?** Make sure you ran `npm start`.
* **No orders?** Run `npm run seed` to load test data.
* **Dependencies missing?** Run `npm install`.

---

**Repository:** [SneakerHub](https://github.com/ayaanb132/SnekerHub)
