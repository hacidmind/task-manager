# Task Manager - Next.js Application

A full-stack task management application built with Next.js, React, and MongoDB.

## Features

- 📋 Daily task management
- 🗺️ FY27 strategic roadmap tracking
- 📅 Quarterly planning (coming soon)
- 🎯 Task prioritization and status tracking
- 📊 Statistics and analytics
- 🔍 Advanced filtering and search

## Prerequisites

Before running this project, ensure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Either:
  - Local MongoDB installation, OR
  - MongoDB Atlas account (free tier available)

### Installing MongoDB Locally (Windows)

1. Download MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. MongoDB will be installed as a Windows service and automatically starts
4. Verify installation by opening Command Prompt and running: `mongosh` or `mongo`

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js
- React
- MongoDB driver
- Mongoose (optional ODM)

### 2. Configure Environment Variables

**For Local MongoDB:**

The `.env.local` file is already configured for local development:

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=task_manager
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**For MongoDB Atlas (Cloud):**

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Update `.env.local`:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=task_manager
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Important:** Never commit `.env.local` to git. Use `.env.example` as a template.

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3000/api

### 4. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000) to see your Task Manager application.

## Project Structure

```
task_manager/
├── pages/
│   ├── _app.jsx              # Next.js app wrapper
│   ├── index.jsx             # Main task manager page
│   └── api/
│       └── tasks.js          # API routes for CRUD operations
├── lib/
│   └── mongodb.js            # MongoDB connection utility
├── styles/
│   └── globals.css           # Global styles
├── public/                   # Static assets
├── package.json              # Dependencies
├── next.config.js            # Next.js configuration
├── jsconfig.json             # Path aliases
├── .env.local                # Local environment variables
├── .env.example              # Environment template
└── README.md                 # This file
```

## Available Scripts

- `npm run dev` - Start development server (with hot reload)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Endpoints

### GET /api/tasks
Retrieves all tasks from MongoDB.

**Response:**
```json
{
  "dailyTasks": [...],
  "fy27Tasks": [...]
}
```

### POST /api/tasks
Creates a new task.

**Request Body:**
```json
{
  "title": "Task title",
  "category": "Engineering",
  "status": "Ongoing",
  "owner": "Name",
  "priority": "High",
  "notes": "Description",
  "subtasks": [],
  "isStrategic": false,
  "quarter": null
}
```

### PUT /api/tasks
Updates an existing task.

### DELETE /api/tasks
Deletes a task.

## Troubleshooting

### MongoDB Connection Issues

**Error: "connect ECONNREFUSED"**
- Ensure MongoDB is running locally: `net start MongoDB` (Windows)
- Or verify MongoDB Atlas connection string is correct

**Error: "MONGODB_URI not defined"**
- Check that `.env.local` file exists in the root directory
- Restart the development server after updating `.env.local`

### Port 3000 Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

## Database Setup

The application automatically connects to MongoDB when you first run it. To verify the connection:

1. Start your MongoDB server
2. Run the dev server: `npm run dev`
3. Open browser console - you should see no connection errors
4. Check MongoDB logs: `mongosh` then `use task_manager` and `db.tasks.find()`

## Deployment

### Deploying to Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel at [vercel.com](https://vercel.com)
3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `MONGODB_DB`
4. Deploy

### Other Hosting Options

- Netlify
- Heroku
- AWS
- DigitalOcean

## Contributing

Feel free to fork this project and submit pull requests.

## License

MIT License

## Support

For issues or questions, please open an issue in the repository.

---

**Happy task managing! 🚀**
