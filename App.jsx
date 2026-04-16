import { useState, useRef, useEffect } from "react";

const SUBJECTS = [
  { id: "math", label: "Mathematics", emoji: "📐", color: "#FF6B6B" },
  { id: "science", label: "Science", emoji: "🔬", color: "#4ECDC4" },
  { id: "history", label: "History", emoji: "🏛️", color: "#FFE66D" },
  { id: "english", label: "English", emoji: "📚", color: "#A8E6CF" },
  { id: "geography", label: "Geography", emoji: "🌍", color: "#88D8B0" },
  { id: "coding", label: "Coding", emoji: "💻", color: "#C3A6FF" },
  { id: "computing", label: "Computing", emoji: "🖥️", color: "#60D9FA" },
  { id: "art", label: "Art", emoji: "🎨", color: "#FFB347" },
  { id: "other", label: "Other", emoji: "✨", color: "#87CEEB" },
];

const MODES = { CHAT: "chat", QA: "qa" };

// ✅ Your Anthropic API key is read from the environment variable
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "10px 0" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#C3A6FF", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 14, animation: "fadeSlideIn 0.3s ease" }}>
      {!isUser && (
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #C3A6FF, #7B68EE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, marginRight: 10, boxShadow: "0 2px 8px rgba(195,166,255,0.4)" }}>🎓</div>
      )}
      <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: isUser ? "linear-gradient(135deg, #7B68EE, #C3A6FF)" : "rgba(255,255,255,0.07)", color: "#F0EEFF", fontSize: 14.5, lineHeight: 1.6, border: isUser ? "none" : "1px solid rgba(195,166,255,0.15)", boxShadow: isUser ? "0 4px 15px rgba(123,104,238,0.3)" : "0 2px 8px rgba(0,0,0,0.2)", whiteSpace: "pre-wrap" }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [mode, setMode] = useState(MODES.CHAT);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startChat = (subject) => {
    setSelectedSubject(subject);
    setMessages([{ role: "assistant", content: `Hi there! 👋 I'm your ${subject.label} tutor. Ask me anything — questions, homework, concepts, or practice problems. I'm here to help you learn!` }]);
    setScreen("chat");
  };

  const startQA = (subject) => {
    setSelectedSubject(subject);
    setQaQuestion("");
    setQaAnswer("");
    setScreen("qa");
  };

  const callAPI = async (systemPrompt, msgs) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: msgs,
      }),
    });
    const data = await response.json();
    return data.content?.find((c) => c.type === "text")?.text || "Sorry, I couldn't generate a response.";
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const reply = await callAPI(
        `You are a friendly, encouraging AI tutor for students specializing in ${selectedSubject.label}. Explain concepts clearly, step-by-step. When helping with homework, guide the student to understand — don't just give answers. Use examples and analogies. Keep responses concise but complete.`,
        newMessages.map((m) => ({ role: m.role, content: m.content }))
      );
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Oops! Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  const askQA = async () => {
    if (!qaQuestion.trim() || qaLoading) return;
    setQaLoading(true);
    setQaAnswer("");
    try {
      const reply = await callAPI(
        `You are a helpful AI tutor for students in ${selectedSubject.label}. Answer the student's question clearly and concisely. If it's a homework problem, explain how to solve it step by step. Be encouraging and educational.`,
        [{ role: "user", content: qaQuestion }]
      );
      setQaAnswer(reply);
    } catch {
      setQaAnswer("Oops! Something went wrong. Please try again.");
    }
    setQaLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0D0B1E 0%, #1A1535 50%, #0F1729 100%)", fontFamily: "'Georgia', 'Times New Roman', serif", color: "#F0EEFF", position: "relative", overflow: "hidden" }}>

      {/* Background stars */}
      {[...Array(30)].map((_, i) => (
        <div key={i} style={{ position: "fixed", width: (i % 3) + 1 + "px", height: (i % 3) + 1 + "px", borderRadius: "50%", background: "white", left: (i * 37 % 100) + "%", top: (i * 53 % 100) + "%", opacity: 0.2 + (i % 5) * 0.1, animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`, animationDelay: (i % 3) + "s", pointerEvents: "none" }} />
      ))}

      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes bounce { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-6px); } }
        @keyframes twinkle { 0%,100% { opacity:0.1; } 50% { opacity:0.7; } }
        @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-10px); } }
        @keyframes pulse { 0%,100% { box-shadow:0 0 0 0 rgba(195,166,255,0.4); } 50% { box-shadow:0 0 0 12px rgba(195,166,255,0); } }
        textarea:focus, input:focus { outline:none; }
        .subject-card:hover { transform:translateY(-4px) scale(1.02); }
        .mode-btn:hover { transform:scale(1.03); }
      `}</style>

      {/* HOME SCREEN */}
      {screen === "home" && (
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "40px 24px", animation: "fadeSlideIn 0.5s ease" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 12, animation: "float 3s ease-in-out infinite" }}>🎓</div>
            <h1 style={{ fontSize: 32, fontWeight: "bold", margin: 0, background: "linear-gradient(90deg, #C3A6FF, #87CEEB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Hosny AI</h1>
            <p style={{ color: "rgba(195,166,255,0.9)", marginTop: 4, fontSize: 14, fontWeight: "bold", letterSpacing: 0.5 }}>Kiddycare Paradise School</p>
            <p style={{ color: "rgba(195,166,255,0.5)", marginTop: 4, fontSize: 13 }}>Your personal AI tutor — anytime, anywhere</p>
          </div>

          <div style={{ marginBottom: 32 }}>
            <p style={{ color: "rgba(240,238,255,0.6)", fontSize: 13, textAlign: "center", marginBottom: 14, letterSpacing: 1, textTransform: "uppercase" }}>Choose your mode</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[{ m: MODES.CHAT, emoji: "💬", title: "Tutor Chat", desc: "Have a full conversation with your AI tutor" }, { m: MODES.QA, emoji: "❓", title: "Quick Answer", desc: "Ask one question, get a direct answer" }].map(({ m, emoji, title, desc }) => (
                <button key={m} className="mode-btn" onClick={() => setMode(m)} style={{ background: mode === m ? "linear-gradient(135deg, rgba(123,104,238,0.4), rgba(195,166,255,0.2))" : "rgba(255,255,255,0.04)", border: mode === m ? "1px solid rgba(195,166,255,0.5)" : "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 12px", cursor: "pointer", color: "#F0EEFF", textAlign: "center", transition: "all 0.25s ease", animation: mode === m ? "pulse 2s infinite" : "none" }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{emoji}</div>
                  <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 11.5, color: "rgba(195,166,255,0.6)", lineHeight: 1.4 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p style={{ color: "rgba(240,238,255,0.6)", fontSize: 13, textAlign: "center", marginBottom: 14, letterSpacing: 1, textTransform: "uppercase" }}>Pick a subject</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {SUBJECTS.map((s) => (
                <button key={s.id} className="subject-card" onClick={() => mode === MODES.CHAT ? startChat(s) : startQA(s)} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${s.color}33`, borderRadius: 14, padding: "14px 8px", cursor: "pointer", color: "#F0EEFF", textAlign: "center", transition: "all 0.25s ease" }}>
                  <div style={{ fontSize: 26, marginBottom: 5 }}>{s.emoji}</div>
                  <div style={{ fontSize: 11, color: s.color, fontWeight: "bold" }}>{s.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHAT SCREEN */}
      {screen === "chat" && (
        <div style={{ maxWidth: 600, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(195,166,255,0.1)", display: "flex", alignItems: "center", gap: 12, background: "rgba(13,11,30,0.8)", backdropFilter: "blur(12px)" }}>
            <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: "rgba(195,166,255,0.7)", cursor: "pointer", fontSize: 22, padding: 0, lineHeight: 1 }}>←</button>
            <div style={{ fontSize: 26 }}>{selectedSubject?.emoji}</div>
            <div>
              <div style={{ fontWeight: "bold", fontSize: 15 }}>{selectedSubject?.label} Tutor</div>
              <div style={{ fontSize: 12, color: "rgba(195,166,255,0.6)" }}>Hosny AI • Kiddycare Paradise School</div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #C3A6FF, #7B68EE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎓</div>
                <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "18px 18px 18px 4px", padding: "8px 16px", border: "1px solid rgba(195,166,255,0.15)" }}><TypingDots /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(195,166,255,0.1)", background: "rgba(13,11,30,0.9)", backdropFilter: "blur(12px)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Ask anything... (Enter to send)" rows={1} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(195,166,255,0.2)", borderRadius: 14, padding: "12px 16px", color: "#F0EEFF", fontSize: 14, resize: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 120 }} />
              <button onClick={sendMessage} disabled={!input.trim() || loading} style={{ background: input.trim() && !loading ? "linear-gradient(135deg, #7B68EE, #C3A6FF)" : "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, width: 44, height: 44, cursor: input.trim() && !loading ? "pointer" : "default", fontSize: 20, transition: "all 0.2s ease", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>➤</button>
            </div>
          </div>
        </div>
      )}

      {/* Q&A SCREEN */}
      {screen === "qa" && (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 0 40px", animation: "fadeSlideIn 0.4s ease" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(195,166,255,0.1)", display: "flex", alignItems: "center", gap: 12, background: "rgba(13,11,30,0.8)", backdropFilter: "blur(12px)", marginBottom: 24 }}>
            <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: "rgba(195,166,255,0.7)", cursor: "pointer", fontSize: 22, padding: 0, lineHeight: 1 }}>←</button>
            <div style={{ fontSize: 26 }}>{selectedSubject?.emoji}</div>
            <div>
              <div style={{ fontWeight: "bold", fontSize: 15 }}>{selectedSubject?.label} — Quick Answer</div>
              <div style={{ fontSize: 12, color: "rgba(195,166,255,0.6)" }}>One question, one clear answer</div>
            </div>
          </div>
          <div style={{ padding: "0 20px" }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "rgba(195,166,255,0.8)", fontSize: 13, marginBottom: 8, letterSpacing: 0.5 }}>YOUR QUESTION</label>
              <textarea value={qaQuestion} onChange={(e) => setQaQuestion(e.target.value)} placeholder={`Type your ${selectedSubject?.label} question here...\n\nE.g. "What is photosynthesis?" or "Solve: 3x + 5 = 20"`} rows={5} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(195,166,255,0.2)", borderRadius: 14, padding: "14px 16px", color: "#F0EEFF", fontSize: 14.5, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box" }} />
            </div>
            <button onClick={askQA} disabled={!qaQuestion.trim() || qaLoading} style={{ width: "100%", padding: "14px", background: qaQuestion.trim() && !qaLoading ? "linear-gradient(135deg, #7B68EE, #C3A6FF)" : "rgba(255,255,255,0.08)", border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: "bold", cursor: qaQuestion.trim() && !qaLoading ? "pointer" : "default", transition: "all 0.25s ease", marginBottom: 24, fontFamily: "inherit" }}>
              {qaLoading ? "Thinking..." : "✨ Get Answer"}
            </button>
            {(qaLoading || qaAnswer) && (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(195,166,255,0.2)", borderRadius: 16, padding: "20px", animation: "fadeSlideIn 0.4s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ fontSize: 22 }}>🎓</div>
                  <div style={{ color: "#C3A6FF", fontWeight: "bold", fontSize: 14 }}>Hosny AI's Answer</div>
                </div>
                {qaLoading ? <TypingDots /> : <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75, color: "rgba(240,238,255,0.9)", whiteSpace: "pre-wrap" }}>{qaAnswer}</p>}
                {!qaLoading && (
                  <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                    <button onClick={() => { setQaQuestion(""); setQaAnswer(""); }} style={{ background: "rgba(195,166,255,0.1)", border: "1px solid rgba(195,166,255,0.2)", borderRadius: 10, padding: "8px 16px", color: "#C3A6FF", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>New Question</button>
                    <button onClick={() => startChat(selectedSubject)} style={{ background: "rgba(123,104,238,0.2)", border: "1px solid rgba(123,104,238,0.3)", borderRadius: 10, padding: "8px 16px", color: "#A08EFF", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Continue in Chat 💬</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
