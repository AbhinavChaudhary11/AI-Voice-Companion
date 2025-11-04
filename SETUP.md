# Quick Setup Guide

## 1. Create Backend Environment File

Create `backend/.env` with:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/voice_workspace
```

### For MongoDB Atlas (Recommended - Free):
1. Go to https://www.mongodb.com/atlas
2. Create a free cluster
3. Click "Connect" > "Drivers" > Copy connection string
4. Replace `<password>` with your password
5. Use in `.env`: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voice_workspace`

## 2. Create Frontend Environment File (Optional)

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 3. Install Dependencies

Already done! ✅

## 4. Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Or use the root command:
```bash
npm run dev
```

## 5. Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/health
