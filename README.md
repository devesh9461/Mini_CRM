# Mini CRM — Client Lead Management System

A production-quality, beautiful, and secure Client Lead Management System (Mini CRM) built to manage leads generated from website contact forms.

## Features
- **Secure Admin Portal**: Hashed password storage, JWT token authentication, and route guards.
- **Interactive Dashboard**: Modern stats widgets displaying total, new, contacted, converted, and lost lead counts alongside a recent leads view.
- **Leads Directory**: A comprehensive list of all leads with full search capabilities, status filtering, source filtering, and paginated navigation.
- **Detailed Lead Profiles**: Dedicated card showing lead information (source, email, phone, etc.) with a quick status updater.
- **Activity & Follow-ups Timeline**: Add date-stamped notes and schedule future follow-ups for each lead.
- **Premium Dark Aesthetics**: Styled with a dark glassmorphic UI, responsive layouts, micro-animations, and clean alerts.

---

## Tech Stack
- **Frontend**: React (Vite), React Router v7, Axios, React Icons, React Hot Toast, Vanilla CSS variables.
- **Backend**: FastAPI, SQLAlchemy, PyMySQL, Uvicorn, Python-Jose (JWT), Passlib (Bcrypt).
- **Database**: MySQL.

---

## Setup Instructions

### Prerequisites
1. **Python 3.8+** installed.
2. **Node.js 18+** installed.
3. **MySQL Server** installed and running.

---

### Backend Setup

1. **Navigate to backend folder**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory (or use the preconfigured default):
   ```env
   DATABASE_URL=mysql+pymysql://root:@localhost:3306/mini_crm
   SECRET_KEY=mini-crm-super-secret-key-change-in-production-2024
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=480
   ```

4. **Seed the Database**:
   Populate the database with sample leads, notes, and a default admin account:
   ```bash
   python -m app.seed
   ```
   *Note: This creates an admin account with username **`admin`** and password **`admin123`**.*

5. **Start the API server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend API will run at `http://localhost:8000`. You can visit `http://localhost:8000/docs` to view the interactive Swagger API documentation.

---

### Frontend Setup

1. **Navigate to frontend folder**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will run at `http://localhost:5173`. Open this URL in your web browser to access the CRM portal.

---

## Default Credentials
For testing the application with seeded demo data:
- **Username**: `admin`
- **Password**: `admin123`
