"use client";
import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  sender: string;
  text: string;
  timestamp?: Date;
}

interface Task {
  id: string | number;
  text: string;
  done?: boolean;
}

export default function Home() {
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<{ id: string | number; text: string }[]>([]);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const addMessage = (sender: string, text: string) => {
    const newMsg: Message = { sender, text, timestamp: new Date() };
    setMessages((prev) => [...prev, newMsg]);
    
    // Save to backend
    fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, text }),
    }).catch(() => {});
  };

  const speak = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      synthRef.current.speak(utterance);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/messages`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data.reverse());
      }
    } catch (err) {}
  };

  const loadTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (err) {}
  };

  const loadNotes = async () => {
    try {
      const res = await fetch(`${API_URL}/notes`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotes(data);
      }
    } catch (err) {}
  };

  const clearChat = () => {
    setMessages([]);
  };

  const deleteTask = async (id: string | number) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
      await loadTasks();
    } catch (err) {
      addMessage("System", "Failed to delete task.");
    }
  };

  const clearAllTasks = async () => {
    try {
      await fetch(`${API_URL}/tasks`, { method: "DELETE" });
      await loadTasks();
      addMessage("Bot", "All tasks cleared.");
      speak("All tasks cleared.");
    } catch (err) {
      addMessage("System", "Failed to clear tasks.");
    }
  };

  const toggleTask = async (id: string | number, done: boolean) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done }),
      });
      await loadTasks();
    } catch (err) {
      addMessage("System", "Failed to update task.");
    }
  };

  const deleteNote = async (id: string | number) => {
    try {
      await fetch(`${API_URL}/notes/${id}`, { method: "DELETE" });
      await loadNotes();
    } catch (err) {
      addMessage("System", "Failed to delete note.");
    }
  };

  const clearAllNotes = async () => {
    try {
      await fetch(`${API_URL}/notes`, { method: "DELETE" });
      await loadNotes();
      addMessage("Bot", "All notes cleared.");
      speak("All notes cleared.");
    } catch (err) {
      addMessage("System", "Failed to clear notes.");
    }
  };

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      addMessage("System", "Your browser does not support voice input. Use Chrome or Edge.");
      loadMessages();
      loadTasks();
      loadNotes();
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e: any) => {
      setListening(false);
      addMessage("System", `Error: ${e.error}`);
    };
    recognition.onresult = async (e: any) => {
      const transcript = e.results[0][0].transcript;
      addMessage("You", transcript);
      await handleCommand(transcript.toLowerCase());
    };

    recognitionRef.current = recognition;
    
    // Load conversation history
    loadMessages();
    loadTasks();
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCommand = async (text: string) => {
    let reply = "";

    // Weather
    if (text.includes("weather")) {
      const cityMatch = text.match(/weather in (.+)/i) || text.match(/weather (.+)/i);
      const city = cityMatch ? cityMatch[1].trim() : "delhi";
      try {
        const res = await fetch(`${API_URL}/weather/${city}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        reply = `Weather in ${data.city}: ${data.temp}°C, ${data.desc}. Humidity: ${data.humidity}%`;
      } catch (err) {
        reply = "Sorry, I couldn't fetch the weather right now.";
      }
    }
    // Quote
    else if (text.includes("quote") || text.includes("inspiration")) {
      try {
        const res = await fetch(`${API_URL}/quote`);
        const data = await res.json();
        reply = `${data.content} - ${data.author || "Unknown"}`;
      } catch (err) {
        reply = "The only way to do great work is to love what you do. - Steve Jobs";
      }
    }
    // Joke
    else if (text.includes("joke") || text.includes("funny")) {
      try {
        const res = await fetch(`${API_URL}/joke`);
        const data = await res.json();
        reply = data.joke || "Why did the voice assistant go to therapy? It had too many issues!";
      } catch (err) {
        reply = "Why did the voice assistant go to therapy? It had too many issues!";
      }
    }
    // Wikipedia
    else if (text.includes("wiki") || text.includes("tell me about") || text.includes("what is")) {
      let query = text.replace(/wiki|tell me about|what is/gi, "").trim();
      if (!query) query = "artificial intelligence";
      try {
        const res = await fetch(`${API_URL}/wiki/${query}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        reply = `${data.title}: ${data.extract.substring(0, 200)}...`;
      } catch (err) {
        reply = `Sorry, I couldn't find information about ${query}.`;
      }
    }
    // Task
    else if (text.includes("task") || text.includes("todo") || text.includes("remind me")) {
      const taskText = text.replace(/task|todo|remind me to|add/gi, "").trim();
      if (taskText) {
        try {
          await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: taskText, done: false }),
          });
          await loadTasks();
          reply = `Task added: ${taskText}`;
        } catch (err) {
          reply = "Failed to add task.";
        }
      } else {
        reply = "What task would you like me to add?";
      }
    }
    // Note
    else if (text.includes("note") || text.includes("remember") || text.includes("save")) {
      const noteText = text.replace(/note|remember|save that/gi, "").trim();
      if (noteText) {
        try {
          await fetch(`${API_URL}/notes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: noteText }),
          });
          await loadNotes();
          reply = `Note saved: ${noteText}`;
        } catch (err) {
          reply = "Failed to save note.";
        }
      } else {
        reply = "What would you like me to remember?";
      }
    }
    // Math
    else if (text.includes("calculate") || text.includes("math") || /[\d\+\-\*\/\(\)]/.test(text)) {
      try {
        let mathExpr = text.match(/[\d\+\-\*\/\(\)\.\s]+/g)?.[0]?.replace(/\s/g, "") || "";
        // Replace words with operators
        mathExpr = mathExpr.replace(/plus/gi, "+").replace(/minus/gi, "-").replace(/times|multiplied by/gi, "*").replace(/divided by|divide/gi, "/");
        if (mathExpr && /^[\d\+\-\*\/\(\)\.]+$/.test(mathExpr)) {
          // Safe eval using Function constructor
          const result = new Function(`return ${mathExpr}`)();
          reply = `The result is ${result}`;
        } else {
          reply = "I couldn't understand that calculation. Try saying numbers and operators.";
        }
      } catch (err) {
        reply = "Sorry, I couldn't calculate that.";
      }
    }
    // Greeting
    else if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
      reply = "Hello! I'm your voice companion. I can help with weather, quotes, tasks, notes, Wikipedia searches, jokes, and math!";
    }
    // Help
    else if (text.includes("help") || text.includes("what can you do")) {
      reply = "I can: Get weather (say 'weather in [city]'), tell quotes, jokes, search Wikipedia (say 'wiki [topic]'), manage tasks and notes, calculate math, and remember our conversation!";
    }
    // Default
    else {
      reply = "I can help with weather, quotes, tasks, notes, Wikipedia, jokes, or math. Try saying one of those, or ask for help!";
    }

    addMessage("Bot", reply);
    speak(reply);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">🧠 Voice Companion</h1>
        <p className="text-center text-indigo-100 mb-6">Your smart AI assistant powered by voice</p>

        {/* Control Buttons */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={listening ? stopListening : startListening}
            className={`px-8 py-4 rounded-xl text-xl font-semibold shadow-2xl transition-all ${
              listening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-green-500 hover:bg-green-600"
            } disabled:opacity-50`}
          >
            {listening ? "🛑 Stop Listening" : "🎤 Start Talking"}
          </button>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="px-6 py-4 rounded-xl text-lg font-semibold shadow-2xl bg-gray-600 hover:bg-gray-700 transition-all"
            >
              🧹 Clear Chat
            </button>
          )}
        </div>

        {/* Messages/Chat */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 flex items-center justify-between">
            <span>💬 Conversation</span>
            {messages.length > 0 && (
              <span className="text-sm font-normal text-white/70">{messages.length} messages</span>
            )}
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-white/70">No messages yet. Start talking to begin!</p>
            ) : (
              messages.slice(-10).map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg ${
                    m.sender === "You"
                      ? "bg-blue-500/30 ml-4"
                      : m.sender === "Bot"
                      ? "bg-green-500/30 mr-4"
                      : "bg-gray-500/30"
                  }`}
                >
                  <span className="font-semibold">{m.sender}:</span> {m.text}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tasks & Notes */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Tasks */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">✅ Tasks ({tasks.length})</h2>
              {tasks.length > 0 && (
                <button
                  onClick={clearAllTasks}
                  className="text-xs bg-red-500/50 hover:bg-red-500/70 px-2 py-1 rounded transition-all"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-white/70 text-sm">No tasks. Say 'add task [description]' to create one!</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                      task.done ? "bg-gray-500/30" : "bg-blue-500/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.done || false}
                      onChange={(e) => toggleTask(task.id, e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span
                      className={`flex-1 ${task.done ? "line-through text-white/60" : ""}`}
                    >
                      {task.text}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-300 hover:text-red-100 transition-colors text-lg"
                      title="Delete task"
                    >
                      ❌
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">📝 Notes ({notes.length})</h2>
              {notes.length > 0 && (
                <button
                  onClick={clearAllNotes}
                  className="text-xs bg-red-500/50 hover:bg-red-500/70 px-2 py-1 rounded transition-all"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-white/70 text-sm">No notes. Say 'note [content]' to save one!</p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/30 text-sm"
                  >
                    <span className="flex-1">{note.text}</span>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-300 hover:text-red-100 transition-colors text-lg"
                      title="Delete note"
                    >
                      ❌
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-3">🎯 Try Saying:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="bg-white/20 p-2 rounded">"Weather in London"</div>
            <div className="bg-white/20 p-2 rounded">"Tell me a quote"</div>
            <div className="bg-white/20 p-2 rounded">"Tell me a joke"</div>
            <div className="bg-white/20 p-2 rounded">"Wiki AI"</div>
            <div className="bg-white/20 p-2 rounded">"Add task buy milk"</div>
            <div className="bg-white/20 p-2 rounded">"Note meeting at 3pm"</div>
            <div className="bg-white/20 p-2 rounded">"Calculate 25 plus 17"</div>
            <div className="bg-white/20 p-2 rounded">"Help"</div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center mt-4 text-sm text-white/70">
          API: {API_URL} | Messages: {messages.length} | Tasks: {tasks.length} | Notes: {notes.length}
        </div>
      </div>
    </main>
  );
}
