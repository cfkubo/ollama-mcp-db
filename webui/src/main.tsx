import React, { useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", content: question }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "Error: " + (err as Error).message },
      ]);
    }
    setQuestion("");
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Ollama MCP Web Chat</h2>
      <div style={{ border: "1px solid #ccc", padding: 16, minHeight: 300 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ margin: "8px 0" }}>
            <b>{msg.role === "user" ? "You" : "AI"}:</b> <span>{msg.content}</span>
          </div>
        ))}
        {loading && <div>Loading...</div>}
      </div>
      <form onSubmit={sendQuestion} style={{ marginTop: 16, display: "flex" }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your data..."
          style={{ flex: 1, padding: 8 }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !question.trim()} style={{ marginLeft: 8 }}>
          Send
        </button>
      </form>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);