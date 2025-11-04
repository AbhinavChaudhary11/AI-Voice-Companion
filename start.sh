#!/bin/bash

echo "🚀 Starting Voice-Controlled Smart Workspace..."
echo ""

# Start backend in background
echo "📡 Starting backend server (port 5000)..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend in background
echo "🌐 Starting frontend server (port 3000)..."
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers are starting!"
echo ""
echo "📍 Backend: http://localhost:5000"
echo "📍 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
wait $BACKEND_PID $FRONTEND_PID
