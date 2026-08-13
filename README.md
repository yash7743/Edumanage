# EduManage — Student Academic Management Portal

A full-stack academic portal with a **student side** and an **admin side**.
Admins share **one single login page** (`/admin/login`) for all three roles —
Super Admin, Content Admin, and Faculty Admin. The server figures out which
sub-role an account has after checking the email/password; the client never
picks a role. The sidebar then shows only what that admin is allowed to see.

## Tech Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios, react-hot-toast
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT (httpOnly cookies), bcrypt, Multer, Helmet, CORS, rate limiting

---

## 1. Prerequisites

- Node.js 18+ and npm
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

---

## 2. Copy the project onto your machine

If you downloaded the zip, just unzip it. You'll get:

```
edumanage/
  server/    ← Node/Express API
  client/    ← React frontend
```

---

## 3. Backend setup

```bash
cd edumanage/server
npm install
cp .env.example .env
```

Open `.env` and fill in real values — **especially**:

- `JWT_SECRET` — generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- `MONGO_URI` — your MongoDB connection string
- `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`
- `CONTENT_ADMIN_EMAIL` / `CONTENT_ADMIN_PASSWORD`
- `FACULTY_ADMIN_EMAIL` / `FACULTY_ADMIN_PASSWORD`

These three admin accounts are **never hardcoded in source code**. They only
exist because you set them in `.env` and ran the seed script below.

### Create the 3 admin accounts

```bash
npm run seed
```

This reads your `.env`, hashes each password with bcrypt, and inserts the
three admin users into MongoDB (skipping any that already exist). Nothing is
printed except which accounts were created — the actual passwords are only
ever in your `.env` file.

### Start the backend

```bash
npm run dev      # nodemon, auto-restart
# or
npm start        # plain node
```

API runs at `http://localhost:5000`. Health check: `GET /api/health`.

---

## 4. Frontend setup

Open a **second terminal**:

```bash
cd edumanage/client
npm install
npm run dev
```

App runs at `http://localhost:5173`. Vite proxies `/api` calls to
`http://localhost:5000` automatically (see `vite.config.js`), so you don't
need to configure CORS URLs by hand for local dev — just make sure
`CLIENT_URL=http://localhost:5173` is set in the backend `.env`.

---

## 5. Log in

- **Student:** go to `http://localhost:5173/login`, or register a new
  account at `/register`.
- **Admin (all 3 roles):** go to `http://localhost:5173/admin/login` and
  sign in with whichever admin email/password you set in `.env` and seeded.
  The same single page works whether you're the Super Admin, Content Admin,
  or Faculty Admin — the app adapts the dashboard after login.

There are no default/test credentials shipped in this codebase — you choose
them yourself in `.env` before running the seed script, which is the whole
point of not hardcoding admin logins.

---

## 6. Project structure

```
server/
  config/        MongoDB connection
  controllers/   Route handlers (auth, subjects, chapters, assignments, submissions, lab manuals, users)
  middleware/    JWT auth, RBAC, secure Multer upload, centralized error handler
  models/        Mongoose schemas
  routes/        Express routers
  seeds/         seedAdmins.js — the ONLY way admin accounts get created
  uploads/       Stored files (randomized names), never served statically
  server.js      App entrypoint

client/
  src/
    components/  Shared UI (Modal, Loader, EmptyState, ConfirmDialog, Pagination)
    context/     AuthContext (session state via /api/auth/me)
    layouts/     StudentLayout, AdminLayout (role-aware sidebar)
    pages/
      auth/      Login (student), Register, AdminLogin (single page, all 3 roles)
      student/   Dashboard, Subjects, SubjectDetail, Assignments, LabManuals, Submissions, Profile
      admin/     Dashboard, ManageStudents, ManageSubjects, ManageChapters,
                 ManageAssignments, ManageLabManuals, ManageSubmissions, ManageAdmins
    routes/      ProtectedRoute (role + admin-sub-role gating)
    services/    Axios instance (withCredentials: true)
```

---

## 7. Security notes

- Passwords hashed with bcrypt (cost factor 12), never stored in plain text
- JWT stored in an **httpOnly** cookie, not localStorage — not readable by JS
- Login endpoint is rate-limited (10 attempts / 15 min)
- File uploads: extension + MIME whitelist (PDF/DOC/DOCX/PPT/PPTX only),
  size-limited, filenames randomized server-side, executables rejected
- Downloads only happen through authenticated Express routes — the
  `uploads/` folder is never exposed via `express.static`
- `express-mongo-sanitize` and `xss-clean` guard against NoSQL injection and XSS
- Admin creation only via `npm run seed`, reading `.env` — never hardcoded,
  never exposed in the frontend bundle

---

## 8. Common commands recap

```bash
# Backend
cd server && npm install && cp .env.example .env
npm run seed     # create the 3 admins from .env
npm run dev      # start API on :5000

# Frontend
cd client && npm install
npm run dev      # start app on :5173
```
