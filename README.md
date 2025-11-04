# Voice-Controlled Smart Workspace 🎙️

A beautiful, modern full-stack web application that allows you to manage notes, tasks, and projects using **voice commands**. Built with Next.js, Express, MongoDB, and the Web Speech API.

## ✨ Features

- 🗣️ **Voice Commands**: Control your workspace using natural language voice commands
- 📝 **Task Management**: Kanban-style task board with drag-and-drop status updates
- 📄 **Notes**: Create and manage notes organized by project
- 📊 **Daily Summary**: Get insights into your productivity
- 🎨 **Beautiful UI**: Modern, glassmorphism design inspired by Notion + Linear + Apple
- 🧠 **Context Memory**: Remembers your recent actions per project

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with TypeScript
- **TailwindCSS** + **Shadcn/UI** components
- **Zustand** for state management
- **Web Speech API** for voice recognition and synthesis

### Backend
- **Node.js** + **Express** with TypeScript
- **MongoDB** with Mongoose ORM
- RESTful API architecture

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas free cluster)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd voice-controlled-smart-workspace
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   Create `backend/.env`:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/voice-workspace
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voice-workspace
   ```

   Create `frontend/.env.local` (optional):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Start the development servers**

   Run both frontend and backend simultaneously:
   ```bash
   npm run dev
   ```

   Or run them separately:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🗣️ Voice Commands

The voice assistant understands natural language commands:

### Task Commands
- **"Add task to project Alpha: fix login bug"**
- **"Create task: review pull request"**
- **"New task about API errors"**

### Note Commands
- **"Add note to project Alpha: meeting notes from today"**
- **"Create note: API endpoint documentation"**

### View Commands
- **"Show my notes for today"**
- **"Show tasks for project Alpha"**
- **"Display all tasks"**

### Summary Commands
- **"Summarize my tasks"**
- **"Give me a summary for project Alpha"**

## 📁 Project Structure

```
voice-controlled-smart-workspace/
├── frontend/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and API client
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   └── server.ts     # Express server
│   └── package.json
└── package.json          # Root workspace config
```

## 🎨 UI Components

- **Sidebar**: Project navigation and creation
- **Top Bar**: Greeting and current date/time
- **Task Board**: Kanban columns (To Do, In Progress, Done)
- **Notes List**: Chronological note display
- **Daily Summary**: Statistics and insights
- **Voice Mic Button**: Floating button with pulse animation

## 🔌 API Endpoints

### Tasks
- `GET /api/tasks?project={name}` - Get tasks (optionally filtered by project)
- `POST /api/tasks` - Create a new task
- `DELETE /api/tasks/:id` - Delete a task
- `PATCH /api/tasks/:id` - Update task status

### Notes
- `GET /api/notes?project={name}` - Get notes
- `POST /api/notes` - Create a new note
- `DELETE /api/notes/:id` - Delete a note

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project

### Summary
- `GET /api/summary?project={name}` - Get summary statistics

### Command Memory
- `GET /api/command-memory/:project` - Get command history
- `POST /api/command-memory` - Save a command

## 🌐 Browser Compatibility

The Web Speech API is supported in:
- ✅ Chrome/Edge (recommended)
- ✅ Safari (limited support)
- ❌ Firefox (not supported)

## 📝 License

MIT License - feel free to use this project for learning and personal projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.
