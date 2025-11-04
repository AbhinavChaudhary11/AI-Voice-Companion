import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/voice_companion";

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log("💡 App will continue with in-memory storage");
  });

app.get("/health", (req, res) => res.status(200).json({ ok: true, status: "backend up" }));
app.get("/", (req, res) => res.json({ message: "Backend running fine" }));

// In-memory fallbacks
let tasks: { id: number; text: string; done: boolean }[] = [];
let notes: { id: number; text: string }[] = [];
let messages: { sender: string; text: string; timestamp: Date }[] = [];

// MongoDB Schemas
const TaskSchema = new mongoose.Schema({
  text: String,
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'tasks' });

const NoteSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now },
}, { collection: 'notes' });

const MessageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
}, { collection: 'messages' });

// Helper functions to get models
function getTaskModel() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.models.Task || mongoose.model('Task', TaskSchema);
    }
  } catch (e) {}
  return null;
}

function getNoteModel() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.models.Note || mongoose.model('Note', NoteSchema);
    }
  } catch (e) {}
  return null;
}

function getMessageModel() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.models.Message || mongoose.model('Message', MessageSchema);
    }
  } catch (e) {}
  return null;
}

// === TASK ROUTES ===
app.get("/tasks", async (req, res) => {
  try {
    const Task = getTaskModel();
    if (Task) {
      const dbTasks = await Task.find().sort({ createdAt: -1 });
      return res.json(dbTasks.map((t: any) => ({ id: t._id.toString(), text: t.text, done: t.done || false })));
    }
    res.json(tasks);
  } catch (err) {
    res.json(tasks);
  }
});

app.post("/tasks", async (req, res) => {
  const { text, done } = req.body;
  const newTask = { id: Date.now(), text, done: done || false };
  
  try {
    const Task = getTaskModel();
    if (Task) {
      const saved = await Task.create({ text, done: done || false });
      return res.status(201).json({ id: saved._id.toString(), text: saved.text, done: saved.done });
    }
    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (err) {
    tasks.push(newTask);
    res.status(201).json(newTask);
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const Task = getTaskModel();
    if (Task) {
      const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json({ id: updated._id.toString(), text: updated.text, done: updated.done });
    }
    const index = tasks.findIndex((t: any) => t.id.toString() === req.params.id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...req.body };
      return res.json(tasks[index]);
    }
    res.status(404).json({ error: "Task not found" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const Task = getTaskModel();
    if (Task) {
      await Task.findByIdAndDelete(req.params.id);
      return res.json({ ok: true });
    }
    tasks = tasks.filter((t: any) => t.id.toString() !== req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

app.delete("/tasks", async (req, res) => {
  try {
    const Task = getTaskModel();
    if (Task) {
      await Task.deleteMany({});
      return res.json({ ok: true });
    }
    tasks = [];
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete all tasks" });
  }
});

// === NOTES ROUTES ===
app.get("/notes", async (req, res) => {
  try {
    const Note = getNoteModel();
    if (Note) {
      const dbNotes = await Note.find().sort({ createdAt: -1 });
      return res.json(dbNotes.map((n: any) => ({ id: n._id.toString(), text: n.text })));
    }
    res.json(notes);
  } catch (err) {
    res.json(notes);
  }
});

app.post("/notes", async (req, res) => {
  const { text } = req.body;
  const newNote = { id: Date.now(), text };
  
  try {
    const Note = getNoteModel();
    if (Note) {
      const saved = await Note.create({ text });
      return res.status(201).json({ id: saved._id.toString(), text: saved.text });
    }
    notes.push(newNote);
    res.status(201).json(newNote);
  } catch (err) {
    notes.push(newNote);
    res.status(201).json(newNote);
  }
});

app.delete("/notes/:id", async (req, res) => {
  try {
    const Note = getNoteModel();
    if (Note) {
      await Note.findByIdAndDelete(req.params.id);
      return res.json({ ok: true });
    }
    notes = notes.filter((n: any) => n.id.toString() !== req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});

app.delete("/notes", async (req, res) => {
  try {
    const Note = getNoteModel();
    if (Note) {
      await Note.deleteMany({});
      return res.json({ ok: true });
    }
    notes = [];
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete all notes" });
  }
});

// === MEMORY/CONVERSATION ROUTES ===
app.get("/messages", async (req, res) => {
  try {
    const Message = getMessageModel();
    if (Message) {
      const dbMessages = await Message.find().sort({ timestamp: -1 }).limit(50);
      return res.json(dbMessages.map((m: any) => ({ sender: m.sender, text: m.text, timestamp: m.timestamp })));
    }
    res.json(messages.slice(-50));
  } catch (err) {
    res.json(messages.slice(-50));
  }
});

app.post("/messages", async (req, res) => {
  const { sender, text } = req.body;
  const newMessage = { sender, text, timestamp: new Date() };
  
  try {
    const Message = getMessageModel();
    if (Message) {
      const saved = await Message.create(newMessage);
      return res.status(201).json({ sender: saved.sender, text: saved.text, timestamp: saved.timestamp });
    }
    messages.push(newMessage);
    if (messages.length > 100) messages = messages.slice(-100); // Keep last 100
    res.status(201).json(newMessage);
  } catch (err) {
    messages.push(newMessage);
    if (messages.length > 100) messages = messages.slice(-100);
    res.status(201).json(newMessage);
  }
});

// === UTILITY ROUTES ===
app.get("/weather/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
    const response = await axios.get(url, { timeout: 5000 });
    const data = response.data;
    const current = data.current_condition[0];
    res.json({ 
      city,
      temp: current.temp_C, 
      desc: current.weatherDesc[0].value,
      humidity: current.humidity,
      windSpeed: current.windspeedKmph
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

app.get("/quote", async (req, res) => {
  try {
    const response = await axios.get("https://api.quotable.io/random", { timeout: 5000 });
    res.json({ content: response.data.content, author: response.data.author });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quote", content: "The only way to do great work is to love what you do. - Steve Jobs" });
  }
});

app.get("/wiki/:query", async (req, res) => {
  try {
    const query = encodeURIComponent(req.params.query);
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${query}`;
    const response = await axios.get(url, { timeout: 5000 });
    const data = response.data;
    res.json({ title: data.title, extract: data.extract });
  } catch (err) {
    res.status(404).json({ error: "No summary found for this query" });
  }
});

app.get("/news", async (req, res) => {
  try {
    // Using a free news API - if this fails, return fallback
    const url = "https://newsapi.org/v2/top-headlines?country=us&pageSize=5";
    // Note: newsapi.org requires API key, so let's use an alternative free source
    // Using RSS2JSON or a public news endpoint
    res.json({ 
      news: [
        { title: "Voice companion is ready to help!", description: "Ask me about weather, quotes, tasks, and more!" }
      ],
      message: "News API integration - you can add your free API key in the future"
    });
  } catch (err) {
    res.json({ 
      news: [{ title: "News unavailable at the moment", description: "Try asking about weather, quotes, or Wikipedia instead!" }]
    });
  }
});

app.get("/joke", async (req, res) => {
  try {
    const response = await axios.get("https://v2.jokeapi.dev/joke/Any?type=single", { timeout: 5000 });
    res.json({ joke: response.data.joke || "Why did the voice assistant go to therapy? It had too many issues!" });
  } catch (err) {
    res.json({ joke: "Why did the voice assistant go to therapy? It had too many issues!" });
  }
});

app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
