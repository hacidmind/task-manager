# Momentum — Task Manager

A focused workspace for daily tasks, quarterly planning, and the FY27 roadmap. Built with Next.js, React, Anime.js, GSAP, and online MongoDB.

## Start locally

Use Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the URL printed by the server (normally http://localhost:3000). Configure your online MongoDB database before using the workspace.

## Online MongoDB (required)

Create `.env.local` using `.env.example`. Set `MONGODB_URI` to your online MongoDB connection string (for example, MongoDB Atlas) and `MONGODB_DB` to your database name, then restart the server. Keep credentials in `.env.local`, which is ignored by Git. All task reads and writes use MongoDB. Missing configuration or connection failures display an error and prevent saves; there is no browser-storage fallback. Previously saved browser tasks are not read, deleted, or automatically migrated.

## Features

- Daily status board and list view
- Quarterly planning and FY27 roadmap, grouped by quarter
- Search by title, owner, category, or notes; status and priority filters
- Create, edit, and delete tasks with confirmation
- Action items with completion tracking
- Live task counts and completion rate
- Responsive layouts, keyboard-accessible modal, and reduced-motion support
- GSAP entrance/modal transitions and Anime.js task transitions
- Light/dark themes with a remembered preference (only the theme uses a cookie; task data stays in MongoDB)
- Email/password registration, login, and sign-out
- Private tasks per account, salted scrypt password hashes, and revocable seven-day server sessions

## Commands

- `npm run dev`: development server
- `npm run build`: production build
- `npm start`: production server after building
- `npm run lint`: ESLint checks

## Project layout

- `pages/index.jsx`: workspace and task editor
- `styles/globals.css`: responsive design system
- `pages/api/tasks.js`: MongoDB CRUD API
- `lib/mongodb.js`: database connection
- `task_manager_v2.jsx`, `task_export.md`: retained reference material

The API supports GET, POST, PUT, and DELETE at `/api/tasks` and requires a signed-in account. MongoDB updates and deletes use the task ID returned by creation and check account ownership.

## Accounts

Email OTP is inactive. Sign in with email and password at /login. Resend credentials are not needed. The OTP helpers are retained for future use, but both OTP API endpoints reject requests and cannot send emails or create sessions.

### Set the default account password

The default workspace account is **abiolahafeez@gmail.com**. In your own terminal, run:

```sh
npm run account:setup
```

Enter a new password of 12?128 characters and confirm it. Input is hidden. This stores a salted password hash in online MongoDB, reserves the default account, signs out existing sessions, and links tasks whose userId is missing, null, or empty. Tasks already assigned to another account are not changed. The default account cannot be claimed through public registration.

Run the same command later to change or reset this password. No initial password is hardcoded or stored in .env.local. This is an application password, separate from your Gmail and MongoDB passwords.

A working MONGODB_URI in .env.local is required. If MongoDB reports authentication failed, correct the database credentials first. The database user needs read/write and index creation permissions for users, sessions, authAttempts, and tasks.

Other users can choose Create account and register with a name, email address, and password. Their tasks remain separate. Sessions last seven days and use HttpOnly cookies; production requires HTTPS. Sign-out revokes the session. Login attempts are rate-limited in MongoDB.

### Validation

- `node tests/auth-unit.cjs`: password hashing and authentication helpers.
- `node tests/otp-unit.cjs`: retained OTP helper tests and default-account task ownership checks; no email is sent.
- `node tests/auth-integration.cjs`: accounts, sessions, and task isolation against the dev server (default http://localhost:3001; override with TEST_BASE_URL). Creates temporary accounts and removes their users, tasks, and sessions afterward. Requires a working online MongoDB connection.

### Daily focus

After login, select initiatives from any workspace view for today. Selections are saved per account in MongoDB for the local calendar date. Completion uses completed action items, with Done tasks at 100%. Daily board statuses are separate, and In progress counts only Ongoing tasks. Run `node tests/focus-unit.cjs` for focused API validation.
