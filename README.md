## Vyasha Notes

Role-based notes application built with Next.js (App Router), PostgreSQL, Prisma, JWT auth, and Tailwind.

### Features
- Email/password signup and signin with HttpOnly JWT cookie
- Roles: `admin` (CRUD any note) and `user` (CRUD own notes)
- Dashboard to view, create, edit, and delete notes
- Admins can optionally assign notes to any user by user id

### Setup
1) Install deps:
```bash
npm install
```

2) Configure environment:
Create `.env` in the project root:
```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/vyasha"
JWT_SECRET="replace-with-strong-secret"
```

3) Apply Prisma schema:
```bash
npx prisma migrate dev --name init
```

4) Run dev server:
```bash
npm run dev
```

### Usage
- Visit `/signup` to create an account (pick admin or user role).
- After login you land on `/dashboard` where you can CRUD notes.
- Admins can see all notes; users see only their own.

### Tech notes
- Prisma client lives in `src/lib/prisma.js` with a singleton pattern.
- Auth helpers (`src/lib/auth.js`) handle hashing, JWT signing, and session lookup.
- Note RBAC is centralized in `src/lib/notes.js` and reused by API routes and the dashboard.
- API endpoints live under `src/app/api/...`.
