// import React, { useState } from "react";
// import { createRoot } from "react-dom/client";

// function App() {
//   const [question, setQuestion] = useState("");
//   const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
//   const [loading, setLoading] = useState(false);

//   const sendQuestion = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!question.trim()) return;
//     setMessages((msgs) => [...msgs, { role: "user", content: question }]);
//     setLoading(true);
//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ question }),
//       });
//       const data = await res.json();
//       setMessages((msgs) => [...msgs, { role: "assistant", content: data.answer }]);
//     } catch (err) {
//       setMessages((msgs) => [
//         ...msgs,
//         { role: "assistant", content: "Error: " + (err as Error).message },
//       ]);
//     }
//     setQuestion("");
//     setLoading(false);
//   };

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         width: "100vw",
//         boxSizing: "border-box",
//         background: "#f8f9fa",
//         fontFamily: "sans-serif",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <h2 style={{ textAlign: "center", margin: "2rem 0 1rem 0" }}>Ollama MCP Web Chat</h2>
//       <div
//         style={{
//           flex: 1,
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "stretch",
//         }}
//       >
//         <div
//           style={{
//             background: "#fff",
//             border: "1px solid #ccc",
//             borderRadius: 8,
//             padding: 24,
//             width: "100%",
//             maxWidth: 800,
//             margin: "0 16px",
//             minHeight: 0,
//             display: "flex",
//             flexDirection: "column",
//           }}
//         >
//           <div
//             style={{
//               flex: 1,
//               overflowY: "auto",
//               minHeight: 400,
//               marginBottom: 16,
//             }}
//           >
//             {messages.map((msg, i) => (
//               <div key={i} style={{ margin: "8px 0" }}>
//                 <b>{msg.role === "user" ? "You" : "AI"}:</b> <span>{msg.content}</span>
//               </div>
//             ))}
//             {loading && <div>Loading...</div>}
//           </div>
//           <form onSubmit={sendQuestion} style={{ display: "flex" }}>
//             <input
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//               placeholder="Ask a question about your data..."
//               style={{
//                 flex: 1,
//                 padding: 12,
//                 fontSize: 16,
//                 borderRadius: 4,
//                 border: "1px solid #ccc",
//               }}
//               disabled={loading}
//             />
//             <button
//               type="submit"
//               disabled={loading || !question.trim()}
//               style={{
//                 marginLeft: 8,
//                 padding: "0 24px",
//                 fontSize: 16,
//                 borderRadius: 4,
//                 border: "none",
//                 background: "#1976d2",
//                 color: "#fff",
//                 cursor: loading || !question.trim() ? "not-allowed" : "pointer",
//                 transition: "background 0.2s",
//                 height: 44,
//               }}
//             >
//               Send
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// const root = createRoot(document.getElementById("root")!);
// root.render(<App />);



import React, { useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string; raw?: any }[]>([]);
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
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: data.answer, raw: data }
      ]);
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
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        boxSizing: "border-box",
        background: "#f8f9fa",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 style={{ textAlign: "center", margin: "2rem 0 1rem 0" }}>Ollama MCP Web Chat</h2>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 24,
            width: "100%",
            maxWidth: 800,
            margin: "0 16px",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              minHeight: 400,
              marginBottom: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {/* {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    background: msg.role === "user" ? "#1976d2" : "#e0e0e0",
                    color: msg.role === "user" ? "#fff" : "#222",
                    borderRadius: 12,
                    padding: "10px 16px",
                    maxWidth: "80%",
                    textAlign: msg.role === "user" ? "right" : "left",
                    marginBottom: 2,
                  }}
                >
                  <b>{msg.role === "user" ? "You" : "AI"}:</b> <span>{msg.content}</span>
                </div>
                {msg.role === "assistant" && msg.raw && (
                  <pre
                    style={{
                      background: "#f4f4f4",
                      color: "#333",
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 14,
                      marginTop: 4,
                      maxWidth: "80%",
                      overflowX: "auto",
                    }}
                  >
                    {JSON.stringify(msg.raw, null, 2)}
                  </pre>
                )}
              </div>
            ))} */}

            {
  messages.map((msg, i) => {
    // Try to parse the answer as JSON array
    let parsed: any[] | null = null;
    if (msg.role === "assistant" && msg.content) {
      try {
        const tryParse = typeof msg.content === "string" ? JSON.parse(msg.content) : msg.content;
        if (Array.isArray(tryParse)) parsed = tryParse;
      } catch {
        // ignore
      }
    }

    return (
      <div
        key={i}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: msg.role === "user" ? "flex-end" : "flex-start",
        }}
      >
        <div
          style={{
            background: msg.role === "user" ? "#1976d2" : "#e0e0e0",
            color: msg.role === "user" ? "#fff" : "#222",
            borderRadius: 12,
            padding: "10px 16px",
            maxWidth: "80%",
            textAlign: msg.role === "user" ? "right" : "left",
            marginBottom: 2,
            whiteSpace: "pre-line",
          }}
        >
          <b>{msg.role === "user" ? "You" : "AI"}:</b>{" "}
          {parsed ? (
            // Render as table if parsed is an array of objects
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    {Object.keys(parsed[0] || {}).map((col) => (
                      <th
                        key={col}
                        style={{
                          border: "1px solid #bbb",
                          padding: "4px 8px",
                          background: "#f0f0f0",
                          fontWeight: "bold",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, j) => (
                        <td
                          key={j}
                          style={{
                            border: "1px solid #bbb",
                            padding: "4px 8px",
                            background: "#fff",
                          }}
                        >
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <span>{msg.content}</span>
          )}
        </div>
        {msg.role === "assistant" && msg.raw && (
          <pre
            style={{
              background: "#f4f4f4",
              color: "#333",
              borderRadius: 8,
              padding: 12,
              fontSize: 14,
              marginTop: 4,
              maxWidth: "80%",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(msg.raw, null, 2)}
          </pre>
        )}
      </div>
    );
  })
}
            {loading && <div>Loading...</div>}
          </div>
          <form onSubmit={sendQuestion} style={{ display: "flex" }}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your data..."
              style={{
                flex: 1,
                padding: 12,
                fontSize: 16,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              style={{
                marginLeft: 8,
                padding: "0 24px",
                fontSize: 16,
                borderRadius: 4,
                border: "none",
                background: "#1976d2",
                color: "#fff",
                cursor: loading || !question.trim() ? "not-allowed" : "pointer",
                transition: "background 0.2s",
                height: 44,
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);