# 🚀 Quick Start Guide

## ✅ Current Status

Both servers are now running:
- ✅ **Backend**: http://localhost:5000 (API server)
- ✅ **Frontend**: http://localhost:3000 (Web app)

## 📁 Project Structure

```
voice-workspace/
├── server/          # Node.js + Express backend
│   ├── src/index.ts
│   └── .env
└── client/          # Next.js frontend
    ├── app/page.tsx
    └── .env.local
```

## 🎯 How to Use

1. **Open your browser**: Go to http://localhost:3000
2. **Click the "Start Talking" button**
3. **Allow microphone permissions** when prompted
4. **Say something like**: "Buy groceries" or "Call dentist"
5. **Your task will appear** in the list below!

## 🔧 Starting the Servers

### Option 1: Use the startup script
```bash
./start.sh
```

### Option 2: Manual start
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## 🗄️ MongoDB Setup (Optional)

The app works **without MongoDB** using in-memory storage. To use MongoDB:

1. **Local MongoDB**: Start MongoDB locally, or
2. **MongoDB Atlas** (Free):
   - Go to https://www.mongodb.com/atlas
   - Create a free cluster
   - Get connection string
   - Update `server/.env`:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voice_workspace
     ```

## 🌐 API Endpoints

- `GET /health` - Health check
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create new task (body: `{ "text": "task description" }`)

## 🎤 Voice Recognition

- **Supported browsers**: Chrome, Edge, Safari
- **Not supported**: Firefox
- **Language**: English (US)

## ⚠️ Troubleshooting

- **Backend not connecting**: Check if port 5000 is available
- **Frontend not loading**: Check if port 3000 is available
- **Voice not working**: 
  - Allow microphone permissions
  - Use Chrome or Edge browser
  - Check browser console for errors

## 🛑 Stopping Servers

Press `Ctrl+C` in the terminal where servers are running, or:
```bash
pkill -f "tsx watch"
pkill -f "next dev"
```
