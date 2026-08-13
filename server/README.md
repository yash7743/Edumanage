EduManage — Server
===================

Quick start (backend)

1. Copy `.env.example` to `.env` and fill the required values (MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET, etc.).

2. Install dependencies and run server:

```bash
cd server
npm install
npm run dev    # or `npm start` for production
```

3. To seed the initial admin account (single admin):

```bash
cd server
# ensure .env has ADMIN_EMAIL and ADMIN_PASSWORD set
npm run seed
```

Security notes

- Never commit your `.env` with secrets.
- Use strong `JWT_SECRET` and secure cookie settings in production.
- Use HTTPS and set `COOKIE_SECURE=true` in production.
