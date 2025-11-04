# 🧠 Voice Companion - Complete Guide

## ✅ Status: FULLY OPERATIONAL

Both servers are running:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

## 🎯 Features

Your Voice Companion can:

### 🌤️ Weather
- **Say**: "Weather in London" or "What's the weather in New York"
- Gets real-time weather from wttr.in (free API)

### 💬 Quotes
- **Say**: "Tell me a quote" or "Give me inspiration"
- Fetches random inspirational quotes from Quotable.io

### 😄 Jokes
- **Say**: "Tell me a joke" or "Make me laugh"
- Gets jokes from JokeAPI (free)

### 📚 Wikipedia
- **Say**: "Wiki artificial intelligence" or "Tell me about Paris" or "What is Python"
- Searches Wikipedia for information

### ✅ Tasks
- **Say**: "Add task buy groceries" or "Task call dentist" or "Remind me to finish project"
- Creates tasks that are saved and displayed

### 📝 Notes
- **Say**: "Note meeting at 3pm" or "Remember doctor appointment" or "Save that idea"
- Saves notes for later

### 🧮 Math
- **Say**: "Calculate 25 plus 17" or "What is 100 divided by 4"
- Performs basic calculations

### 💬 Conversation Memory
- All conversations are saved
- Remembers previous messages
- Persistent storage (MongoDB or in-memory)

## 🚀 How to Use

1. **Open**: http://localhost:3000 in Chrome or Edge
2. **Click**: "🎤 Start Talking" button
3. **Allow**: Microphone permissions when prompted
4. **Speak**: One of the commands above
5. **Listen**: The bot responds with voice and text

## 🎤 Voice Commands Examples

```
"Hello"                    → Greeting & feature overview
"Help"                     → List all capabilities
"Weather in Tokyo"         → Get weather for Tokyo
"Tell me a quote"          → Get inspirational quote
"Tell me a joke"           → Get a random joke
"Wiki machine learning"    → Wikipedia search
"Add task buy milk"        → Create task
"Note dentist at 2pm"      → Save note
"Calculate 42 times 7"     → Math calculation
```

## 🗄️ Data Storage

- **With MongoDB**: All data persists to database
- **Without MongoDB**: Uses in-memory storage (data lost on restart)

### MongoDB Setup (Optional)

1. **Local MongoDB**: Start MongoDB on port 27017, or
2. **MongoDB Atlas** (Free):
   - Create account at https://www.mongodb.com/atlas
   - Create free cluster
   - Get connection string
   - Update `server/.env`:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voice_companion
     ```

## 🔌 API Endpoints

### Tasks
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create task (`{ "text": "...", "done": false }`)
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Notes
- `GET /notes` - Get all notes
- `POST /notes` - Create note (`{ "text": "..." }`)

### Messages
- `GET /messages` - Get conversation history
- `POST /messages` - Save message (`{ "sender": "...", "text": "..." }`)

### Utilities
- `GET /weather/:city` - Get weather
- `GET /quote` - Get random quote
- `GET /joke` - Get random joke
- `GET /wiki/:query` - Wikipedia search
- `GET /health` - Health check

## 🌐 Free APIs Used

- **wttr.in** - Weather data
- **Quotable.io** - Quotes
- **JokeAPI.dev** - Jokes
- **Wikipedia REST API** - Information search
- **Web Speech API** - Voice recognition (browser built-in)
- **SpeechSynthesis API** - Text-to-speech (browser built-in)

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- TypeScript
- MongoDB (Mongoose) - optional
- Axios for API calls

### Frontend
- Next.js 14
- React
- TypeScript
- TailwindCSS
- Web Speech API

## ⚠️ Browser Compatibility

- ✅ **Chrome/Edge** - Full support (recommended)
- ✅ **Safari** - Limited support
- ❌ **Firefox** - No Web Speech API support

## 🔧 Troubleshooting

### Voice not working?
1. Allow microphone permissions
2. Use Chrome or Edge browser
3. Check browser console for errors
4. Ensure HTTPS or localhost (required for mic)

### Backend not responding?
1. Check if port 5000 is available
2. View server logs for errors
3. Restart: `cd server && npm run dev`

### Frontend not loading?
1. Check if port 3000 is available
2. Clear browser cache
3. Restart: `cd client && npm run dev`

## 📝 Project Structure

```
voice-workspace/
├── server/
│   ├── src/index.ts    # Backend API server
│   ├── .env            # Environment variables
│   └── package.json
└── client/
    ├── app/page.tsx    # Frontend UI
    ├── .env.local      # Frontend env
    └── package.json
```

## 🎉 Enjoy Your Voice Companion!

Open http://localhost:3000 and start talking! 🎤
