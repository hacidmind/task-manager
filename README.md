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

The API supports GET, POST, PUT, and DELETE at `/api/tasks`. MongoDB updates and deletes use the task ID returned by creation. This is a personal workspace; authentication is not included.
