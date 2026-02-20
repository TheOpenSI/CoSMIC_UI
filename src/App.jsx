import { useRef, useState } from "react";

// We call the backend in the same container at /api/chat
const API_PATH = "/api/chat";

// Default user; you can also pass this from the backend if you prefer.
const DEFAULT_USER = {
  id: 2,
  role: "user",
  email: "carlos.noschangkuhn@canberra.edu.au",
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  const addMessage = (role, text) => {
    setMessages((prev) => [...prev, { role, text }]);
    setTimeout(scrollToBottom, 0);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    addMessage("user", userMessage);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_PATH, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_message: userMessage,
          user: DEFAULT_USER, // backend will wrap this in body.user
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        // Prefer Cosmic's { status, result } response
        const reply =
        data.result ??
        data.reply ??
        data.answer ??
        data.message ??
        // if backend wrapped non-JSON as { raw: "..." }
        data.raw ??
        JSON.stringify(data);

        addMessage("assistant", reply);
      } else {
        addMessage("assistant", await res.text());
      }
    } catch (err) {
      addMessage("assistant", `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Academic Governance Chat</h1>

      <div
        ref={chatRef}
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          height: 420,
          overflowY: "auto",
          background: "#fafafa",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "8px 0" }}>
            <strong style={{ color: m.role === "user" ? "#0b6" : "#06c" }}>
              {m.role === "user" ? "You" : "Bot"}:
            </strong>{" "}
            <span style={{ whiteSpace: "pre-wrap" }}>{m.text}</span>
          </div>
        ))}
        {loading && <div style={{ color: "#999" }}>Thinking…</div>}
      </div>

      <form onSubmit={sendMessage} style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          type="text"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
          autoFocus
        />
        <button type="submit" disabled={loading} style={{ padding: "10px 16px" }}>
          Send
        </button>
      </form>
    </div>
  );
}