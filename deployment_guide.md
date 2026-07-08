# Hosting and Database Integration Guide

This guide explains how to host your **Mini CRM Backend** on Render and connect it to a free **Cloud MySQL/PostgreSQL Database**.

---

## 1. Where is your Database right now?
* **Yes, the current database is built by you and runs on your computer.**
* It is a **SQLite database** stored as a file named `mini_crm.db` inside your `backend` folder.
* **Why can't we use SQLite on Render?** Render's server filesystem is **ephemeral (temporary)**. Every time your backend server restarts, goes to sleep, or redeploys, the database file will be deleted or reset to its initial state.
* **The Solution:** You need a **persistent cloud database** (MySQL or PostgreSQL) hosted on a separate free cloud database provider.

---

## 2. How the Backend Connects to the Database
The backend uses **SQLAlchemy**, a library that translates Python code into database queries. SQLAlchemy is **database-agnostic**, meaning the exact same Python code works for SQLite, MySQL, and PostgreSQL.

To change databases, you only need to change the **`DATABASE_URL`** in your configuration (`.env` file or Render environment variables).

### Database Connection Formats:
* **SQLite (Local):**
  ```env
  DATABASE_URL=sqlite:///./mini_crm.db
  ```
* **MySQL (Cloud/Local):**
  ```env
  DATABASE_URL=mysql+pymysql://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/<DATABASE_NAME>
  ```
* **PostgreSQL (Cloud/Local):**
  ```env
  DATABASE_URL=postgresql://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/<DATABASE_NAME>
  ```

---

## 3. How to Set Up a Free Database in the Cloud
Here are two excellent free hosting options:

### Option A: Free MySQL Database on Aiven (Recommended)
Aiven offers a lifetime-free tier for MySQL databases.
1. Sign up for a free account at [Aiven.io](https://aiven.io/).
2. Create a new service and select **MySQL**.
3. Choose the **Free Plan** tier and select your preferred cloud provider and region (e.g. AWS / closest to your users).
4. Wait for the service status to show **Running**.
5. Copy the **Service URI** (connection string). It will look something like this:
   `mysql://avnadmin:xyz123abc@mysql-instance.aivencloud.com:port/defaultdb?ssl-mode=REQUIRED`
6. Modify the protocol prefix from `mysql://` to `mysql+pymysql://` for Python's SQLAlchemy compatibility.
   * **Example:** `mysql+pymysql://avnadmin:xyz123abc@mysql-instance.aivencloud.com:port/defaultdb?ssl-mode=REQUIRED`
   

### Option B: Free PostgreSQL Database on Neon or Render
If you want to use PostgreSQL instead:
* **Neon.tech:** Provides a powerful free tier for PostgreSQL.
* **Render.com:** Offers a built-in PostgreSQL database, but note that Render's free tier databases expire after 90 days.

---

## 4. How to Host the Backend on Render
Render is a cloud platform that makes hosting python backends very easy.

### Step 1: Push your code to GitHub
Make sure your latest code changes (including the updated `requirements.txt` containing the MySQL `pymysql` driver) are pushed to a public or private GitHub repository.

### Step 2: Create a Web Service on Render
1. Log in to [Render.com](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the service settings:
   * **Name:** `mini-crm-backend` (or any name you choose)
   * **Region:** Choose the region closest to your database hosting
   * **Language/Runtime:** `Python`
   * **Branch:** `main` (or your active development branch)
   * **Root Directory:** `backend` (This is very important since your backend is in a subfolder!)
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `python run.py` (or `uvicorn app.main:app --host 0.0.0.0 --port $PORT`)

### Step 3: Add Environment Variables in Render
In the **Environment** tab of your Render Web Service, add the following environment variables:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `DATABASE_URL` | `mysql+pymysql://username:password@host:port/dbname?ssl-mode=REQUIRED` | Paste your cloud MySQL connection string here |
| `SECRET_KEY` | `your-super-long-random-secret-key-string` | A secure random string for signing JWT login tokens |
| `ALGORITHM` | `HS256` | JWT Encryption algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` | Token expiration time (8 hours) |
| `CORS_ORIGINS` | `https://your-frontend-domain.vercel.app,http://localhost:5173` | Comma-separated URLs of your allowed frontends |

### Step 4: Deploy
Click **Deploy Web Service**. Render will build the Python environment, download your dependencies (including the MySQL driver), start the server, and **automatically run the database setup** (creating your tables and seeding the default admin: `admin` / `admin123`).

---

## 5. Connecting the Frontend to the Hosted Backend
Once Render successfully deploys your backend, it will provide a public URL (e.g., `https://mini-crm-backend.onrender.com`).

1. Go to your frontend code configuration (usually `.env` file or environment variables settings on your frontend host like Vercel/Netlify).
2. Set the environment variable:
   ```env
   VITE_API_BASE_URL=https://mini-crm-backend.onrender.com/api
   ```
3. Rebuild or deploy your frontend.
